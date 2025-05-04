import {
  CheckCircleOutlined,
  LoginOutlined,
  ReloadOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import {
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Result,
  Row,
  Select,
  Space,
  Statistic,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  message,
} from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressTracker from '../components/ProgressTracker'
import { useAuth } from '../contexts/AuthContext'
import { getGoals } from '../services/goalService'
import {
  getAllCreativeTasks,
  getAllHabitTasks,
  getAllStepTasks,
  getAllTasks,
  getTasksByGoal,
  updateStepStatus,
  updateStepTaskSteps,
} from '../services/taskService'
import { Goal } from '../types/goals'
import { CreativeTask, HabitTask, StepTask, Task } from '../types/task'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { RangePicker } = DatePicker

// 定义任务数据统计类型
interface TaskStats {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  overdue: number
  completionRate: number
  avgTimeSpent: number
}

// 辅助函数：计算日期之间的差距（天数）
const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000 // 一天的毫秒数
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

const TaskProgressPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // 状态管理
  const [tasks, setTasks] = useState<Task[]>([])
  const [stepTasks, setStepTasks] = useState<StepTask[]>([])
  const [habitTasks, setHabitTasks] = useState<HabitTask[]>([])
  const [creativeTasks, setCreativeTasks] = useState<CreativeTask[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [selectedTaskType, setSelectedTaskType] = useState<
    'ALL' | 'STEP' | 'HABIT' | 'CREATIVE'
  >('ALL')
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ])

  // 待办事项管理状态
  const [todoModalVisible, setTodoModalVisible] = useState(false)
  const [currentStepId, setCurrentStepId] = useState<string | null>(null)
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null)
  const [todoForm] = Form.useForm()

  // 获取任务和目标数据
  useEffect(() => {
    console.log('任务类型useEffect触发，当前选择的类型:', selectedTaskType)

    const fetchData = async () => {
      setLoading(true)
      try {
        // 获取目标数据
        const goalsData = await getGoals()
        setGoals(goalsData)

        // 根据选择的任务类型获取任务数据
        let tasksData: Task[] = []

        switch (selectedTaskType) {
          case 'STEP':
            console.log('正在调用步骤型任务API...')
            const stepData = await getAllStepTasks()
            console.log('获取到步骤型任务数据:', stepData)
            setStepTasks(stepData)
            tasksData = stepData
            break
          case 'HABIT':
            console.log('正在调用习惯型任务API...')
            const habitData = await getAllHabitTasks()
            console.log('获取到习惯型任务数据:', habitData)
            setHabitTasks(habitData)
            tasksData = habitData
            break
          case 'CREATIVE':
            console.log('正在调用创意型任务API...')
            const creativeData = await getAllCreativeTasks()
            console.log('获取到创意型任务数据:', creativeData)
            setCreativeTasks(creativeData)
            tasksData = creativeData
            break
          default:
            // 获取所有类型的任务
            console.log('正在调用所有任务API...')
            tasksData = await getAllTasks()
            console.log('获取到所有任务数据:', tasksData)
            break
        }

        setTasks(tasksData)
      } catch (error) {
        console.error('获取数据失败:', error)
        message.error('获取任务和目标数据失败，请重试')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, selectedTaskType])

  // 根据选择的目标筛选任务
  useEffect(() => {
    const fetchTasksByGoal = async () => {
      if (!selectedGoalId) return

      setLoading(true)
      try {
        // 当选择了特定目标时，我们还是使用通用的getTasksByGoal API
        // 因为后端尚未提供按目标ID和任务类型同时筛选的API
        const tasksData = await getTasksByGoal(selectedGoalId)

        // 如果选择了特定任务类型，在前端进行过滤
        if (selectedTaskType !== 'ALL') {
          const filteredTasks = tasksData.filter(
            (task) => task.type === selectedTaskType,
          )
          setTasks(filteredTasks)
        } else {
          setTasks(tasksData)
        }
      } catch (error) {
        console.error(`获取目标(ID:${selectedGoalId})的任务列表失败:`, error)
        message.error('获取任务数据失败，请重试！')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && selectedGoalId) {
      fetchTasksByGoal()
    }
  }, [isAuthenticated, selectedGoalId, selectedTaskType])

  // 刷新数据
  const refreshData = async () => {
    setLoading(true)
    try {
      if (selectedGoalId) {
        // 当有选择目标时，使用目标筛选API
        const tasksData = await getTasksByGoal(selectedGoalId)

        // 如果同时选择了特定任务类型，在前端进行过滤
        if (selectedTaskType !== 'ALL') {
          const filteredTasks = tasksData.filter(
            (task) => task.type === selectedTaskType,
          )
          setTasks(filteredTasks)
        } else {
          setTasks(tasksData)
        }
      } else {
        // 没有选择目标时，根据选择的任务类型获取任务
        let tasksData: Task[] = []

        switch (selectedTaskType) {
          case 'STEP':
            const stepData = await getAllStepTasks()
            setStepTasks(stepData)
            tasksData = stepData
            break
          case 'HABIT':
            const habitData = await getAllHabitTasks()
            setHabitTasks(habitData)
            tasksData = habitData
            break
          case 'CREATIVE':
            const creativeData = await getAllCreativeTasks()
            setCreativeTasks(creativeData)
            tasksData = creativeData
            break
          default:
            // 获取所有类型的任务
            tasksData = await getAllTasks()
            break
        }

        setTasks(tasksData)
      }
      message.success('数据已刷新')
    } catch (error) {
      console.error('刷新数据失败:', error)
      message.error('刷新数据失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    if (dates) {
      setDateRange(dates)
    }
  }

  // 按日期范围过滤任务
  const filteredTasks = useMemo(() => {
    if (!dateRange || !tasks.length) return tasks

    const [startDate, endDate] = dateRange
    return tasks.filter((task) => {
      const updatedAt = dayjs(task.updatedAt)
      return updatedAt.isAfter(startDate) && updatedAt.isBefore(endDate)
    })
  }, [tasks, dateRange])

  // 计算任务统计数据
  const taskStats: TaskStats = useMemo(() => {
    if (!filteredTasks.length) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        overdue: 0,
        completionRate: 0,
        avgTimeSpent: 0,
      }
    }

    const completed = filteredTasks.filter(
      (t) => t.status === 'COMPLETED',
    ).length
    const inProgress = filteredTasks.filter(
      (t) => t.status === 'IN_PROGRESS',
    ).length
    const notStarted = filteredTasks.filter(
      (t) => t.status === 'NOT_STARTED',
    ).length
    const overdue = filteredTasks.filter((t) => t.status === 'OVERDUE').length

    // 计算完成任务的平均时间（分钟）
    const completedTasks = filteredTasks.filter(
      (t) => t.status === 'COMPLETED' && t.actualTimeMinutes,
    )
    const totalTimeSpent = completedTasks.reduce(
      (sum, task) => sum + (task.actualTimeMinutes || 0),
      0,
    )
    const avgTimeSpent = completedTasks.length
      ? Math.round(totalTimeSpent / completedTasks.length)
      : 0

    return {
      total: filteredTasks.length,
      completed,
      inProgress,
      notStarted,
      overdue,
      completionRate: filteredTasks.length
        ? Math.round((completed / filteredTasks.length) * 100)
        : 0,
      avgTimeSpent,
    }
  }, [filteredTasks])

  // 任务完成时间线数据
  const completedTaskTimeline = useMemo(() => {
    return filteredTasks
      .filter((task) => task.status === 'COMPLETED' && task.completionDate)
      .sort((a, b) => {
        if (!a.completionDate || !b.completionDate) return 0
        return (
          new Date(b.completionDate).getTime() -
          new Date(a.completionDate).getTime()
        )
      })
      .slice(0, 10) // 只显示最近的10个完成任务
  }, [filteredTasks])

  // 日历单元格渲染
  const cellRender = (date: Dayjs) => {
    // 查找当天完成的任务
    const dayTasks = filteredTasks.filter((task) => {
      const taskDate = dayjs(task.completionDate)
      return (
        task.status === 'COMPLETED' &&
        taskDate.date() === date.date() &&
        taskDate.month() === date.month() &&
        taskDate.year() === date.year()
      )
    })

    if (dayTasks.length === 0) return null

    return (
      <div className="task-calendar-cell">
        <Badge
          count={dayTasks.length}
          color="green"
        />
      </div>
    )
  }

  // 处理登录按钮点击
  const handleLogin = () => {
    navigate('/login')
  }

  // 如果未登录，显示提示信息
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Result
          status="info"
          title="查看任务进度"
          subTitle="登录后可查看您的任务进度跟踪"
          extra={
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleLogin}
            >
              立即登录
            </Button>
          }
        />
      </div>
    )
  }

  // 处理任务类型变化
  const handleTaskTypeChange = async (
    type: 'ALL' | 'STEP' | 'HABIT' | 'CREATIVE',
  ) => {
    console.log('任务类型变化:', type)
    setSelectedTaskType(type)

    // 立即获取数据而不等待useEffect触发
    setLoading(true)
    try {
      let tasksData: Task[] = []

      switch (type) {
        case 'STEP':
          console.log('立即调用步骤型任务API...')
          const stepData = await getAllStepTasks()
          console.log('获取到步骤型任务数据:', stepData)
          setStepTasks(stepData)
          tasksData = stepData
          break
        case 'HABIT':
          console.log('立即调用习惯型任务API...')
          const habitData = await getAllHabitTasks()
          console.log('获取到习惯型任务数据:', habitData)
          setHabitTasks(habitData)
          tasksData = habitData
          break
        case 'CREATIVE':
          console.log('立即调用创意型任务API...')
          const creativeData = await getAllCreativeTasks()
          console.log('获取到创意型任务数据:', creativeData)
          setCreativeTasks(creativeData)
          tasksData = creativeData
          break
        default:
          console.log('立即调用所有任务API...')
          tasksData = await getAllTasks()
          console.log('获取到所有任务数据:', tasksData)
          break
      }

      setTasks(tasksData)
      message.success(
        `成功获取${
          type === 'ALL'
            ? '所有'
            : type === 'STEP'
            ? '步骤型'
            : type === 'HABIT'
            ? '习惯型'
            : '创意型'
        }任务`,
      )
    } catch (error) {
      console.error('获取任务数据失败:', error)
      message.error('获取任务数据失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={2}>任务进度跟踪</Title>
        <Space>
          <Select
            placeholder="选择目标筛选"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setSelectedGoalId(value)}
            loading={loading}
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

          {/* 添加任务类型选择器 */}
          <Select
            placeholder="选择任务类型"
            style={{ width: 200 }}
            value={selectedTaskType}
            onChange={handleTaskTypeChange}
            loading={loading}
          >
            <Select.Option value="ALL">所有类型</Select.Option>
            <Select.Option value="STEP">步骤型任务</Select.Option>
            <Select.Option value="HABIT">习惯型任务</Select.Option>
            <Select.Option value="CREATIVE">创意型任务</Select.Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange as any}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshData}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <TabPane
          tab="总览"
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="任务完成率"
                  value={taskStats.completionRate}
                  suffix="%"
                  precision={0}
                />
                <Progress
                  percent={taskStats.completionRate}
                  status={
                    taskStats.completionRate === 100 ? 'success' : 'active'
                  }
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总任务数"
                  value={taskStats.total}
                  suffix={
                    <Tooltip title="已完成/进行中/未开始/过期">
                      <Text type="secondary">
                        ({taskStats.completed}/{taskStats.inProgress}/
                        {taskStats.notStarted}/{taskStats.overdue})
                      </Text>
                    </Tooltip>
                  }
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="平均完成时间"
                  value={taskStats.avgTimeSpent}
                  suffix="分钟"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="今日待完成"
                  value={
                    filteredTasks.filter(
                      (t) =>
                        t.status !== 'COMPLETED' &&
                        dayjs(t.updatedAt).isSame(dayjs(), 'day'),
                    ).length
                  }
                />
              </Card>
            </Col>
          </Row>

          <Row
            gutter={[16, 16]}
            style={{ marginTop: 16 }}
          >
            <Col span={16}>
              <Card title="任务完成时间线">
                {completedTaskTimeline.length > 0 ? (
                  <Timeline>
                    {completedTaskTimeline.map((task) => (
                      <Timeline.Item
                        key={task.id}
                        color="green"
                      >
                        <p>
                          <Text strong>{task.title}</Text>
                          <Tag
                            color="success"
                            style={{ marginLeft: 8 }}
                          >
                            已完成
                          </Tag>
                        </p>
                        <p>
                          <Text type="secondary">
                            完成时间:{' '}
                            {dayjs(task.completionDate).format(
                              'YYYY-MM-DD HH:mm',
                            )}
                          </Text>
                          {task.actualTimeMinutes && (
                            <Text
                              type="secondary"
                              style={{ marginLeft: 8 }}
                            >
                              耗时: {task.actualTimeMinutes} 分钟
                            </Text>
                          )}
                        </p>
                        {task.type === 'STEP' &&
                          (task as StepTask).steps &&
                          (task as StepTask).steps!.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: 8,
                                }}
                              >
                                <Text strong>步骤:</Text>
                              </div>
                              <ul style={{ marginLeft: 16 }}>
                                {((task as StepTask).steps || []).map(
                                  (step) => (
                                    <li key={step.id}>
                                      <div>
                                        <div className="step-title-row">
                                          <Text
                                            delete={
                                              step.completed ||
                                              step.status === 'DONE'
                                            }
                                            strong
                                            className={
                                              step.completed ||
                                              step.status === 'DONE'
                                                ? 'step-completed'
                                                : ''
                                            }
                                          >
                                            {step.title}
                                          </Text>

                                          {/* 完成/取消完成按钮 */}
                                          <div className="step-action-buttons">
                                            {step.completed ||
                                            step.status === 'DONE' ? (
                                              <Button
                                                type="text"
                                                size="small"
                                                className="step-action-button"
                                                icon={<UndoOutlined />}
                                                onClick={async () => {
                                                  try {
                                                    message.loading(
                                                      '正在更新步骤状态...',
                                                      0,
                                                    )
                                                    await updateStepStatus(
                                                      task.id,
                                                      step.id,
                                                      'PENDING',
                                                    )
                                                    message.destroy()
                                                    message.success(
                                                      '步骤已标记为未完成',
                                                    )
                                                    // 刷新数据
                                                    refreshData()
                                                  } catch (error) {
                                                    message.destroy()
                                                    message.error(
                                                      '更新步骤状态失败，请重试',
                                                    )
                                                  }
                                                }}
                                              >
                                                取消完成
                                              </Button>
                                            ) : (
                                              <Button
                                                type="primary"
                                                size="small"
                                                className="step-action-button"
                                                icon={<CheckCircleOutlined />}
                                                onClick={async () => {
                                                  try {
                                                    message.loading(
                                                      '正在更新步骤状态...',
                                                      0,
                                                    )
                                                    await updateStepStatus(
                                                      task.id,
                                                      step.id,
                                                      'DONE',
                                                    )
                                                    message.destroy()
                                                    message.success(
                                                      '步骤已标记为完成',
                                                    )
                                                    // 刷新数据
                                                    refreshData()
                                                  } catch (error) {
                                                    message.destroy()
                                                    message.error(
                                                      '更新步骤状态失败，请重试',
                                                    )
                                                  }
                                                }}
                                              >
                                                完成
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                        {step.asTodoList &&
                                          step.todoItems &&
                                          step.todoItems.length > 0 && (
                                            <div
                                              style={{
                                                marginLeft: 16,
                                                marginTop: 4,
                                              }}
                                            >
                                              <Progress
                                                percent={
                                                  (step.todoItems.filter(
                                                    (item) => item.completed,
                                                  ).length /
                                                    step.todoItems.length) *
                                                  100
                                                }
                                                size="small"
                                                style={{
                                                  marginBottom: 8,
                                                  maxWidth: 120,
                                                }}
                                              />
                                              <ul
                                                style={{
                                                  listStyleType: 'circle',
                                                }}
                                              >
                                                {step.todoItems.map((item) => (
                                                  <li key={item.id}>
                                                    <Text
                                                      delete={item.completed}
                                                      type={
                                                        item.completed
                                                          ? 'secondary'
                                                          : undefined
                                                      }
                                                      style={{
                                                        color:
                                                          item.priority === 2
                                                            ? '#f5222d'
                                                            : item.priority ===
                                                              1
                                                            ? '#fa8c16'
                                                            : undefined,
                                                      }}
                                                    >
                                                      {item.content}
                                                    </Text>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                      </div>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty description="暂无已完成任务" />
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="任务类型分布">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                  }}
                >
                  <Statistic
                    title={
                      <div>
                        <Tag color="blue">步骤类</Tag>
                      </div>
                    }
                    value={
                      filteredTasks.filter((t) => t.type === 'STEP').length
                    }
                    valueStyle={{ textAlign: 'center' }}
                  />
                  <Statistic
                    title={
                      <div>
                        <Tag color="green">习惯类</Tag>
                      </div>
                    }
                    value={
                      filteredTasks.filter((t) => t.type === 'HABIT').length
                    }
                    valueStyle={{ textAlign: 'center' }}
                  />
                  <Statistic
                    title={
                      <div>
                        <Tag color="purple">创作类</Tag>
                      </div>
                    }
                    value={
                      filteredTasks.filter((t) => t.type === 'CREATIVE').length
                    }
                    valueStyle={{ textAlign: 'center' }}
                  />
                </div>
                <Divider />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                  }}
                >
                  <Statistic
                    title={
                      <div>
                        <Tag color="red">高优先级</Tag>
                      </div>
                    }
                    value={
                      filteredTasks.filter((t) => t.priority === 'HIGH').length
                    }
                    valueStyle={{ textAlign: 'center' }}
                  />
                  <Statistic
                    title={
                      <div>
                        <Tag color="orange">中优先级</Tag>
                      </div>
                    }
                    value={
                      filteredTasks.filter((t) => t.priority === 'MEDIUM')
                        .length
                    }
                    valueStyle={{ textAlign: 'center' }}
                  />
                  <Statistic
                    title={
                      <div>
                        <Tag>低优先级</Tag>
                      </div>
                    }
                    value={
                      filteredTasks.filter((t) => t.priority === 'LOW').length
                    }
                    valueStyle={{ textAlign: 'center' }}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          <Card
            title="任务完成日历"
            style={{ marginTop: 16 }}
          >
            <Calendar
              fullscreen={false}
              cellRender={cellRender}
            />
          </Card>
        </TabPane>

        <TabPane
          tab="进度详情"
          key="details"
        >
          <ProgressTracker
            selectedTaskType={selectedTaskType}
            preloadedTasks={tasks}
            onTabChange={(tabKey) => {
              // 根据ProgressTracker的标签页自动设置任务类型
              let taskType: 'ALL' | 'STEP' | 'HABIT' | 'CREATIVE' = 'ALL'
              switch (tabKey) {
                case '1':
                  taskType = 'HABIT'
                  break
                case '2':
                  taskType = 'STEP'
                  break
                case '3':
                  taskType = 'CREATIVE'
                  break
              }

              // 调用handleTaskTypeChange函数来更新任务类型并获取数据
              console.log(
                '从ProgressTracker接收到标签变化，更新任务类型为:',
                taskType,
              )
              handleTaskTypeChange(taskType)
            }}
          />
        </TabPane>
      </Tabs>

      {/* 添加待办事项的Modal */}
      <Modal
        title="添加待办事项"
        visible={todoModalVisible}
        onCancel={() => setTodoModalVisible(false)}
        onOk={async () => {
          try {
            const values = await todoForm.validateFields()

            // 创建新的待办事项
            const newTodoItem = {
              id: `todo-${Date.now()}`,
              content: values.content,
              completed: false,
              createdAt: new Date(),
              priority: values.priority || 0,
            }

            // 找到当前任务和步骤
            const taskIndex = stepTasks.findIndex(
              (task) => task.id === currentTaskId,
            )

            if (taskIndex === -1) {
              message.error('找不到选定的任务')
              return
            }

            const task = stepTasks[taskIndex]
            if (!task.steps || task.steps.length === 0) {
              message.error('此任务没有步骤信息')
              return
            }

            // 更新当前步骤的待办事项
            const newStepTasks = [...stepTasks]
            const taskSteps = [...newStepTasks[taskIndex].steps!]

            // 如果没有选择特定步骤，默认添加到第一个步骤
            const stepIndex = currentStepId
              ? taskSteps.findIndex((s) => s.id === currentStepId)
              : 0

            if (stepIndex === -1) {
              message.error('找不到选定的步骤')
              return
            }

            const step = taskSteps[stepIndex]

            // 确保步骤的todoItems是一个数组
            if (!step.todoItems) {
              step.todoItems = []
            }

            if (!step.asTodoList) {
              step.asTodoList = true
            }

            // 添加新的待办事项
            step.todoItems.push(newTodoItem)

            // 更新步骤
            taskSteps[stepIndex] = step
            newStepTasks[taskIndex].steps = taskSteps

            // 更新状态
            setStepTasks(newStepTasks)

            // 更新任务列表
            const updatedTasks = tasks.map((t) =>
              t.id === task.id ? { ...t, steps: taskSteps } : t,
            )
            setTasks(updatedTasks)

            // 显示加载中提示
            message.loading('正在保存待办事项...', 0)

            try {
              // 调用API保存步骤更新
              await updateStepTaskSteps(task.id, taskSteps)

              message.destroy() // 销毁加载中提示
              message.success('待办事项已添加并保存')
            } catch (err) {
              console.error('保存待办事项失败:', err)
              message.destroy() // 销毁加载中提示
              message.error('保存待办事项失败，请重试')
            }

            setTodoModalVisible(false)
            todoForm.resetFields()
          } catch (info) {
            console.log('表单验证失败:', info)
          }
        }}
      >
        <Form
          form={todoForm}
          layout="vertical"
        >
          <Form.Item
            name="content"
            label="待办事项内容"
            rules={[{ required: true, message: '请输入待办事项内容' }]}
          >
            <Input placeholder="请输入待办事项内容" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
          >
            <Select defaultValue={0}>
              <Select.Option value={0}>低</Select.Option>
              <Select.Option value={1}>中</Select.Option>
              <Select.Option value={2}>高</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TaskProgressPage
