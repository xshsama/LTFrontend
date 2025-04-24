import { Card, Tabs, message } from 'antd'
import React from 'react'
import { getAllTasks } from '../services/taskService'
import { Task } from '../types/task'
import GanttChart from './GanttChart'
import HabitTracker from './HabitTracker'
import TodoList from './TodoList'

const { TabPane } = Tabs

const ProgressTracker: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getAllTasks()
        setTasks(data)
      } catch (error) {
        message.error('获取任务列表失败')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const habitTasks = tasks.filter((t) => t.type === 'HABIT')
  const stepTasks = tasks.filter((t) => t.type === 'STEP')
  const creativeTasks = tasks.filter((t) => t.type === 'CREATIVE')

  return (
    <Card
      title="任务进度跟踪"
      style={{ marginTop: '24px' }}
    >
      <Tabs defaultActiveKey="1">
        <TabPane
          tab="习惯打卡"
          key="1"
        >
          <HabitTracker tasks={habitTasks} />
        </TabPane>
        <TabPane
          tab="步骤清单"
          key="2"
        >
          <TodoList tasks={stepTasks} />
        </TabPane>
        <TabPane
          tab="创作计划"
          key="3"
        >
          <GanttChart tasks={creativeTasks} />
        </TabPane>
      </Tabs>
    </Card>
  )
}

export default ProgressTracker
