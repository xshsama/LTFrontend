import { PlusOutlined } from '@ant-design/icons'
import { Button, DatePicker, Form, Input, Select, Space, Tag } from 'antd'
import type { InputRef } from 'antd/es/input'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { Goal } from '../../types/goals'

interface GoalFormProps {
  initialValues?: Partial<Goal>
  onFinish: (values: Omit<Goal, 'id' | 'key'>) => void
  onCancel?: () => void
  loading?: boolean
}

const GoalForm: React.FC<GoalFormProps> = ({
  initialValues,
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
    const formattedValues = {
      ...values,
      deadline: values.deadline.format('YYYY-MM-DD'),
      tags: tags,
    }
    onFinish(formattedValues)
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
        label="目标名称"
        name="name"
        rules={[{ required: true, message: '请输入目标名称' }]}
      >
        <Input placeholder="请输入学习目标名称" />
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
        label="课程ID"
        name="courseId"
      >
        <Input placeholder="关联的课程ID（可选）" />
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

export default GoalForm
