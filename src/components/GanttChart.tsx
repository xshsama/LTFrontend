import { Tag, Timeline, Typography } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import { CreativeTask } from '../types/task' // Changed from Task to CreativeTask

const { Text } = Typography

interface GanttChartProps {
  tasks: CreativeTask[] // Changed from Task[] to CreativeTask[]
  onTaskClick?: (task: CreativeTask) => void // Callback when a task item is clicked
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskClick }) => {
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
          <div
            onClick={() => onTaskClick?.(task)}
            style={{ cursor: onTaskClick ? 'pointer' : 'default' }}
          >
            <Text strong>{task.title}</Text>
            <Tag
              color={getStatusColor(task.status)}
              style={{ marginLeft: 8 }}
            >
              {task.status}
            </Tag>
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  )
}

export default GanttChart
