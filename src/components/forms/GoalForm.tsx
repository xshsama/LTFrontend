import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from 'antd'
import dayjs from 'dayjs'
import React from 'react'
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
  const [form] = Form.useForm()
  const filteredCategories = initialValues?.subjectId
    ? categories.filter((cat) => cat.subjectId === initialValues.subjectId)
    : []

  const handleFormFinish = (values: any) => {
    const formattedValues = {
      ...values,
      deadline: values.deadline
        ? values.deadline.format('YYYY-MM-DD')
        : undefined,
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
        deadline: initialValues?.deadline
          ? dayjs(initialValues.deadline)
          : undefined,
        progress: initialValues?.progress || 0,
        actualHours: initialValues?.actualHours || 0,
        priority: initialValues?.priority || 'MEDIUM',
        status: initialValues?.status || 'NO_STARTED',
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
        label="所属分类"
        name="categoryId"
      >
        <Select
          placeholder="选择所属分类（可选）"
          allowClear
          optionFilterProp="children"
          showSearch
        >
          {categories
            .filter((cat) =>
              form.getFieldValue('subjectId')
                ? cat.subjectId === form.getFieldValue('subjectId')
                : true,
            )
            .map((category) => (
              <Select.Option
                key={category.id}
                value={category.id}
              >
                {category.name}
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

      <Form.Item
        label="截止日期"
        name="deadline"
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="选择截止日期（可选）"
          format="YYYY-MM-DD"
        />
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
        </Select>
      </Form.Item>

      <Form.Item
        label="状态"
        name="status"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select placeholder="选择状态">
          <Select.Option value="NO_STARTED">未开始</Select.Option>
          <Select.Option value="ONGOING">进行中</Select.Option>
          <Select.Option value="COMPLETED">已完成</Select.Option>
          <Select.Option value="EXPIRED">已过期</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="完成进度(%)"
        name="progress"
        rules={[
          {
            required: true,
            message: '请输入完成进度',
            type: 'number',
            min: 0,
            max: 100,
          },
        ]}
      >
        <InputNumber
          min={0}
          max={100}
          style={{ width: '100%' }}
          placeholder="完成进度 (0-100)"
        />
      </Form.Item>

      <Form.Item
        label="预计学时(小时)"
        name="expectedHours"
        rules={[
          {
            type: 'number',
            min: 0,
          },
        ]}
      >
        <InputNumber
          min={0}
          step={0.5}
          style={{ width: '100%' }}
          placeholder="预计需要的学习时间(小时)"
        />
      </Form.Item>

      <Form.Item
        label="已投入学时(小时)"
        name="actualHours"
        rules={[
          {
            required: true,
            message: '请输入已投入学时',
            type: 'number',
            min: 0,
          },
        ]}
      >
        <InputNumber
          min={0}
          step={0.5}
          style={{ width: '100%' }}
          placeholder="已投入的学习时间(小时)"
        />
      </Form.Item>

      <Form.Item
        label="完成日期"
        name="completionDate"
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="目标完成日期（自动填写或手动设置）"
          format="YYYY-MM-DD"
        />
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
