import {
  CheckCircleOutlined,
  LoginOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Empty,
  Progress,
  Result,
  Row,
  Space,
  Spin,
  Statistic,
  Tabs,
  Tag,
  Timeline,
  Typography,
  message,
} from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressTracker from '../components/ProgressTracker'
import { useAuth } from '../contexts/AuthContext'
import {
  checkInHabitTask,
  getAllTasks,
  updateStepStatus,
} from '../services/taskService'
import {
  CheckInRecordDTO,
  CreativeTask,
  HabitTask,
  Step, // Step type for frontend manipulation
  StepDTO, // StepDTO for backend interaction / initial detail
  StepTask,
  Task,
} from '../types/task'

dayjs.extend(isBetween)

interface TimelineTaskItem {
  id: number
  title: string
  status: Task['status']
  type: Task['type']
  completionDate?: Date
  actualTimeMinutes?: number
  steps?: Step[] // Changed from StepTask['steps'] to Step[] for clarity
  timelineItemType: 'TASK_COMPLETION'
  timelineDate: Date
  originalTaskData: Task
}

interface TimelineCheckInItem {
  id: string
  title: string
  timelineItemType: 'HABIT_CHECK_IN'
  timelineDate: Date
  taskType: 'HABIT'
  originalTask?: HabitTask
  checkInNote?: string
}

type TimelineItem = TimelineTaskItem | TimelineCheckInItem
type StepItemType = Step // Used for mapping in Timeline

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { RangePicker } = DatePicker

interface TaskStats {
  total: number
  completed?: number
  inProgress?: number
  notStarted?: number
  overdue?: number
  completionRate?: number
  avgTimeSpent?: number
  totalTasksAllTypes?: number
  stepTaskCompletionRateAll?: number
  habitTaskAverageCurrentStreakAll?: number
  habitTaskCurrentStreak?: number
  habitTaskAverageLongestStreak?: number
  creativeTaskAveragePhase?: number
}

const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

const TaskProgressPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[]>([])
  const [stepTasks, setStepTasks] = useState<StepTask[]>([])
  const [habitTasks, setHabitTasks] = useState<HabitTask[]>([])
  const [creativeTasks, setCreativeTasks] = useState<CreativeTask[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ])
  const [loadingTaskIds, setLoadingTaskIds] = useState<Set<number>>(new Set())
  const [selectedTaskForDetailView, setSelectedTaskForDetailView] =
    useState<Task | null>(null)

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    )
    if (
      selectedTaskForDetailView &&
      selectedTaskForDetailView.id === updatedTask.id
    ) {
      setSelectedTaskForDetailView(updatedTask)
    }
    if (updatedTask.type === 'CREATIVE') {
      setCreativeTasks((prev) =>
        prev.map((t) =>
          t.id === updatedTask.id ? (updatedTask as CreativeTask) : t,
        ),
      )
    } else if (updatedTask.type === 'STEP') {
      setStepTasks((prev) =>
        prev.map((t) =>
          t.id === updatedTask.id ? (updatedTask as StepTask) : t,
        ),
      )
    } else if (updatedTask.type === 'HABIT') {
      setHabitTasks((prev) =>
        prev.map((t) =>
          t.id === updatedTask.id ? (updatedTask as HabitTask) : t,
        ),
      )
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const tasksData: Task[] = await getAllTasks()
        setTasks(tasksData)
        setStepTasks(tasksData.filter((t) => t.type === 'STEP') as StepTask[])
        setHabitTasks(
          tasksData.filter((t) => t.type === 'HABIT') as HabitTask[],
        )
        setCreativeTasks(
          tasksData.filter((t) => t.type === 'CREATIVE') as CreativeTask[],
        )
      } catch (error) {
        message.error('获取任务数据失败，请重试')
      } finally {
        setLoading(false)
      }
    }
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const refreshData = async () => {
    setLoading(true)
    try {
      const tasksData: Task[] = await getAllTasks()
      setTasks(tasksData)
      setStepTasks(tasksData.filter((t) => t.type === 'STEP') as StepTask[])
      setHabitTasks(tasksData.filter((t) => t.type === 'HABIT') as HabitTask[])
      setCreativeTasks(
        tasksData.filter((t) => t.type === 'CREATIVE') as CreativeTask[],
      )
      message.success('数据已刷新')
    } catch (error) {
      message.error('刷新数据失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
  ) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]])
    }
  }

  const filteredTasks = useMemo(() => {
    if (!dateRange || !tasks.length) return tasks
    const [startDate, endDate] = dateRange
    return tasks.filter((task) => {
      const updatedAt = dayjs(task.updatedAt)
      return updatedAt.isAfter(startDate) && updatedAt.isBefore(endDate)
    })
  }, [tasks, dateRange])

  const taskStats: TaskStats = useMemo(() => {
    const initialStats: TaskStats = { total: 0, avgTimeSpent: 0 }
    if (!tasks.length) return initialStats

    const currentTasksToConsider = filteredTasks

    const completedInPeriod = currentTasksToConsider.filter(
      (t) => t.status === 'COMPLETED',
    ).length
    const inProgressInPeriod = currentTasksToConsider.filter(
      (t) => t.status === 'IN_PROGRESS',
    ).length
    const notStartedInPeriod = currentTasksToConsider.filter(
      (t) => t.status === 'NOT_STARTED',
    ).length
    const overdueInPeriod = currentTasksToConsider.filter(
      (t) => t.status === 'OVERDUE',
    ).length
    const completedTasksWithTimeInPeriod = currentTasksToConsider.filter(
      (t) => t.status === 'COMPLETED' && t.actualTimeMinutes,
    )
    const totalTimeSpentInPeriod = completedTasksWithTimeInPeriod.reduce(
      (sum, task) => sum + (task.actualTimeMinutes || 0),
      0,
    )
    const avgTimeSpentInPeriod = completedTasksWithTimeInPeriod.length
      ? Math.round(
          totalTimeSpentInPeriod / completedTasksWithTimeInPeriod.length,
        )
      : 0

    let calculatedStats: TaskStats = {
      total: currentTasksToConsider.length,
      completed: completedInPeriod,
      inProgress: inProgressInPeriod,
      notStarted: notStartedInPeriod,
      overdue: overdueInPeriod,
      avgTimeSpent: avgTimeSpentInPeriod,
    }

    calculatedStats.totalTasksAllTypes = tasks.length
    const allStepTasksGlobal = tasks.filter(
      (t) => t.type === 'STEP',
    ) as StepTask[]
    const completedAllStepTasksGlobal = allStepTasksGlobal.filter(
      (t) => t.status === 'COMPLETED',
    ).length
    calculatedStats.stepTaskCompletionRateAll = allStepTasksGlobal.length
      ? Math.round(
          (completedAllStepTasksGlobal / allStepTasksGlobal.length) * 100,
        )
      : 0

    const allHabitTasksGlobal = tasks.filter(
      (t) => t.type === 'HABIT',
    ) as HabitTask[]
    if (allHabitTasksGlobal.length > 0) {
      let totalCurrentStreakGlobal = 0
      let habitWithDetailsCountGlobal = 0
      allHabitTasksGlobal.forEach((ht) => {
        if (
          ht.habitTaskDetail &&
          typeof ht.habitTaskDetail.currentStreak === 'number'
        ) {
          totalCurrentStreakGlobal += ht.habitTaskDetail.currentStreak
          habitWithDetailsCountGlobal++
        }
      })
      calculatedStats.habitTaskAverageCurrentStreakAll =
        habitWithDetailsCountGlobal > 0
          ? Math.round(totalCurrentStreakGlobal / habitWithDetailsCountGlobal)
          : 0
    } else {
      calculatedStats.habitTaskAverageCurrentStreakAll = 0
    }

    const completedAllTasksGlobal = tasks.filter(
      (t) => t.status === 'COMPLETED',
    ).length
    calculatedStats.completionRate = tasks.length
      ? Math.round((completedAllTasksGlobal / tasks.length) * 100)
      : 0

    const habitTasksInPeriod = currentTasksToConsider.filter(
      (t) => t.type === 'HABIT',
    ) as HabitTask[]
    if (habitTasksInPeriod.length > 0) {
      let totalCurrentStreakPeriod = 0
      let totalLongestStreakPeriod = 0
      let countWithDetailsPeriod = 0
      habitTasksInPeriod.forEach((ht) => {
        if (
          ht.habitTaskDetail &&
          typeof ht.habitTaskDetail.currentStreak === 'number'
        ) {
          totalCurrentStreakPeriod += ht.habitTaskDetail.currentStreak
          countWithDetailsPeriod++
        }
        if (
          ht.habitTaskDetail &&
          typeof ht.habitTaskDetail.longestStreak === 'number'
        ) {
          totalLongestStreakPeriod += ht.habitTaskDetail.longestStreak
        }
      })
      calculatedStats.habitTaskCurrentStreak =
        countWithDetailsPeriod > 0
          ? Math.round(totalCurrentStreakPeriod / countWithDetailsPeriod)
          : 0
      calculatedStats.habitTaskAverageLongestStreak =
        countWithDetailsPeriod > 0
          ? Math.round(totalLongestStreakPeriod / countWithDetailsPeriod)
          : 0
    } else {
      calculatedStats.habitTaskCurrentStreak = 0
      calculatedStats.habitTaskAverageLongestStreak = 0
    }

    const creativeTasksInPeriod = currentTasksToConsider.filter(
      (t) => t.type === 'CREATIVE',
    ) as CreativeTask[]
    if (creativeTasksInPeriod.length > 0) {
      let totalPhaseScorePeriod = 0
      creativeTasksInPeriod.forEach((ct) => {
        if (ct.currentPhase === 'DRAFTING') totalPhaseScorePeriod += 1
        else if (ct.currentPhase === 'REVIEWING') totalPhaseScorePeriod += 2
        else if (ct.currentPhase === 'FINALIZING') totalPhaseScorePeriod += 3
      })
      calculatedStats.creativeTaskAveragePhase = creativeTasksInPeriod.length
        ? parseFloat(
            (totalPhaseScorePeriod / creativeTasksInPeriod.length).toFixed(1),
          )
        : 0
    } else {
      calculatedStats.creativeTaskAveragePhase = 0
    }

    return calculatedStats
  }, [filteredTasks, tasks])

  const completedTaskTimeline = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = []
    filteredTasks.forEach((task) => {
      if (task.status === 'COMPLETED' && task.completionDate) {
        items.push({
          id: task.id,
          title: task.title,
          status: task.status,
          type: task.type,
          completionDate: new Date(task.completionDate),
          actualTimeMinutes: task.actualTimeMinutes,
          steps: task.type === 'STEP' ? (task as StepTask).steps : undefined, // Use .steps from StepTask
          timelineItemType: 'TASK_COMPLETION',
          timelineDate: new Date(task.completionDate),
          originalTaskData: task,
        })
      }
    })
    const currentHabitTasks = tasks.filter(
      (t) => t.type === 'HABIT',
    ) as HabitTask[]
    currentHabitTasks.forEach((habitTask) => {
      if (habitTask.habitTaskDetail?.checkInRecords) {
        const records = habitTask.habitTaskDetail.checkInRecords
        const [startDate, endDate] = dateRange || [null, null]
        records.forEach((record: CheckInRecordDTO) => {
          const recordDate = dayjs(record.date)
          let includeRecord = true
          if (startDate && endDate) {
            includeRecord = recordDate.isBetween(startDate, endDate, null, '[]')
          }
          if (includeRecord) {
            items.push({
              id: `${habitTask.id}-${record.date}`,
              title: habitTask.title,
              timelineItemType: 'HABIT_CHECK_IN',
              timelineDate: recordDate.toDate(),
              taskType: 'HABIT',
              originalTask: habitTask,
              checkInNote: record.notes,
            })
          }
        })
      }
    })
    return items.sort(
      (a, b) => b.timelineDate.getTime() - a.timelineDate.getTime(),
    )
  }, [filteredTasks, tasks, dateRange])

  const cellRender = (date: Dayjs) => {
    const dayTasks = filteredTasks.filter((task) => {
      if (task.status === 'COMPLETED' && task.completionDate) {
        return dayjs(task.completionDate).isSame(date, 'day')
      }
      return false
    })
    const dayHabitCheckIns = completedTaskTimeline.filter(
      (item) =>
        item.timelineItemType === 'HABIT_CHECK_IN' &&
        dayjs(item.timelineDate).isSame(date, 'day'),
    )
    return (
      <div className="task-calendar-cell">
        {(dayTasks.length > 0 || dayHabitCheckIns.length > 0) && (
          <Badge
            count={dayTasks.length + dayHabitCheckIns.length}
            size="small"
          />
        )}
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Result
          status="403"
          title="访问受限"
          subTitle="请先登录以查看任务进度。"
          extra={
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
            >
              前往登录
            </Button>
          }
        />
      </div>
    )
  }

  const handleHabitCheckIn = async (taskId: number) => {
    setLoadingTaskIds((prev) => new Set(prev).add(taskId))
    try {
      const updateState = (prevTasks: Task[]) =>
        prevTasks.map((t) =>
          t.id === taskId && t.type === 'HABIT'
            ? ({
                ...t,
                habitTaskDetail: t.habitTaskDetail
                  ? {
                      ...t.habitTaskDetail,
                      currentStreak: (t.habitTaskDetail.currentStreak || 0) + 1,
                      lastCompleted: dayjs().format('YYYY-MM-DD'),
                      checkInRecords: [
                        ...(t.habitTaskDetail.checkInRecords || []),
                        {
                          date: dayjs().format('YYYY-MM-DD'),
                          status: 'DONE',
                          notes: '今日已打卡 (自动)',
                        } as CheckInRecordDTO,
                      ],
                    }
                  : {
                      currentStreak: 1,
                      longestStreak: 1,
                      lastCompleted: dayjs().format('YYYY-MM-DD'),
                      checkInRecords: [
                        {
                          date: dayjs().format('YYYY-MM-DD'),
                          status: 'DONE',
                          notes: '今日已打卡 (自动)',
                        } as CheckInRecordDTO,
                      ],
                      frequency: 'DAILY',
                    },
              } as HabitTask)
            : t,
        )
      setHabitTasks((prevHabitTasks) =>
        prevHabitTasks.map((t) =>
          t.id === taskId
            ? (updateState([t])[0] as HabitTask)
            : (t as HabitTask),
        ),
      )
      setTasks(updateState)
      await checkInHabitTask(taskId)
      message.success('打卡成功！')
    } catch (error: any) {
      message.error(
        error.response?.data?.message || '打卡失败，请检查网络或稍后再试',
      )
    } finally {
      setLoadingTaskIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  const handleStepUpdate = async (
    taskId: number,
    stepId: string, // Changed to string
    newStatus: 'PENDING' | 'DONE',
  ) => {
    setLoadingTaskIds((prev) => new Set(prev).add(taskId))
    try {
      await updateStepStatus(taskId, stepId, newStatus) // stepId is string

      const updateStepsRecursive = (steps: Step[]): Step[] => {
        return steps.map((step) => {
          if (step.id === stepId) {
            // Both are strings
            return { ...step, status: newStatus }
          }
          // Step type does not have subSteps
          return step
        })
      }

      const updateTaskInState = (prevTasks: Task[]): Task[] => {
        return prevTasks.map((task) => {
          if (task.id === taskId && task.type === 'STEP') {
            const stepTask = task as StepTask
            const currentSteps = stepTask.steps || []
            const updatedSteps = updateStepsRecursive(currentSteps)

            let newOverallStatus: Task['status'] = 'IN_PROGRESS'
            if (updatedSteps.every((s) => s.status === 'DONE')) {
              newOverallStatus = 'COMPLETED'
            } else if (
              updatedSteps.some(
                (s) => s.status === 'DONE' || s.status === 'PENDING',
              )
            ) {
              newOverallStatus = 'IN_PROGRESS'
            } else if (updatedSteps.length > 0) {
              newOverallStatus = 'NOT_STARTED'
            } else {
              newOverallStatus = stepTask.status
            }

            // Helper to convert Step to StepDTO
            const toStepDTO = (step: Step): StepDTO => ({
              id: step.id,
              title: step.title,
              description: step.description,
              status: step.status,
              order: step.order,
              // validationScore is on StepDTO, not Step. Add if needed or handle.
            })

            return {
              ...stepTask,
              steps: updatedSteps,
              status: newOverallStatus,
              completionDate:
                newOverallStatus === 'COMPLETED'
                  ? new Date()
                  : stepTask.completionDate,
              stepTaskDetail: stepTask.stepTaskDetail
                ? {
                    ...stepTask.stepTaskDetail,
                    steps: updatedSteps.map(toStepDTO), // Convert Step[] to StepDTO[]
                    completedSteps: updatedSteps.filter(
                      (s) => s.status === 'DONE',
                    ).length,
                    blockedSteps: updatedSteps.filter(
                      (s) => s.status === 'BLOCKED',
                    ).length,
                  }
                : undefined,
            } as StepTask
          }
          return task
        })
      }

      setTasks(updateTaskInState)
      setStepTasks((prevStepTasks) =>
        prevStepTasks.map((task) =>
          task.id === taskId
            ? (updateTaskInState([task])[0] as StepTask)
            : task,
        ),
      )

      message.success('步骤状态更新成功！')
    } catch (error) {
      message.error('更新步骤状态失败，请重试。')
    } finally {
      setLoadingTaskIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>任务进度总览</Title>
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Text>日期范围:</Text>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            disabled={loading}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshData}
            loading={loading}
            disabled={loading}
          >
            刷新数据
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key)
          if (key === 'overview') {
            setSelectedTaskForDetailView(null)
          } else {
            const task = tasks.find((t) => t.id.toString() === key)
            setSelectedTaskForDetailView(task || null)
          }
        }}
      >
        <TabPane
          tab="概览 & 统计"
          key="overview"
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                >
                  <Card hoverable>
                    <Statistic
                      title="总任务数 (筛选范围内)"
                      value={taskStats.total}
                    />
                  </Card>
                </Col>
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                >
                  <Card hoverable>
                    <Statistic
                      title="已完成 (筛选范围内)"
                      value={taskStats.completed}
                      valueStyle={{ color: '#3f8600' }}
                    />
                    <Progress
                      percent={
                        taskStats.total
                          ? Math.round(
                              ((taskStats.completed || 0) / taskStats.total) *
                                100,
                            )
                          : 0
                      }
                      status="active"
                      strokeColor={{ from: '#108ee9', to: '#87d068' }}
                    />
                  </Card>
                </Col>
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                >
                  <Card hoverable>
                    <Statistic
                      title="进行中 (筛选范围内)"
                      value={taskStats.inProgress}
                      valueStyle={{ color: '#d48806' }}
                    />
                  </Card>
                </Col>
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                >
                  <Card hoverable>
                    <Statistic
                      title="平均耗时 (已完成)"
                      value={taskStats.avgTimeSpent}
                      suffix="分钟"
                    />
                  </Card>
                </Col>
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                >
                  <Card hoverable>
                    <Statistic
                      title="总体完成率 (所有任务)"
                      value={taskStats.completionRate}
                      precision={0}
                      suffix="%"
                      valueStyle={
                        (taskStats.completionRate || 0) >= 75
                          ? { color: '#3f8600' }
                          : (taskStats.completionRate || 0) >= 50
                          ? { color: '#d48806' }
                          : { color: '#cf1322' }
                      }
                    />
                    <Progress
                      percent={taskStats.completionRate}
                      status={
                        (taskStats.completionRate || 0) >= 100
                          ? 'success'
                          : 'active'
                      }
                    />
                  </Card>
                </Col>
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                >
                  <Card hoverable>
                    <Statistic
                      title="步骤任务总体完成率"
                      value={taskStats.stepTaskCompletionRateAll}
                      precision={0}
                      suffix="%"
                    />
                  </Card>
                </Col>
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                >
                  <Card hoverable>
                    <Statistic
                      title="习惯任务平均当前连胜 (所有)"
                      value={taskStats.habitTaskAverageCurrentStreakAll}
                      precision={0}
                      suffix="天"
                    />
                  </Card>
                </Col>
              </Row>
              <Divider />
              <Row gutter={[16, 24]}>
                <Col span={16}>
                  <Collapse defaultActiveKey={['completedTimeline']}>
                    <Collapse.Panel
                      header="近期完成与打卡时间线 (筛选范围内)"
                      key="completedTimeline"
                    >
                      {completedTaskTimeline.length > 0 ? (
                        <Timeline mode="left">
                          {completedTaskTimeline.map((item) => (
                            <Timeline.Item
                              key={item.id}
                              label={dayjs(item.timelineDate).format(
                                'YYYY-MM-DD HH:mm',
                              )}
                              color={
                                item.timelineItemType === 'TASK_COMPLETION'
                                  ? 'green'
                                  : 'blue'
                              }
                              dot={
                                item.timelineItemType === 'TASK_COMPLETION' ? (
                                  <CheckCircleOutlined />
                                ) : undefined
                              }
                            >
                              <Title level={5}>{item.title}</Title>
                              {item.timelineItemType === 'TASK_COMPLETION' && (
                                <p>
                                  <Tag
                                    color={
                                      (item as TimelineTaskItem).type === 'STEP'
                                        ? 'processing'
                                        : (item as TimelineTaskItem).type ===
                                          'HABIT'
                                        ? 'success'
                                        : 'warning'
                                    }
                                  >
                                    {(item as TimelineTaskItem).type}
                                  </Tag>
                                  {(item as TimelineTaskItem)
                                    .actualTimeMinutes && (
                                    <Text
                                      type="secondary"
                                      style={{ marginLeft: 8 }}
                                    >
                                      耗时:{' '}
                                      {
                                        (item as TimelineTaskItem)
                                          .actualTimeMinutes
                                      }{' '}
                                      分钟
                                    </Text>
                                  )}
                                </p>
                              )}
                              {(item as TimelineCheckInItem).checkInNote && (
                                <Text
                                  type="secondary"
                                  italic
                                >
                                  打卡备注:{' '}
                                  {(item as TimelineCheckInItem).checkInNote}
                                </Text>
                              )}
                              {(item as TimelineTaskItem).type === 'STEP' &&
                                (item as TimelineTaskItem).steps &&
                                ((item as TimelineTaskItem).steps || [])
                                  .length > 0 && (
                                  <div
                                    style={{
                                      marginTop: '8px',
                                      paddingLeft: '20px',
                                    }}
                                  >
                                    <Text strong>完成的步骤:</Text>
                                    <Timeline>
                                      {((item as TimelineTaskItem).steps || [])
                                        .filter(
                                          (step) => step.status === 'DONE',
                                        )
                                        .map((step: StepItemType) => (
                                          <Timeline.Item
                                            key={step.id}
                                            color="green"
                                          >
                                            <div className="step-title-row">
                                              <Text>{step.title}</Text>
                                            </div>
                                            {step.description && (
                                              <Paragraph
                                                type="secondary"
                                                ellipsis={{
                                                  rows: 2,
                                                  expandable: true,
                                                  symbol: '更多',
                                                }}
                                              >
                                                {step.description}
                                              </Paragraph>
                                            )}
                                          </Timeline.Item>
                                        ))}
                                    </Timeline>
                                  </div>
                                )}
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      ) : (
                        <Empty description="筛选范围内暂无已完成任务或打卡记录" />
                      )}
                    </Collapse.Panel>
                  </Collapse>
                </Col>
                <Col span={8}>
                  <Card title="任务日历 (按完成/打卡日期)">
                    <Calendar
                      fullscreen={false}
                      onSelect={(date) =>
                        setActiveTab(date.format('YYYY-MM-DD'))
                      }
                      cellRender={cellRender}
                      value={dateRange ? dateRange[0] : dayjs()}
                      onPanelChange={(date, mode) => {
                        if (mode === 'month') {
                          console.log(
                            'Calendar month changed to:',
                            date.format('YYYY-MM'),
                          )
                        }
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>

        <TabPane
          tab="任务详情与操作"
          key="details"
          disabled={!tasks.length && !loading}
        >
          <ProgressTracker
            preloadedTasks={tasks}
            onTaskSelect={(task: Task) => {
              setSelectedTaskForDetailView(task)
              setActiveTab(task.id.toString())
            }}
            onTabChange={(tabKey) => {
              setActiveTab(tabKey)
              if (
                tabKey === 'overview' ||
                !tasks.find((t) => t.id.toString() === tabKey)
              ) {
                setSelectedTaskForDetailView(null)
              } else {
                const task = tasks.find((t) => t.id.toString() === tabKey)
                setSelectedTaskForDetailView(task || null)
              }
            }}
            onCheckIn={handleHabitCheckIn}
            loadingTaskIds={loadingTaskIds}
            onStepUpdate={handleStepUpdate}
            onTaskUpdate={handleTaskUpdate}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default TaskProgressPage
