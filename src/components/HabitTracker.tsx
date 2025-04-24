import { Checkbox, Col, Row, Typography } from 'antd'
import React from 'react'
import { Task } from 'types/task'

const { Title, Text } = Typography

interface HabitTrackerProps {
  tasks: Task[]
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ tasks }) => {
  // 按周分组习惯任务
  const weeklyHabits = tasks.reduce((acc, task) => {
    const week = task.completionDate
      ? `Week ${Math.ceil(task.completionDate.getDate() / 7)}`
      : '未完成'
    if (!acc[week]) {
      acc[week] = []
    }
    acc[week].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  return (
    <div style={{ marginTop: '16px' }}>
      <Title level={4}>习惯打卡表</Title>
      {Object.entries(weeklyHabits).map(([week, weekTasks]) => (
        <div
          key={week}
          style={{ marginBottom: '16px' }}
        >
          <Text strong>{week}</Text>
          <Row
            gutter={[16, 8]}
            style={{ marginTop: '8px' }}
          >
            {weekTasks.map((task) => (
              <Col
                span={8}
                key={task.id}
              >
                <Checkbox checked={task.status === 'COMPLETED'}>
                  {task.title}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  )
}

export default HabitTracker
