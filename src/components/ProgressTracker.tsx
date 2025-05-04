import { Card, Tabs, message } from 'antd'
import React from 'react'
import {
  getAllCreativeTasks,
  getAllHabitTasks,
  getAllStepTasks,
  getAllTasks,
} from '../services/taskService'
import { Task } from '../types/task'
import GanttChart from './GanttChart'
import HabitTracker from './HabitTracker'
import TodoList from './TodoList'

const { TabPane } = Tabs

interface ProgressTrackerProps {
  selectedTaskType?: 'ALL' | 'STEP' | 'HABIT' | 'CREATIVE'
  preloadedTasks?: Task[]
  onTabChange?: (tabKey: string) => void
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  selectedTaskType = 'ALL',
  preloadedTasks,
  onTabChange,
}) => {
  const [tasks, setTasks] = React.useState<Task[]>(preloadedTasks || [])
  const [loading, setLoading] = React.useState(!preloadedTasks)
  const [activeTabKey, setActiveTabKey] = React.useState('1')

  // 根据选定的任务类型决定加载哪种任务
  React.useEffect(() => {
    // 如果已经有预加载的任务，就不需要再获取
    if (preloadedTasks) {
      setTasks(preloadedTasks)
      setLoading(false)
      return
    }

    const fetchTasks = async () => {
      setLoading(true)
      try {
        let data: Task[] = []

        // 根据选定的任务类型调用相应的API
        switch (selectedTaskType) {
          case 'STEP':
            console.log('ProgressTracker: 获取步骤型任务')
            data = await getAllStepTasks()
            break
          case 'HABIT':
            console.log('ProgressTracker: 获取习惯型任务')
            data = await getAllHabitTasks()
            break
          case 'CREATIVE':
            console.log('ProgressTracker: 获取创意型任务')
            data = await getAllCreativeTasks()
            break
          default:
            console.log('ProgressTracker: 获取所有任务')
            data = await getAllTasks()
            break
        }

        setTasks(data)
      } catch (error) {
        console.error('ProgressTracker: 获取任务失败', error)
        message.error('获取任务列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [selectedTaskType, preloadedTasks])

  // 根据任务类型过滤任务
  const habitTasks = tasks.filter((t) => t.type === 'HABIT')
  const stepTasks = tasks.filter((t) => t.type === 'STEP')
  const creativeTasks = tasks.filter((t) => t.type === 'CREATIVE')

  // 处理标签页变化
  const handleTabChange = (key: string) => {
    setActiveTabKey(key)

    // 将选项卡变化通知到父组件
    if (onTabChange) {
      onTabChange(key)

      // 根据标签页自动设置任务类型
      let taskType: 'ALL' | 'STEP' | 'HABIT' | 'CREATIVE' = 'ALL'
      switch (key) {
        case '1':
          taskType = 'HABIT'
          break
        case '2':
          taskType = 'STEP'
          break
        case '3':
          taskType = 'CREATIVE'
          break
      }

      // 将任务类型变化通知给父组件 (可以通过父组件传入的回调函数实现)
      console.log('ProgressTracker: 标签页切换，建议任务类型切换为:', taskType)
    }
  }

  return (
    <Card
      title="任务进度跟踪"
      style={{ marginTop: '24px' }}
      loading={loading}
    >
      <Tabs
        defaultActiveKey="1"
        activeKey={activeTabKey}
        onChange={handleTabChange}
      >
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
