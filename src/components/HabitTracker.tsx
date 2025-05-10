import { CalendarOutlined } from '@ant-design/icons' // Added icon
import { Button, Col, Row, Statistic, Tooltip, Typography } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom' // Added Link import
import { HabitTask } from '../types/task'

const { Title, Text } = Typography

interface HabitTrackerProps {
  tasks: HabitTask[]
  onCheckIn: (taskId: number) => Promise<void>
  loadingTaskIds?: Set<number>
  onTaskSelect?: (task: HabitTask) => void
  manageTasksPath?: string // New prop for navigation path
}

const HabitTracker: React.FC<HabitTrackerProps> = ({
  tasks = [],
  onCheckIn,
  loadingTaskIds = new Set(),
  onTaskSelect,
  manageTasksPath, // Destructure new prop
}) => {
  const handleCheckInClick = (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation() // Prevent potential parent clicks
    onCheckIn(taskId) // Call the parent handler
  }

  // Helper to check if already checked in today
  const isCheckedInToday = (task: HabitTask): boolean => {
    const lastCompletedString = task.habitTaskDetail?.lastCompleted
    if (!lastCompletedString) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastCompletedDate = new Date(lastCompletedString)
    if (isNaN(lastCompletedDate.getTime())) return false // Invalid date
    lastCompletedDate.setHours(0, 0, 0, 0)
    return lastCompletedDate.getTime() === today.getTime()
  }

  if (!tasks || tasks.length === 0) {
    return <Text>没有需要追踪的习惯任务。</Text>
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <Title level={4}>习惯追踪与打卡</Title>
      <Row gutter={[16, 16]}>
        {' '}
        {/* Add gutter for spacing */}
        {tasks.map((task) => {
          const alreadyCheckedIn = isCheckedInToday(task)
          const isLoading = loadingTaskIds.has(task.id)
          const currentStreak = task.habitTaskDetail?.currentStreak ?? 0
          const longestStreak = task.habitTaskDetail?.longestStreak ?? 0

          return (
            <Col
              xs={24}
              sm={12}
              md={8}
              lg={6}
              key={task.id}
            >
              {' '}
              {/* Responsive grid */}
              <div
                style={{
                  border: '1px solid #d9d9d9',
                  padding: '16px',
                  borderRadius: '4px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: onTaskSelect ? 'pointer' : 'default', // Add cursor pointer if selectable
                }}
                onClick={() => onTaskSelect?.(task)} // Call onTaskSelect when the card is clicked
              >
                <div>
                  <Text strong>{task.title}</Text>
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-around',
                    }}
                  >
                    <Statistic
                      title="当前连胜"
                      value={`${currentStreak} 天`}
                      valueStyle={{ fontSize: '1.2em' }}
                    />
                    <Statistic
                      title="最长连胜"
                      value={`${longestStreak} 天`}
                      valueStyle={{ fontSize: '1.2em' }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <Tooltip
                    title={
                      task.status === 'COMPLETED'
                        ? '任务已完成'
                        : alreadyCheckedIn
                        ? '今日已打卡'
                        : '今日打卡'
                    }
                  >
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={(e) => handleCheckInClick(e, task.id)}
                      disabled={
                        alreadyCheckedIn ||
                        isLoading ||
                        task.status === 'COMPLETED'
                      }
                      loading={isLoading}
                      block
                    >
                      {task.status === 'COMPLETED'
                        ? '已完成'
                        : alreadyCheckedIn
                        ? '已打卡'
                        : '打卡'}
                    </Button>
                  </Tooltip>
                  <Link
                    to={manageTasksPath || '/tasks'}
                    style={{ width: '100%' }}
                  >
                    <Button block>管理任务</Button>
                  </Link>
                </div>
              </div>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

export default HabitTracker
