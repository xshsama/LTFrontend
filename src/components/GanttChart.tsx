import { Tag, Timeline, Typography } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import { Task } from '../types/task'

const { Text } = Typography

interface GanttChartProps {
  tasks: Task[]
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green'
      case 'IN_PROGRESS':
        return 'blue'
      case 'OVERDUE':
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <Timeline mode="left">
      {tasks.map((task) => (
        <Timeline.Item
          key={task.id}
          label={dayjs(task.createdAt).format('YYYY-MM-DD')}
          color={getStatusColor(task.status)}
        >
          <Text strong>{task.title}</Text>
          <Tag
            color={getStatusColor(task.status)}
            style={{ marginLeft: 8 }}
          >
            {task.status}
          </Tag>
        </Timeline.Item>
      ))}
    </Timeline>
  )
}

export default GanttChart
