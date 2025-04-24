import { LoginOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
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
import { getAllTasks, getTasksByGoal } from '../services/taskService'
import { Goal } from '../types/goals'
import { Task } from '../types/task'

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
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ])

  // 获取任务和目标数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [tasksData, goalsData] = await Promise.all([
          getAllTasks(),
          getGoals(),
        ])
        setTasks(tasksData)
        setGoals(goalsData)
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
  }, [isAuthenticated])

  // 根据选择的目标筛选任务
  useEffect(() => {
    const fetchTasksByGoal = async () => {
      if (!selectedGoalId) return

      setLoading(true)
      try {
        const tasksData = await getTasksByGoal(selectedGoalId)
        setTasks(tasksData)
      } catch (error) {
        console.error(`获取目标(ID:${selectedGoalId})的任务列表失败:`, error)
        message.error('获取任务数据失败，请重试！')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && selectedGoalId) {
      fetchTasksByGoal()
    } else if (isAuthenticated && !selectedGoalId) {
      // 如果没有选择目标，则获取所有任务
      getAllTasks()
        .then(setTasks)
        .catch((error) => {
          console.error('获取所有任务失败:', error)
          message.error('获取任务数据失败，请重试！')
        })
    }
  }, [isAuthenticated, selectedGoalId])

  // 刷新数据
  const refreshData = async () => {
    setLoading(true)
    try {
      if (selectedGoalId) {
        const tasksData = await getTasksByGoal(selectedGoalId)
        setTasks(tasksData)
      } else {
        const tasksData = await getAllTasks()
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
          <ProgressTracker />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default TaskProgressPage
