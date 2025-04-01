import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BookOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import {
  Progress as AntProgress, // Import Empty component
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import React from 'react'
import { Link } from 'react-router-dom' // Import Link for the button
// Import data structures and data
import { Course, courseData } from './Courses'
import { Goal, goalData, Task, taskData } from './Objectives'

const { Title, Text } = Typography
const { Panel } = Collapse

// Helper function to find related items
const findGoalsForCourse = (courseId: string) =>
  goalData.filter((g) => g.courseId === courseId)
const findTasksForGoal = (goalId: string) =>
  taskData.filter((t) => t.goalId === goalId)

// Helper to render Goal Panel Header with progress
const renderGoalPanelHeader = (goal: Goal) => {
  const tasks = findTasksForGoal(goal.id)
  const completedTasks = tasks.filter((t) => t.status === '已完成').length
  const progressPercent =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Text strong>{goal.name}</Text>
      <Space>
        <Text
          type="secondary"
          style={{ fontSize: '12px' }}
        >
          {completedTasks}/{tasks.length} 任务
        </Text>
        <AntProgress
          percent={progressPercent}
          size="small"
          style={{ width: 100 }}
          status={progressPercent === 100 ? 'success' : 'normal'}
          showInfo={false}
        />
      </Space>
    </div>
  )
}

const Dashboard: React.FC = () => {
  // Example: Filter for active courses (can be adjusted based on real logic)
  // For testing the Empty state, temporarily set activeCourses to empty array:
  // const activeCourses: Course[] = [];
  const activeCourseIds = new Set(
    goalData.filter((g) => g.status === '进行中').map((g) => g.courseId),
  )
  const activeCourses = courseData.filter((c) => activeCourseIds.has(c.id))

  return (
    <div>
      <Title
        level={2}
        style={{ marginBottom: '32px' }}
      >
        仪表盘
      </Title>
      {/* Statistics Row */}
      <Row
        gutter={[24, 24]}
        style={{ marginBottom: '32px' }}
      >
        <Col
          xs={24}
          sm={12}
          md={12}
          lg={6}
        >
          <Card
            bordered={false}
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
              borderRadius: '8px',
            }}
          >
            <Statistic
              title="进行中的任务"
              value={taskData.filter((t) => t.status === '进行中').length}
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
          <Card
            bordered={false}
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
              borderRadius: '8px',
            }}
          >
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
              style={{
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                marginTop: '8px',
              }}
            >
              <ArrowDownOutlined style={{ color: 'red', marginRight: '4px' }} />
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
          <Card
            bordered={false}
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
              borderRadius: '8px',
            }}
          >
            {(() => {
              const totalGoals = goalData.length
              const completedGoals = goalData.filter(
                (g) => g.status === '已完成',
              ).length
              const completionRate =
                totalGoals > 0
                  ? Math.round((completedGoals / totalGoals) * 100)
                  : 0
              return (
                <Statistic
                  title="目标完成率"
                  value={completionRate}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ArrowUpOutlined />}
                  suffix="%"
                />
              )
            })()}
            <Text
              type="secondary"
              style={{
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                marginTop: '8px',
              }}
            >
              <ArrowUpOutlined style={{ color: 'green', marginRight: '4px' }} />
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
          <Card
            bordered={false}
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
              borderRadius: '8px',
            }}
          >
            <Statistic
              title="活跃课程数"
              value={courseData.length}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
      </Row>
      {/* Course Cards Section */}
      <Title
        level={3}
        style={{ marginBottom: '24px' }}
      >
        课程进度
      </Title>
      <Row gutter={[24, 24]}>
        {activeCourses.length > 0 ? (
          activeCourses.map((course: Course) => {
            const courseGoals = findGoalsForCourse(course.id)
            return (
              <Col
                xs={24}
                md={12}
                lg={12}
                key={course.id}
              >
                <Card
                  title={
                    <Title
                      level={5}
                      style={{ margin: 0 }}
                    >
                      {course.name}
                    </Title>
                  }
                  bordered={false}
                  headStyle={{
                    backgroundColor: '#fafafa',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                  bodyStyle={{ padding: '0' }}
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
                    borderRadius: '8px',
                    marginBottom: '24px',
                  }}
                >
                  {courseGoals.length > 0 ? (
                    <Collapse
                      accordion
                      ghost
                      style={{ borderRadius: '0 0 8px 8px' }}
                    >
                      {courseGoals.map((goal: Goal) => {
                        const goalTasks = findTasksForGoal(goal.id)
                        return (
                          <Panel
                            header={renderGoalPanelHeader(goal)}
                            key={goal.id}
                            style={{ borderBottom: '1px solid #f0f0f0' }}
                          >
                            {goalTasks.length > 0 ? (
                              <List
                                size="small"
                                dataSource={goalTasks}
                                style={{ padding: '0 16px 16px 16px' }}
                                renderItem={(task: Task) => (
                                  <List.Item
                                    style={{
                                      padding: '8px 0',
                                      borderBottom: '1px dashed #f0f0f0',
                                    }}
                                  >
                                    <List.Item.Meta
                                      title={
                                        <Text
                                          delete={task.status === '已完成'}
                                          style={{ fontSize: '14px' }}
                                        >
                                          {task.name}
                                        </Text>
                                      }
                                      description={
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: '12px' }}
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
                                      style={{ marginRight: 0 }}
                                    >
                                      {task.status}
                                    </Tag>
                                  </List.Item>
                                )}
                              />
                            ) : (
                              <div style={{ padding: '16px' }}>
                                <Text type="secondary">该目标下暂无任务</Text>
                              </div>
                            )}
                          </Panel>
                        )
                      })}
                    </Collapse>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                      <Text type="secondary">该课程下暂无目标</Text>
                    </div>
                  )}
                </Card>
              </Col>
            )
          })
        ) : (
          // Empty State when no active courses
          <Col span={24}>
            <Card
              bordered={false}
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
                borderRadius: '8px',
                textAlign: 'center',
                padding: '48px 0',
              }}
            >
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
