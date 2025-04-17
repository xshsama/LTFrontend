import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, InputNumber, Select, Space, Tag } from 'antd'
import type { InputRef } from 'antd/es/input'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { Goal, Tag as TagType, Task } from '../../types/goals'

interface TaskFormProps {
  initialValues?: Partial<Task>
  goals: Goal[] // 可用的目标列表，用于关联
  availableTags: TagType[] // 可用的标签列表
  onFinish: (values: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel?: () => void
  loading?: boolean
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  goals,
  availableTags,
  onFinish,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm()
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initialValues?.tags?.map((tag) => tag.id) || [],
  )
  const [inputValue, setInputValue] = useState('')
  const [inputVisible, setInputVisible] = useState(false)
  const inputRef = React.useRef<InputRef>(null)

  // 处理添加新标签
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = () => {
    // 在实际应用中，这里可能需要先创建新标签，然后添加
    setInputVisible(false)
    setInputValue('')
  }

  const showInput = () => {
    setInputVisible(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const handleTagSelect = (tagId: number) => {
    if (!selectedTagIds.includes(tagId)) {
      const newSelectedTagIds = [...selectedTagIds, tagId]
      setSelectedTagIds(newSelectedTagIds)
      form.setFieldsValue({
        tagIds: newSelectedTagIds,
      })
    }
  }

  const handleTagDeselect = (tagId: number) => {
    const newSelectedTagIds = selectedTagIds.filter((id) => id !== tagId)
    setSelectedTagIds(newSelectedTagIds)
    form.setFieldsValue({
      tagIds: newSelectedTagIds,
    })
  }

  const handleFormFinish = (values: any) => {
    const formattedValues = {
      ...values,
      completionDate: values.completionDate
        ? values.completionDate.format('YYYY-MM-DD')
        : undefined,
      status: values.status || 'NOT_STARTED',
      weight: values.weight || 5,
      actualTimeMinutes: values.actualTimeMinutes || 0,
      estimatedTimeMinutes: values.estimatedTimeMinutes,
      tags: selectedTagIds.map(
        (id) => availableTags.find((tag) => tag.id === id)!,
      ),
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
        completionDate: initialValues?.completionDate
          ? dayjs(initialValues.completionDate)
          : undefined,
        status: initialValues?.status || 'NOT_STARTED',
        weight: initialValues?.weight || 5,
        actualTimeMinutes: initialValues?.actualTimeMinutes || 0,
        tagIds: initialValues?.tags?.map((tag) => tag.id) || [],
      }}
    >
      <Form.Item
        label="任务名称"
        name="title"
        rules={[{ required: true, message: '请输入任务名称' }]}
      >
        <Input placeholder="请输入任务名称" />
      </Form.Item>

      <Form.Item
        label="任务描述"
        name="description"
      >
        <Input.TextArea
          rows={3}
          placeholder="请输入任务描述（可选）"
        />
      </Form.Item>

      <Form.Item
        label="关联目标"
        name="goalId"
        rules={[{ required: true, message: '请选择关联目标' }]}
      >
        <Select
          placeholder="选择关联的学习目标"
          optionFilterProp="children"
          showSearch
        >
          {goals.map((goal) => (
            <Select.Option
              key={goal.id}
              value={goal.id}
            >
              {goal.title}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="权重"
        name="weight"
        rules={[
          { required: true, message: '请输入权重' },
          {
            type: 'number',
            min: 1,
            max: 10,
            message: '权重必须是1-10之间的数字',
          },
        ]}
      >
        <InputNumber
          min={1}
          max={10}
          style={{ width: '100%' }}
          placeholder="请输入1-10之间的权重值"
        />
      </Form.Item>

      <Form.Item
        label="状态"
        name="status"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select placeholder="选择状态">
          <Select.Option value="NOT_STARTED">未开始</Select.Option>
          <Select.Option value="IN_PROGRESS">进行中</Select.Option>
          <Select.Option value="COMPLETED">已完成</Select.Option>
          <Select.Option value="OVERDUE">已过期</Select.Option>
          <Select.Option value="CANCELLED">已取消</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="标签"
        name="tagIds"
      >
        <Select
          mode="multiple"
          placeholder="选择或创建标签"
          style={{ width: '100%' }}
          optionFilterProp="children"
          onSelect={handleTagSelect}
          onDeselect={handleTagDeselect}
          dropdownRender={(menu) => (
            <>
              {menu}
              <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onPressEnter={handleInputConfirm}
                  style={{ flex: 'auto' }}
                  placeholder="输入并回车以添加"
                />
                <a
                  style={{
                    flex: 'none',
                    padding: '0 8px',
                    display: 'block',
                    cursor: 'pointer',
                  }}
                  onClick={handleInputConfirm}
                >
                  <PlusOutlined /> 添加标签
                </a>
              </div>
            </>
          )}
        >
          {availableTags.map((tag) => (
            <Select.Option
              key={tag.id}
              value={tag.id}
            >
              <Tag color={tag.color || 'blue'}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </Select>
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
