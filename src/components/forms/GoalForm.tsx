import { Button, Form, Input, Select, Space } from 'antd'
import React from 'react'
import { Category, Goal, Subject } from '../../types/goals'

interface GoalFormProps {
  initialValues?: Partial<Goal>
  subjects: Subject[]
  categories: Category[]
  onFinish: (values: {
    subjectId?: number
    title: string
    priority?: string
    categoryId?: number
    status?: 'ONGOING' | 'COMPLETED' | 'EXPIRED'
    description?: string
    targetDate?: Date
    progress?: number
  }) => void
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
  const [form] = Form.useForm()

  const filteredCategories = initialValues?.subjectId
    ? categories.filter((cat) => cat.subjectId === initialValues.subjectId)
    : []

  const handleFormFinish = (values: any) => {
    const formattedValues = {
      ...values,
      completionDate: values.completionDate
        ? values.completionDate.format('YYYY-MM-DD')
        : undefined,
      status: values.status || 'ONGOING',
      priority: values.priority || 'MEDIUM',
      progress: values.progress || 0,
    }
    onFinish(formattedValues)
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
        status: initialValues?.status || 'ONGOING',
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
          {Array.isArray(subjects) && subjects.length > 0 ? (
            subjects.map((subject) => (
              <Select.Option
                key={subject.id}
                value={subject.id}
              >
                {subject.title}
              </Select.Option>
            ))
          ) : (
            <Select.Option
              value=""
              disabled
            >
              暂无可选学科
            </Select.Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item
        label="目标名称"
        name="title"
        rules={[{ required: true, message: '请输入目标名称' }]}
      >
        <Input placeholder="请输入学习目标名称" />
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
