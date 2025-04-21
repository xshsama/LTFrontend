import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Select, Space, Tag, theme } from 'antd'
import React, { useState } from 'react'
import { Category, Goal } from '../../types/goals'

interface GoalFormProps {
  initialValues?: Partial<Goal>
  subjects: { id: number; title: string }[]
  categories: Category[]
  onFinish: (values: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel?: () => void
  loading?: boolean
}

const GoalForm: React.FC<GoalFormProps> = ({
  initialValues,
  subjects,
  categories,
  onFinish,
  onCancel,
  loading = false,
}) => {
  const { token } = theme.useToken()
  const [form] = Form.useForm()
  const [tags, setTags] = useState<string[]>(initialValues?.tags || [])
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const filteredCategories = initialValues?.subjectId
    ? categories.filter((cat) => cat.subjectId === initialValues.subjectId)
    : []

  const handleFormFinish = (values: any) => {
    const formattedValues = {
      ...values,
      completionDate: values.completionDate
        ? values.completionDate.format('YYYY-MM-DD')
        : undefined,
      status: values.status || 'NOT_STARTED',
      priority: values.priority || 'MEDIUM',
      progress: values.progress || 0,
      tags: tags, // 将标签数组添加到表单提交数据中
    }
    onFinish(formattedValues)
  }

  // 标签相关方法
  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag)
    setTags(newTags)
  }

  const showInput = () => {
    setInputVisible(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue])
    }
    setInputVisible(false)
    setInputValue('')
  }

  // 当选择学科变化时，过滤对应的分类选项
  const handleSubjectChange = (subjectId: number) => {
    form.setFieldsValue({ categoryId: undefined })
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      initialValues={{
        ...initialValues,
        progress: initialValues?.progress || 0,
        priority: initialValues?.priority || 'MEDIUM',
        status: initialValues?.status || 'NOT_STARTED',
      }}
    >
      <Form.Item
        label="所属学科"
        name="subjectId"
        rules={[{ required: true, message: '请选择所属学科' }]}
      >
        <Select
          placeholder="选择所属学科"
          onChange={handleSubjectChange}
          optionFilterProp="children"
          showSearch
        >
          {subjects.map((subject) => (
            <Select.Option
              key={subject.id}
              value={subject.id}
            >
              {subject.title}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="目标名称"
        name="title"
        rules={[{ required: true, message: '请输入目标名称' }]}
      >
        <Input placeholder="请输入学习目标名称" />
      </Form.Item>

      {/* 标签输入区域 */}
      <Form.Item label="标签">
        <Space
          size={[0, 8]}
          wrap
        >
          {tags.map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleClose(tag)}
            >
              {tag}
            </Tag>
          ))}
          {inputVisible ? (
            <Input
              type="text"
              size="small"
              style={{ width: 78 }}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputConfirm}
              onPressEnter={handleInputConfirm}
              autoFocus
            />
          ) : (
            <Tag
              onClick={showInput}
              style={{ borderStyle: 'dashed' }}
            >
              <PlusOutlined /> 添加标签
            </Tag>
          )}
        </Space>
      </Form.Item>

      <Form.Item
        label="优先级"
        name="priority"
        rules={[{ required: true, message: '请选择优先级' }]}
      >
        <Select placeholder="选择优先级">
          <Select.Option value="HIGH">高</Select.Option>
          <Select.Option value="MEDIUM">中</Select.Option>
          <Select.Option value="LOW">低</Select.Option>
          <Select.Option value="URGENT">紧急</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="状态"
        name="status"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select placeholder="选择状态">
          <Select.Option value="NOT_STARTED">未开始</Select.Option>
          <Select.Option value="ONGOING">进行中</Select.Option>
          <Select.Option value="COMPLETED">已完成</Select.Option>
          <Select.Option value="EXPIRED">已过期</Select.Option>
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

export default GoalForm
