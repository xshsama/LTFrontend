import {
  CarryOutOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoginOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import {
  Progress as AntProgress,
  Button,
  Card,
  Col,
  List,
  message,
  Result,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import dayjs from 'dayjs' // Added dayjs
import isToday from 'dayjs/plugin/isToday' // Added isToday plugin
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getGoalsBySubject } from '../services/goalService'
import { getUserSubjects } from '../services/subjectService'
import {
  checkInHabitTask,
  getAllTasks,
  getTasksByGoal,
} from '../services/taskService' // Added checkInHabitTask, getAllTasks
import { Course } from '../types/course'
import { Goal } from '../types/goals'
import { CheckInRecordDTO, HabitTask, Task } from '../types/task' // Added HabitTask, CheckInRecordDTO
import './Dashboard.css'

const { Title, Text, Paragraph } = Typography

dayjs.extend(isToday) // Extend dayjs with isToday plugin

// Helper function to get color for task status Tag
const getTaskStatusColor = (status: Task['status']): string => {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'IN_PROGRESS':
      return 'processing' // Ant Design 'processing' color (blue with animation)
    case 'NOT_STARTED':
      return 'default'
    case 'OVERDUE':
      return 'error'
    case 'BLOCKED':
      return 'warning'
    case 'ARCHIVED':
    case 'PAUSED':
      return 'default' // Or a specific color like 'geekblue' or 'magenta'
    default:
      return 'default'
  }
}

// Helper function to check if a habit task needs to be checked in today
// This is a simplified version. A more robust solution would consider all frequency types and daysOfWeek.
const needsCheckInToday = (task: HabitTask): boolean => {
  if (task.type !== 'HABIT') return false
  // Assuming daily habits for now for simplicity, or if lastCompleted is not today.
  // A full implementation would parse task.frequency, task.daysOfWeek, task.customPattern
  if (task.habitTaskDetail?.lastCompleted) {
    return !dayjs(task.habitTaskDetail.lastCompleted).isToday()
  }
  return true // If never completed, assume it needs check-in
}

const hasCheckedInToday = (task: HabitTask): boolean => {
  if (task.type !== 'HABIT' || !task.habitTaskDetail?.checkInRecords)
    return false
  return task.habitTaskDetail.checkInRecords.some(
    (record) => dayjs(record.date).isToday() && record.status === 'DONE',
  )
}

// --- 新的仪表盘模块组件占位符 ---
const WelcomeAndStats: React.FC<{ username?: string; stats: any }> = ({
  username,
  stats,
}) => {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Title level={3}>你好, {username || '用户'}!</Title>
      <Paragraph>这里是你的学习统计概览。</Paragraph>
      {/* 统计数据稍后填充 */}
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="进行中任务"
            value={stats.inProgressTasks || 0}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="目标完成率"
            value={stats.completionRate || 0}
            suffix="%"
          />
        </Col>
        {/* 移除了活跃课程统计卡片, Col可以调整为适应3个统计项，或保留布局 */}
        <Col span={8}>
          {' '}
          {/* 调整Col span以适应3个统计项，或者可以有其他布局 */}
          {/* 这是一个空的Col，如果需要保持4列布局但只有3个项目，可以这样留空，或者重新分配span */}
        </Col>
      </Row>
    </Card>
  )
}

const TodayFocus: React.FC<{
  tasks: Task[]
  goals: Goal[]
  onHabitCheckIn: (taskId: number) => Promise<void>
  loadingHabitTasks: Set<number>
}> = ({ tasks, goals, onHabitCheckIn, loadingHabitTasks }) => {
  const todayFocusTasks = tasks.filter(
    (t) => t.dueDate && dayjs(t.dueDate).isToday() && t.status !== 'COMPLETED',
  )

  const upcomingTasks = tasks
    .filter(
      (t) =>
        t.dueDate &&
        dayjs(t.dueDate).isAfter(dayjs(), 'day') &&
        t.status !== 'COMPLETED',
    )
    .sort(
      (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
    )
    .slice(0, 3) // Show next 3 upcoming

  const habitTasksToDisplay = tasks.filter(
    (t) =>
      t.type === 'HABIT' &&
      t.status === 'IN_PROGRESS' &&
      needsCheckInToday(t as HabitTask),
  ) as HabitTask[]

  return (
    <Card
      title="今日焦点 / 待办"
      style={{ marginBottom: 24 }}
    >
      <Title level={4}>今日到期任务</Title>
      {todayFocusTasks.length > 0 ? (
        <List
          dataSource={todayFocusTasks}
          renderItem={(item) => {
            const isDueToday = item.dueDate && dayjs(item.dueDate).isToday()
            return (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Link to={`/objectives?taskId=${item.id}`}>
                      {item.title}
                    </Link>
                  }
                  description={
                    <Text type={isDueToday ? 'danger' : undefined}>
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      截止日期: {dayjs(item.dueDate).format('YYYY-MM-DD')}
                      {isDueToday && (
                        <Tag
                          color="red"
                          style={{ marginLeft: 8 }}
                        >
                          今日到期
                        </Tag>
                      )}
                    </Text>
                  }
                />
                <Tag color={getTaskStatusColor(item.status)}>{item.status}</Tag>
              </List.Item>
            )
          }}
        />
      ) : (
        <Text>今日暂无到期任务。</Text>
      )}

      <Title
        level={4}
        style={{ marginTop: 24 }}
      >
        习惯打卡
      </Title>
      {habitTasksToDisplay.length > 0 ? (
        <List
          dataSource={habitTasksToDisplay}
          renderItem={(habit) => (
            <List.Item
              actions={[
                hasCheckedInToday(habit) ? (
                  <Tag
                    icon={<CheckCircleOutlined />}
                    color="success"
                  >
                    今日已打卡
                  </Tag>
                ) : (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => onHabitCheckIn(habit.id)}
                    loading={loadingHabitTasks.has(habit.id)}
                  >
                    打卡
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                title={
                  <Link to={`/objectives?taskId=${habit.id}`}>
                    {habit.title}
                  </Link>
                }
                description={`上次打卡: ${
                  habit.habitTaskDetail?.lastCompleted
                    ? dayjs(habit.habitTaskDetail.lastCompleted).format(
                        'YYYY-MM-DD',
                      )
                    : '从未'
                } | 连胜: ${habit.habitTaskDetail?.currentStreak || 0}天`}
              />
            </List.Item>
          )}
        />
      ) : (
        <Text>今日暂无待打卡的习惯。</Text>
      )}

      <Title
        level={4}
        style={{ marginTop: 24 }}
      >
        即将开始的任务 (最近3条)
      </Title>
      {upcomingTasks.length > 0 ? (
        <List
          dataSource={upcomingTasks}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Link to={`/objectives?taskId=${item.id}`}>{item.title}</Link>
                }
                description={`截止日期: ${dayjs(item.dueDate).format(
                  'YYYY-MM-DD',
                )}`}
              />
              <Tag color={getTaskStatusColor(item.status)}>{item.status}</Tag>
            </List.Item>
          )}
        />
      ) : (
        <Text>暂无即将开始的任务。</Text>
      )}
    </Card>
  )
}

// ActiveCourses 组件定义已移除

interface ActivityItem {
  id: string
  type: 'task' | 'goal'
  title: string
  date: Date
  link: string
}

const RecentActivity: React.FC<{ tasks: Task[]; goals: Goal[] }> = ({
  tasks,
  goals,
}) => {
  const recentActivities: ActivityItem[] = useMemo(() => {
    const completedTasks: ActivityItem[] = tasks
      .filter((t) => t.status === 'COMPLETED' && t.completionDate)
      .map((t) => ({
        id: `task-${t.id}`,
        type: 'task',
        title: t.title,
        date: new Date(t.completionDate!),
        link: `/objectives?taskId=${t.id}`,
      }))

    const completedGoals: ActivityItem[] = goals
      .filter((g) => g.status === 'COMPLETED') // Assuming updatedAt reflects completion time
      .map((g) => ({
        id: `goal-${g.id}`,
        type: 'goal',
        title: g.title,
        date: new Date(g.updatedAt), // Use updatedAt for goals
        link: `/objectives?goalId=${g.id}`,
      }))

    return [...completedTasks, ...completedGoals]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5) // Show latest 5 activities
  }, [tasks, goals])

  return (
    <Card
      title="近期动态/成就"
      style={{ marginBottom: 24 }}
    >
      {recentActivities.length > 0 ? (
        <Timeline>
          {recentActivities.map((item) => (
            <Timeline.Item
              key={item.id}
              dot={
                item.type === 'task' ? (
                  <CarryOutOutlined style={{ fontSize: '16px' }} />
                ) : (
                  <TrophyOutlined style={{ fontSize: '16px' }} />
                )
              }
              color={item.type === 'task' ? 'green' : 'gold'}
            >
              <Link to={item.link}>{item.title}</Link>
              <Text
                type="secondary"
                style={{ marginLeft: 8, fontSize: '0.85em' }}
              >
                ({dayjs(item.date).format('YYYY-MM-DD')})
              </Text>
              {item.type === 'task' && (
                <Tag
                  color="green"
                  style={{ marginLeft: 8 }}
                >
                  任务完成
                </Tag>
              )}
              {item.type === 'goal' && (
                <Tag
                  color="gold"
                  style={{ marginLeft: 8 }}
                >
                  目标达成
                </Tag>
              )}
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Text>最近暂无值得庆祝的动态！</Text>
      )}
    </Card>
  )
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate()
  return (
    <Card
      title="快捷操作"
      style={{ marginBottom: 24 }}
    >
      <Space>
        <Button
          type="primary"
          onClick={() => navigate('/objectives?action=addTask')}
        >
          添加新任务
        </Button>
        <Button onClick={() => navigate('/objectives')}>查看所有目标</Button>
        <Button onClick={() => navigate('/courses')}>浏览课程列表</Button>
      </Space>
    </Card>
  )
}
// --- 模块组件定义结束 ---

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHabitTasks, setLoadingHabitTasks] = useState<Set<number>>(
    new Set(),
  )

  const handleHabitCheckInOptimistic = async (taskId: number) => {
    setLoadingHabitTasks((prev) => new Set(prev).add(taskId))
    // Optimistic UI update
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId && t.type === 'HABIT') {
          const habit = t as HabitTask
          const todayStr = dayjs().format('YYYY-MM-DD')
          // Avoid double check-in if already reflected (e.g. from another component)
          const alreadyCheckedIn = habit.habitTaskDetail?.checkInRecords?.some(
            (r) => r.date === todayStr && r.status === 'DONE',
          )

          if (alreadyCheckedIn) return habit

          return {
            ...habit,
            habitTaskDetail: {
              ...(habit.habitTaskDetail || {
                frequency: 'DAILY',
                currentStreak: 0,
                longestStreak: 0,
                checkInRecords: [],
              }),
              currentStreak: (habit.habitTaskDetail?.currentStreak || 0) + 1,
              lastCompleted: todayStr,
              checkInRecords: [
                ...(habit.habitTaskDetail?.checkInRecords || []),
                {
                  date: todayStr,
                  status: 'DONE',
                  notes: 'Dashboard Check-in',
                } as CheckInRecordDTO,
              ],
            },
          } as HabitTask
        }
        return t
      }),
    )

    try {
      await checkInHabitTask(taskId)
      message.success('打卡成功!')
      // Optionally re-fetch all tasks or just the updated one if backend returns it
      // For simplicity, current optimistic update should suffice for UI responsiveness
    } catch (error) {
      message.error('打卡失败，请稍后重试。')
      // Revert optimistic update if needed, or re-fetch to get actual state
      const tasksData = await getAllTasks() // Re-fetch to ensure consistency on error
      setTasks(tasksData)
    } finally {
      setLoadingHabitTasks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  useEffect(() => {
    console.log(
      '[Dashboard useEffect] Running. isAuthenticated:',
      isAuthenticated,
      'User ID:',
      user?.id,
    )
    const fetchData = async () => {
      console.log(
        '[Dashboard fetchData] Called. isAuthenticated:',
        isAuthenticated,
        'User ID:',
        user?.id,
      )
      if (!isAuthenticated || !user?.id) {
        console.warn(
          '[Dashboard fetchData] Skipping API calls: User not authenticated or user ID missing.',
        )
        setLoading(false)
        return
      }
      console.log('[Dashboard fetchData] Proceeding with API calls...')
      // setLoading(true); // Moved inside try block if fetchData can be called multiple times by event
      try {
        setLoading(true) // Set loading true at the beginning of data fetch attempt
        // 1. Fetch subjects (courses)
        const subjectsResponse = await getUserSubjects()
        const fetchedCourses: Course[] =
          subjectsResponse.data?.data || subjectsResponse.data || []
        console.log('Fetched Courses:', fetchedCourses)
        setCourses(fetchedCourses)

        let fetchedGoals: Goal[] = []
        for (const course of fetchedCourses) {
          if (course.id) {
            const goalsResponse = await getGoalsBySubject(course.id)
            const subjectGoals: Goal[] = Array.isArray(goalsResponse)
              ? goalsResponse
              : []
            fetchedGoals = [...fetchedGoals, ...subjectGoals]
          }
        }
        console.log('All Fetched Goals:', fetchedGoals)
        setGoals(fetchedGoals)

        let fetchedTasks: Task[] = []
        for (const goal of fetchedGoals) {
          if (goal.id) {
            const tasksResponse = await getTasksByGoal(goal.id)
            const goalTasks: Task[] = Array.isArray(tasksResponse)
              ? tasksResponse
              : []
            fetchedTasks = [...fetchedTasks, ...goalTasks]
          }
        }
        console.log('All Fetched Tasks:', fetchedTasks)
        setTasks(fetchedTasks)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.id) {
      fetchData()
    } else {
      setLoading(false) // Ensure loading is false if not authenticated
    }

    const handleGoalUpdateEvent = (event: Event) => {
      console.log(
        'Dashboard received goalUpdated event, refetching data:',
        (event as CustomEvent).detail,
      )
      if (isAuthenticated && user?.id) {
        // Ensure user is still authenticated
        fetchData()
      }
    }

    window.addEventListener('goalUpdated', handleGoalUpdateEvent)
    console.log('[Dashboard useEffect] Added goalUpdated event listener.')

    return () => {
      window.removeEventListener('goalUpdated', handleGoalUpdateEvent)
      console.log('[Dashboard useEffect] Removed goalUpdated event listener.')
    }
  }, [isAuthenticated, user?.id]) // fetchData should be stable or wrapped in useCallback if added as dependency

  // 使用 useMemo 优化数据计算
  const { activeCourses, statistics, goalsByCourse } = useMemo(() => {
    if (loading || !isAuthenticated) {
      return {
        activeCourses: [],
        statistics: {
          inProgressTasks: 0,
          completionRate: 0,
          activeCourseCount: 0,
        },
        goalsByCourse: new Map(),
      }
    }

    const 목표_진행중 = goals.filter((g) => g.status === 'ONGOING')
    console.log(
      '[Dashboard useMemo] Goals with status IN_PROGRESS:',
      목표_진행중,
    )
    const activeCourseIds = new Set(목표_진행중.map((g) => g.subjectId))
    console.log(
      '[Dashboard useMemo] Active course IDs (from in-progress goals):',
      activeCourseIds,
    )

    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS')
    const inProgressTasksCount = inProgressTasks.length
    console.log(
      '[Dashboard useMemo] Tasks with status IN_PROGRESS:',
      inProgressTasks,
    )
    console.log(
      '[Dashboard useMemo] In-progress tasks count:',
      inProgressTasksCount,
    )

    const totalGoalsCount = goals.length
    const completedGoals = goals.filter((g) => g.status === 'COMPLETED')
    const completedGoalsCount = completedGoals.length
    console.log('[Dashboard useMemo] Completed goals:', completedGoals)
    console.log(
      '[Dashboard useMemo] Total goals count:',
      totalGoalsCount,
      'Completed goals count:',
      completedGoalsCount,
    )

    const completionRate =
      totalGoalsCount > 0
        ? Math.round((completedGoalsCount / totalGoalsCount) * 100)
        : 0
    console.log('[Dashboard useMemo] Goal completion rate:', completionRate)

    const currentActiveCourses = courses.filter((c) =>
      activeCourseIds.has(c.id),
    )
    console.log(
      '[Dashboard useMemo] Filtered active courses:',
      currentActiveCourses,
    )

    // Group goals by course ID
    const groupedGoalsByCourse = new Map<number, Goal[]>()
    goals.forEach((goal) => {
      if (goal.subjectId) {
        const existingGoals = groupedGoalsByCourse.get(goal.subjectId) || []
        groupedGoalsByCourse.set(goal.subjectId, [...existingGoals, goal])
      }
    })

    const result = {
      activeCourses: currentActiveCourses,
      statistics: {
        inProgressTasks: inProgressTasksCount,
        completionRate,
        activeCourseCount: currentActiveCourses.length,
      },
      goalsByCourse: groupedGoalsByCourse,
    }
    console.log('[Dashboard useMemo] Calculated statistics:', result.statistics)
    console.log(
      '[Dashboard useMemo] Calculated active courses for prop:',
      result.activeCourses,
    )
    return result
  }, [courses, goals, tasks, loading, isAuthenticated])

  // 处理登录按钮点击
  const handleLogin = () => {
    navigate('/login')
  }

  // 如果未登录，显示提示信息
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <Result
          status="info"
          title="欢迎使用学习跟踪平台"
          subTitle="请先登录查看您的学习数据和进度"
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

  if (loading) {
    return (
      <div
        className="dashboard-container"
        style={{ textAlign: 'center', marginTop: '50px' }}
      >
        <AntProgress type="circle" />
        <p>加载数据中...</p>
      </div>
    )
  }

  return (
    <div
      className="dashboard-container"
      style={{ padding: 24 }}
    >
      {/* A. 欢迎与统计概览区 */}
      <WelcomeAndStats
        username={user?.username}
        stats={statistics}
      />

      {/* B. 今日焦点/待办区 */}
      <TodayFocus
        tasks={tasks}
        goals={goals}
        onHabitCheckIn={handleHabitCheckInOptimistic}
        loadingHabitTasks={loadingHabitTasks}
      />

      {/* C. 我的活跃课程/学科区 (已移除) */}
      {/* <ActiveCourses
        courses={activeCourses}
        goals={goals}
        tasks={tasks}
      /> */}

      {/* D. 近期动态/成就区 */}
      <RecentActivity
        tasks={tasks}
        goals={goals}
      />

      {/* E. 快捷操作区 */}
      <QuickActions />
    </div>
  )
}

export default Dashboard
