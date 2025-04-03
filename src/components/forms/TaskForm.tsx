import { PlusOutlined } from '@ant-design/icons'
import { Button, DatePicker, Form, Input, Select, Space, Tag } from 'antd'
import type { InputRef } from 'antd/es/input'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { Goal, Task } from '../../types/goals'

interface TaskFormProps {
  initialValues?: Partial<Task>
  goals: Goal[] // 可用的目标列表，用于关联
  onFinish: (values: Omit<Task, 'key'>) => void
  onCancel?: () => void
  loading?: boolean
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  goals,
  onFinish,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm()
  const [tags, setTags] = useState<string[]>(initialValues?.tags || [])
  const [inputValue, setInputValue] = useState('')
  const [inputVisible, setInputVisible] = useState(false)
  const inputRef = React.useRef<InputRef>(null)

  // 处理添加新标签
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue])
      form.setFieldsValue({ tags: [...tags, inputValue] })
    }
    setInputVisible(false)
    setInputValue('')
  }

  const showInput = () => {
    setInputVisible(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag)
    setTags(newTags)
    form.setFieldsValue({ tags: newTags })
  }

  const handleFormFinish = (values: any) => {
    // 找到选中目标的名称，用于显示
    const selectedGoal = goals.find((goal) => goal.id === values.goalId)

    const formattedValues = {
      ...values,
      deadline: values.deadline.format('YYYY-MM-DD'),
      tags: tags,
      relatedGoal: selectedGoal ? selectedGoal.name : '',
    }
    onFinish(formattedValues)
  }

  // 当选择目标ID变化时，更新关联目标的名称
  const handleGoalChange = (goalId: string) => {
    const selectedGoal = goals.find((goal) => goal.id === goalId)
    if (selectedGoal) {
      form.setFieldsValue({ relatedGoal: selectedGoal.name })
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      initialValues={{
        ...initialValues,
        deadline: initialValues?.deadline
          ? dayjs(initialValues.deadline)
          : undefined,
      }}
    >
      <Form.Item
        label="任务名称"
        name="name"
        rules={[{ required: true, message: '请输入任务名称' }]}
      >
        <Input placeholder="请输入任务名称" />
      </Form.Item>

      <Form.Item
        label="关联目标"
        name="goalId"
        rules={[{ required: true, message: '请选择关联目标' }]}
      >
        <Select
          placeholder="选择关联的学习目标"
          onChange={handleGoalChange}
          optionFilterProp="children"
          showSearch
        >
          {goals.map((goal) => (
            <Select.Option
              key={goal.id}
              value={goal.id}
            >
              {goal.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="截止日期"
        name="deadline"
        rules={[{ required: true, message: '请选择截止日期' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="选择截止日期"
          format="YYYY-MM-DD"
        />
      </Form.Item>

      <Form.Item
        label="优先级"
        name="priority"
        rules={[{ required: true, message: '请选择优先级' }]}
      >
        <Select placeholder="选择优先级">
          <Select.Option value="高">高</Select.Option>
          <Select.Option value="中">中</Select.Option>
          <Select.Option value="低">低</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="状态"
        name="status"
        rules={[{ required: true, message: '请选择状态' }]}
        initialValue="未开始"
      >
        <Select placeholder="选择状态">
          <Select.Option value="未开始">未开始</Select.Option>
          <Select.Option value="进行中">进行中</Select.Option>
          <Select.Option value="已完成">已完成</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="标签"
        name="tags"
      >
        <div className="tags-container">
          {tags.map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleClose(tag)}
              style={{ marginBottom: 8 }}
            >
              {tag}
            </Tag>
          ))}
          {inputVisible ? (
            <Input
              ref={inputRef}
              type="text"
              size="small"
              style={{ width: 78, marginBottom: 8 }}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputConfirm}
              onPressEnter={handleInputConfirm}
            />
          ) : (
            <Tag
              onClick={showInput}
              style={{
                background: '#fff',
                borderStyle: 'dashed',
                marginBottom: 8,
              }}
            >
              <PlusOutlined /> 新标签
            </Tag>
          )}
        </div>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          {onCancel && <Button onClick={onCancel}>取消</Button>}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            提交
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default TaskForm
