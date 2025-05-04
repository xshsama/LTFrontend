import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Checkbox,
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
import { setTaskTags } from '../../services/taskTagService'
import '../../styles/TaskForm.css'
import { Goal, Tag as TagFromGoals } from '../../types/goals'
import { CreateTaskRequest, Task } from '../../types/task'

// 使用来自goals.ts的Tag类型，与服务返回的数据一致
type TagType = TagFromGoals

interface TaskFormProps {
  initialValues?: Partial<Task>
  goals: Goal[]
  availableTags: TagType[]
  onFinish: (values: CreateTaskRequest) => Promise<Task> | void
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
  // 添加任务类型状态，用于动态显示表单字段
  const [taskType, setTaskType] = useState<string>(
    initialValues?.type || 'STEP',
  )

  // 添加表单值改变的处理函数
  useEffect(() => {
    // 确保初始值被正确设置
    setTaskType(form.getFieldValue('type') || initialValues?.type || 'STEP')
  }, [form, initialValues])

  // 处理表单值变化
  const handleValuesChange = (changedValues: any) => {
    // 如果任务类型发生变化
    if (changedValues.type) {
      setTaskType(changedValues.type)

      // 如果切换到HABIT类型，默认设置频率为DAILY
      if (changedValues.type === 'HABIT' && !form.getFieldValue('frequency')) {
        form.setFieldsValue({ frequency: 'DAILY' })
      }
      // 如果切换到CREATIVE类型，设置默认许可证
      if (
        changedValues.type === 'CREATIVE' &&
        !form.getFieldValue('licenseType')
      ) {
        form.setFieldsValue({ licenseType: 'ALL_RIGHTS_RESERVED' })
      }
    }

    // 如果频率变了，并且是HABIT类型
    if (changedValues.frequency && taskType === 'HABIT') {
      // 强制组件重新渲染
      setTaskType((prev) => `${prev}_${Date.now()}`)
    }
  }

  // 添加标签获取功能
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const latestTags = await getTags()
        if (latestTags && Array.isArray(latestTags)) {
          // 直接使用服务器返回的标签，不进行类型转换
          setAllTags(latestTags as any)
        }
      } catch (error) {
        console.error('获取标签数据失败:', error)
      }
    }
    fetchTags()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const refreshTags = async () => {
    try {
      const latestTags = await getTags()
      return latestTags
    } catch (error) {
      console.error('获取最新标签列表失败:', error)
      return null
    }
  }

  const handleInputConfirm = async () => {
    if (inputValue.trim() === '') return

    try {
      // 创建新标签
      const newTag: any = await createTag(inputValue.trim())

      // 直接使用类型断言处理类型不匹配问题
      setNewlyCreatedTags([...newlyCreatedTags, newTag])
      setAllTags([...allTags, newTag])

      // 更新选中的标签ID列表
      const newSelectedTagIds = [...selectedTagIds, newTag.id]
      setSelectedTagIds(newSelectedTagIds)
      form.setFieldsValue({ tagIds: newSelectedTagIds })
      message.success(`标签 "${inputValue}" 创建成功`)
    } catch (error) {
      console.error('创建标签失败:', error)
      message.error('创建标签失败，请重试')
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

  const handleTagSelect = (tagId: number) => {
    if (!selectedTagIds.includes(tagId)) {
      const newSelectedTagIds = [...selectedTagIds, tagId]
      setSelectedTagIds(newSelectedTagIds)
      form.setFieldsValue({ tagIds: newSelectedTagIds })
    }
  }

  const handleTagDeselect = (tagId: number) => {
    const newSelectedTagIds = selectedTagIds.filter((id) => id !== tagId)
    setSelectedTagIds(newSelectedTagIds)
    form.setFieldsValue({ tagIds: newSelectedTagIds })
  }

  const handleFormFinish = async (values: any) => {
    // 根据CreateTaskRequest类型准备提交数据
    const formattedValues: CreateTaskRequest = {
      title: values.title,
      type: values.type,
      goalId: values.goalId,
      tagIds: selectedTagIds,
      // 可选添加其他字段
      metadata: JSON.stringify({
        weight: values.weight || 5,
        status: values.status || 'ACTIVE',
        completionDate: values.completionDate
          ? values.completionDate.format('YYYY-MM-DD')
          : undefined,
        actualTimeMinutes: values.actualTimeMinutes || 0,
        estimatedTimeMinutes: values.estimatedTimeMinutes,
      }),
    }

    // 根据任务类型添加特定字段
    if (values.type === 'STEP') {
      // 将steps数组转换为JSON字符串
      if (values.steps && Array.isArray(values.steps)) {
        // 为每个步骤处理数据
        const stepsWithIds = values.steps.map(
          (
            step: {
              id?: string
              title: string
              description?: string
              asTodoList?: boolean
              todoItems?: Array<{
                id?: string
                content: string
                priority?: number
                completed?: boolean
              }>
            },
            index: number,
          ) => {
            // 为每个待办事项生成唯一ID
            const todoItems =
              step.todoItems && Array.isArray(step.todoItems)
                ? step.todoItems.map((item, todoIndex) => ({
                    id: item.id || `todo-${Date.now()}-${index}-${todoIndex}`,
                    content: item.content,
                    priority: item.priority ?? 0,
                    completed: item.completed ?? false,
                    createdAt: new Date().toISOString(),
                  }))
                : []

            return {
              id: step.id || `step-${Date.now()}-${index}`,
              title: step.title,
              description: step.description || '',
              order: index,
              status: 'PENDING' as
                | 'PENDING'
                | 'IN_PROGRESS'
                | 'BLOCKED'
                | 'DONE',
              asTodoList:
                step.asTodoList === undefined ? true : step.asTodoList,
              todoItems: todoItems,
            }
          },
        )
        formattedValues.stepsJson = JSON.stringify(stepsWithIds)
      } else {
        formattedValues.stepsJson = '[]'
      }
    } else if (values.type === 'HABIT') {
      formattedValues.frequency = values.frequency
      formattedValues.daysOfWeekJson = values.daysOfWeekJson
      formattedValues.customPattern = values.customPattern
    } else if (values.type === 'CREATIVE') {
      formattedValues.publicationFormats = values.publicationFormats
      formattedValues.licenseType = values.licenseType
    }

    try {
      const savedTask = await onFinish(formattedValues)
      if (savedTask && savedTask.id && selectedTagIds.length > 0) {
        await setTaskTags(savedTask.id, selectedTagIds)
      }
    } catch (error) {
      console.error('保存任务或标签关系失败:', error)
      message.error('保存任务或标签关系时发生错误')
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      onValuesChange={handleValuesChange}
      initialValues={{
        ...initialValues,
        completionDate: initialValues?.completionDate
          ? dayjs(initialValues.completionDate)
          : undefined,
        status: initialValues?.status || 'ACTIVE',
        type: initialValues?.type || 'STEP',
        // 从metadata中提取额外字段，如果存在的话
        weight: initialValues?.metadata
          ? JSON.parse(initialValues.metadata || '{}').weight || 5
          : 5,
        actualTimeMinutes: initialValues?.metadata
          ? JSON.parse(initialValues.metadata || '{}').actualTimeMinutes || 0
          : 0,
        tagIds: initialValues?.tags?.map((tag: any) => tag.id) || [],
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
          showSearch
        >
          {goals.map((goal) => (
            <Select.Option
              key={`goal-${goal.id}`}
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
          className="full-width-input"
        />
      </Form.Item>

      <Form.Item
        label="状态"
        name="status"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select placeholder="选择状态">
          <Select.Option value="ACTIVE">进行中</Select.Option>
          <Select.Option value="ARCHIVED">已完成</Select.Option>
          <Select.Option value="BLOCKED">已阻塞</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="任务类型"
        name="type"
        rules={[{ required: true, message: '请选择任务类型' }]}
      >
        <Select
          placeholder="选择任务类型"
          onChange={(value) => {
            // 当任务类型变化时，强制表单重新渲染
            form.setFieldsValue({ type: value })
            // 如果是HABIT类型，默认设置频率为DAILY
            if (value === 'HABIT' && !form.getFieldValue('frequency')) {
              form.setFieldsValue({ frequency: 'DAILY' })
            }
            // 如果是CREATIVE类型，设置默认许可证
            if (value === 'CREATIVE' && !form.getFieldValue('licenseType')) {
              form.setFieldsValue({ licenseType: 'ALL_RIGHTS_RESERVED' })
            }
          }}
        >
          <Select.Option value="STEP">步骤类</Select.Option>
          <Select.Option value="HABIT">习惯性</Select.Option>
          <Select.Option value="CREATIVE">创作型</Select.Option>
        </Select>
      </Form.Item>

      {/* 根据任务类型显示特定字段 */}
      {taskType === 'STEP' && (
        <Form.Item
          label="步骤设置"
          tooltip="添加完成任务所需的步骤"
        >
          <Form.List
            name="steps"
            initialValue={[
              { title: '', description: '', asTodoList: true, todoItems: [] },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="step-item"
                  >
                    <div className="step-header">
                      <span className="step-number">步骤 {name + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          onClick={() => remove(name)}
                          icon={<DeleteOutlined />}
                        />
                      )}
                    </div>
                    <Form.Item
                      {...restField}
                      name={[name, 'title']}
                      rules={[{ required: true, message: '请输入步骤标题' }]}
                    >
                      <Input placeholder="步骤标题" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                    >
                      <Input.TextArea
                        placeholder="步骤描述（可选）"
                        rows={2}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'asTodoList']}
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Checkbox>设为待办事项列表</Checkbox>
                    </Form.Item>

                    {/* 当设置为待办事项列表时，显示添加待办项的表单 */}
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => {
                        return (
                          prevValues.steps?.[name]?.asTodoList !==
                          currentValues.steps?.[name]?.asTodoList
                        )
                      }}
                    >
                      {({ getFieldValue }) => {
                        const asTodoList = getFieldValue([
                          'steps',
                          name,
                          'asTodoList',
                        ])
                        return asTodoList ? (
                          <div className="todo-items-container">
                            <Form.List
                              name={[name, 'todoItems']}
                              initialValue={[]}
                            >
                              {(
                                todoFields,
                                { add: addTodo, remove: removeTodo },
                              ) => (
                                <>
                                  {todoFields.map(
                                    ({
                                      key: todoKey,
                                      name: todoName,
                                      ...todoRestField
                                    }) => (
                                      <div
                                        key={todoKey}
                                        className="todo-item"
                                      >
                                        <Form.Item
                                          {...todoRestField}
                                          name={[todoName, 'content']}
                                          rules={[
                                            {
                                              required: true,
                                              message: '请输入待办内容',
                                            },
                                          ]}
                                          style={{ flex: 1, marginBottom: 8 }}
                                        >
                                          <Input placeholder="待办事项内容" />
                                        </Form.Item>
                                        <Form.Item
                                          {...todoRestField}
                                          name={[todoName, 'priority']}
                                          initialValue={0}
                                          style={{
                                            width: 120,
                                            marginLeft: 8,
                                            marginBottom: 8,
                                          }}
                                        >
                                          <Select placeholder="优先级">
                                            <Select.Option value={0}>
                                              低
                                            </Select.Option>
                                            <Select.Option value={1}>
                                              中
                                            </Select.Option>
                                            <Select.Option value={2}>
                                              高
                                            </Select.Option>
                                          </Select>
                                        </Form.Item>
                                        <Button
                                          type="text"
                                          danger
                                          onClick={() => removeTodo(todoName)}
                                          icon={<DeleteOutlined />}
                                          style={{ marginLeft: 8 }}
                                        />
                                      </div>
                                    ),
                                  )}
                                  <Button
                                    type="dashed"
                                    onClick={() =>
                                      addTodo({
                                        content: '',
                                        completed: false,
                                        priority: 0,
                                      })
                                    }
                                    icon={<PlusOutlined />}
                                    style={{ marginBottom: 16 }}
                                  >
                                    添加待办事项
                                  </Button>
                                </>
                              )}
                            </Form.List>
                          </div>
                        ) : null
                      }}
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() =>
                      add({
                        title: '',
                        description: '',
                        asTodoList: true,
                        todoItems: [],
                      })
                    }
                    block
                    icon={<PlusOutlined />}
                  >
                    添加步骤
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      )}

      {taskType === 'HABIT' && (
        <>
          <Form.Item
            label="频率"
            name="frequency"
            rules={[
              {
                required: taskType === 'HABIT',
                message: '请选择频率',
              },
            ]}
          >
            <Select
              placeholder="选择习惯频率"
              onChange={() => {
                // 强制重新渲染
                setTaskType((prev) =>
                  typeof prev === 'string' && !prev.includes('_')
                    ? `${prev}_${Date.now()}`
                    : prev.split('_')[0] + `_${Date.now()}`,
                )
              }}
            >
              <Select.Option value="DAILY">每日</Select.Option>
              <Select.Option value="WEEKLY">每周</Select.Option>
              <Select.Option value="MONTHLY">每月</Select.Option>
              <Select.Option value="CUSTOM">自定义</Select.Option>
            </Select>
          </Form.Item>

          {form.getFieldValue('frequency') === 'WEEKLY' && (
            <Form.Item
              label="周几"
              name="daysOfWeekJson"
              rules={[
                {
                  required: form.getFieldValue('frequency') === 'WEEKLY',
                  message: '请选择周几',
                },
              ]}
              tooltip="选择一周中需要完成的日子"
            >
              <Select
                mode="multiple"
                placeholder="选择每周几需要完成"
              >
                <Select.Option value="1">周一</Select.Option>
                <Select.Option value="2">周二</Select.Option>
                <Select.Option value="3">周三</Select.Option>
                <Select.Option value="4">周四</Select.Option>
                <Select.Option value="5">周五</Select.Option>
                <Select.Option value="6">周六</Select.Option>
                <Select.Option value="0">周日</Select.Option>
              </Select>
            </Form.Item>
          )}

          {form.getFieldValue('frequency') === 'CUSTOM' && (
            <Form.Item
              label="自定义模式"
              name="customPattern"
              tooltip="请输入自定义的重复模式"
            >
              <Input placeholder="例如: 每3天一次" />
            </Form.Item>
          )}
        </>
      )}

      {taskType === 'CREATIVE' && (
        <>
          <Form.Item
            label="发布格式"
            name="publicationFormats"
            tooltip="选择作品的发布格式"
          >
            <Select
              placeholder="选择发布格式"
              mode="multiple"
            >
              <Select.Option value="PDF">PDF</Select.Option>
              <Select.Option value="EPUB">EPUB</Select.Option>
              <Select.Option value="HTML">HTML</Select.Option>
              <Select.Option value="OTHER">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="许可证类型"
            name="licenseType"
            tooltip="选择作品的许可证类型"
          >
            <Select placeholder="选择许可证类型">
              <Select.Option value="CC_BY">CC BY</Select.Option>
              <Select.Option value="ALL_RIGHTS_RESERVED">
                保留所有权利
              </Select.Option>
            </Select>
          </Form.Item>
        </>
      )}

      <Form.Item
        label="标签"
        name="tagIds"
        help={
          allTags.length === 0
            ? '您还没有任何标签，请在下方输入框创建新标签'
            : null
        }
      >
        <Select
          mode="multiple"
          placeholder="选择或创建标签"
          style={{ width: '100%' }}
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
                  style={{ flex: 'none', padding: '0 8px', cursor: 'pointer' }}
                  onClick={handleInputConfirm}
                >
                  <PlusOutlined /> 添加标签
                </a>
              </div>
            </>
          )}
          options={allTags.map((tag) => ({
            key: tag.id,
            value: tag.id,
            label: tag.title,
            children: <Tag color={tag.color || 'blue'}>{tag.title}</Tag>,
          }))}
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
