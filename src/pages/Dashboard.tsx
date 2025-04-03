import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BookOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  LoginOutlined,
} from '@ant-design/icons'
import {
  Progress as AntProgress,
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  List,
  Result,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { mockCourseData, mockGoalData, mockTaskData } from '../mock/data'
import { Course } from '../types/course'
import { Goal, Task } from '../types/goals'
import './Dashboard.css'

const { Title, Text } = Typography

// Helper function to find related items
const findGoalsForCourse = (courseId: string): Goal[] =>
  mockGoalData.filter((g) => g.courseId === courseId)

const findTasksForGoal = (goalId: string): Task[] =>
  mockTaskData.filter((t) => t.goalId === goalId)

// Helper to render Goal Panel Header with progress
const renderGoalPanelHeader = (goal: Goal) => {
  const tasks = findTasksForGoal(goal.id)
  const completedTasks = tasks.filter((t) => t.status === '已完成').length
  const progressPercent =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div className="goal-panel-header">
      <Text strong>{goal.name}</Text>
      <Space>
        <Text
          type="secondary"
          className="task-count"
        >
          {completedTasks}/{tasks.length} 任务
        </Text>
        <AntProgress
          percent={progressPercent}
          size="small"
          className="goal-progress"
          status={progressPercent === 100 ? 'success' : 'normal'}
          showInfo={false}
        />
      </Space>
    </div>
  )
}

// 抽取目标任务列表为单独的组件
const GoalTasks: React.FC<{ goal: Goal }> = ({ goal }) => {
  const goalTasks = findTasksForGoal(goal.id)

  if (goalTasks.length === 0) {
    return (
      <div className="no-tasks-message">
        <Text type="secondary">该目标下暂无任务</Text>
      </div>
    )
  }

  return (
    <List
      size="small"
      dataSource={goalTasks}
      className="tasks-list"
      renderItem={(task: Task) => (
        <List.Item className="task-item">
          <List.Item.Meta
            title={
              <Text
                delete={task.status === '已完成'}
                className="task-name"
              >
                {task.name}
              </Text>
            }
            description={
              <Text
                type="secondary"
                className="task-deadline"
              >
                截止: {task.deadline}
              </Text>
            }
          />
          <Tag
            color={
              task.status === '进行中'
                ? 'processing'
                : task.status === '已完成'
                ? 'success'
                : 'default'
            }
          >
            {task.status}
          </Tag>
        </List.Item>
      )}
    />
  )
}

// 抽取课程内容为单独的组件以提高可维护性
const CourseContent: React.FC<{ course: Course }> = ({ course }) => {
  const courseGoals = findGoalsForCourse(course.id)

  if (courseGoals.length === 0) {
    return (
      <div className="no-goals-message">
        <Text type="secondary">该课程下暂无目标</Text>
      </div>
    )
  }

  const collapseItems = courseGoals.map((goal: Goal) => ({
    key: goal.id,
    label: renderGoalPanelHeader(goal),
    children: <GoalTasks goal={goal} />,
    className: 'goal-panel',
  }))

  return (
    <Collapse
      accordion
      ghost
      className="course-collapse"
      items={collapseItems}
    />
  )
}

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // 使用 useMemo 优化数据计算
  const { activeCourses, statistics } = useMemo(() => {
    const activeCourseIds = new Set(
      mockGoalData.filter((g) => g.status === '进行中').map((g) => g.courseId),
    )

    const inProgressTasks = mockTaskData.filter(
      (t) => t.status === '进行中',
    ).length
    const totalGoals = mockGoalData.length
    const completedGoals = mockGoalData.filter(
      (g) => g.status === '已完成',
    ).length
    const completionRate =
      totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

    return {
      activeCourses: mockCourseData.filter((c) => activeCourseIds.has(c.id)),
      statistics: {
        inProgressTasks,
        completionRate,
        activeCourseCount: mockCourseData.filter((c) => c.status === '进行中')
          .length,
      },
    }
  }, []) // 依赖数组为空，因为目前使用的是静态数据

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

  return (
    <div className="dashboard-container">
      <Title
        level={2}
        className="dashboard-title"
      >
        仪表盘
      </Title>

      {/* 统计卡片行 */}
      <Row
        gutter={[24, 24]}
        className="statistics-row"
      >
        <Col
          xs={24}
          sm={12}
          md={12}
          lg={6}
        >
          <Card className="statistic-card">
            <Statistic
              title="进行中的任务"
              value={statistics.inProgressTasks}
              prefix={<CheckSquareOutlined />}
            />
          </Card>
        </Col>
        <Col
          xs={24}
          sm={12}
          md={12}
          lg={6}
        >
          <Card className="statistic-card">
            <Statistic
              title="今日专注时长"
              value={2.5}
              precision={1}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ClockCircleOutlined />}
              suffix="小时"
            />
            <Text
              type="secondary"
              className="trend-indicator negative"
            >
              <ArrowDownOutlined />
              <span>较昨日 -15%</span>
            </Text>
          </Card>
        </Col>
        <Col
          xs={24}
          sm={12}
          md={12}
          lg={6}
        >
          <Card className="statistic-card">
            <Statistic
              title="目标完成率"
              value={statistics.completionRate}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
            <Text
              type="secondary"
              className="trend-indicator positive"
            >
              <ArrowUpOutlined />
              <span>较上周 +10%</span>
            </Text>
          </Card>
        </Col>
        <Col
          xs={24}
          sm={12}
          md={12}
          lg={6}
        >
          <Card className="statistic-card">
            <Statistic
              title="活跃课程数"
              value={statistics.activeCourseCount}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 课程进度部分 */}
      <Title
        level={3}
        className="section-title"
      >
        课程进度
      </Title>
      <Row gutter={[24, 24]}>
        {activeCourses.length > 0 ? (
          activeCourses.map((course: Course) => (
            <Col
              xs={24}
              md={12}
              lg={12}
              key={course.id}
            >
              <Card
                className="course-card"
                title={<Title level={5}>{course.name}</Title>}
                styles={{
                  header: {
                    backgroundColor: '#fafafa',
                    borderBottom: '1px solid #f0f0f0',
                  },
                  body: {
                    padding: '0',
                  },
                }}
              >
                <CourseContent course={course} />
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card className="empty-state-card">
              <Empty description="暂无进行中的课程进度">
                <Link to="/courses">
                  <Button type="primary">去添加课程或目标</Button>
                </Link>
              </Empty>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}

export default Dashboard
