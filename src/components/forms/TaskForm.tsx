import { PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  message,
} from 'antd'
import type { InputRef } from 'antd/es/input'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { createTag, getTags } from '../../services/objectiveService'
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
  const [newlyCreatedTags, setNewlyCreatedTags] = useState<TagType[]>([])
  const [allTags, setAllTags] = useState<TagType[]>([...availableTags])

  // 在组件挂载时获取最新标签数据
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const latestTags = await getTags()
        console.log('从数据库获取到的标签数据:', latestTags)
        if (latestTags && Array.isArray(latestTags)) {
          setAllTags(latestTags)
        }
      } catch (error) {
        console.error('获取标签数据失败:', error)
      }
    }

    fetchTags()
  }, [])

  // 处理添加新标签
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // 刷新标签列表
  const refreshTags = async () => {
    try {
      const latestTags = await getTags()
      // 创建一个props更新函数 - 但由于这是一个组件内部逻辑，我们在这里只做日志记录
      console.log('标签列表已更新，最新标签数量:', latestTags.length)
      return latestTags
    } catch (error) {
      console.error('获取最新标签列表失败:', error)
      return null
    }
  }

  const handleInputConfirm = async () => {
    if (inputValue.trim() === '') {
      return
    }

    try {
      // 调用后端API创建新标签
      const newTag = await createTag(inputValue.trim())

      // 调用API获取最新的标签列表
      const latestTags = await refreshTags()

      // 更新本地标签列表
      if (latestTags) {
        // 如果是父组件传入的availableTags，这里我们不能直接修改它
        // 所以我们保存新创建的标签到本地状态
        const newTagsList = [...newlyCreatedTags, newTag]
        setNewlyCreatedTags(newTagsList)
      } else {
        // 如果获取最新标签失败，至少更新本地新创建标签列表
        const newTagsList = [...newlyCreatedTags, newTag]
        setNewlyCreatedTags(newTagsList)
      }

      // 自动选中新创建的标签
      const newSelectedTagIds = [...selectedTagIds, newTag.id]
      setSelectedTagIds(newSelectedTagIds)
      form.setFieldsValue({
        tagIds: newSelectedTagIds,
      })

      message.success(`标签 "${inputValue}" 创建成功`)
    } catch (error) {
      console.error('创建标签失败:', error)
      message.error('创建标签失败，请重试')
    }

    // 重置输入框
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
      tags: selectedTagIds.map((id) => {
        // 同时在可用标签列表和新创建的标签列表中查找
        const allTags = [...availableTags, ...newlyCreatedTags]
        return allTags.find((tag) => tag.id === id)!
      }),
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
              key={`goal-${goal.id}-${goal.title}`}
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
        help={
          availableTags.length === 0 && newlyCreatedTags.length === 0
            ? '您还没有任何标签，请在下方输入框创建新标签'
            : null
        }
      >
        <Select
          mode="multiple"
          placeholder="选择或创建标签"
          style={{ width: '100%' }}
          optionFilterProp="children"
          onSelect={handleTagSelect}
          onDeselect={handleTagDeselect}
          labelInValue={false}
          optionLabelProp="label"
          notFoundContent={
            <div style={{ padding: 8, textAlign: 'center' }}>
              {availableTags.length === 0 && newlyCreatedTags.length === 0
                ? '暂无标签，请在下方创建'
                : '没有匹配的标签'}
            </div>
          }
          options={[...availableTags, ...newlyCreatedTags]
            .filter((tag) => tag && tag.id && tag.name)
            .map((tag) => ({
              key: `tag-${tag.id}`,
              value: tag.id,
              label: tag.name,
              children: <Tag color={tag.color || 'blue'}>{tag.name}</Tag>,
            }))}
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

export default TaskForm
