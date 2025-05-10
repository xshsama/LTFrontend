import { Card, Tabs, message } from 'antd'
import React from 'react'
import {
  getAllCreativeTasks,
  getAllHabitTasks,
  getAllStepTasks,
  getAllTasks,
} from '../services/taskService'
import { CreativeTask, HabitTask, StepTask, Task } from '../types/task'
import CreativeTaskDetails from './CreativeTaskDetails' // Import CreativeTaskDetails
import HabitTracker from './HabitTracker'
import TodoList from './TodoList'
// GanttChart is no longer used
// import GanttChart from './GanttChart';

const { TabPane } = Tabs

interface ProgressTrackerProps {
  selectedTaskType?: 'ALL' | 'STEP' | 'HABIT' | 'CREATIVE'
  preloadedTasks?: Task[]
  onTabChange?: (tabKey: string) => void
  onCheckIn: (taskId: number) => Promise<void>
  loadingTaskIds?: Set<number>
  onDataRefreshed?: () => void
  onTaskSelect?: (task: Task) => void
  onStepUpdate?: (
    taskId: number,
    stepId: string,
    newStatus: 'PENDING' | 'DONE',
  ) => Promise<void>
  onTaskUpdate?: (updatedTask: Task) => void
  manageTasksPath?: string // New prop for navigation path
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  selectedTaskType = 'ALL',
  preloadedTasks,
  onTabChange,
  onCheckIn,
  loadingTaskIds,
  onDataRefreshed,
  onTaskSelect,
  onStepUpdate,
  onTaskUpdate,
  manageTasksPath, // Destructure new prop
}) => {
  const [tasks, setTasks] = React.useState<Task[]>(preloadedTasks || [])
  const [loading, setLoading] = React.useState(!preloadedTasks)
  const [activeTabKey, setActiveTabKey] = React.useState('1') // Default to first tab

  const refreshTasks = React.useCallback(async () => {
    setLoading(true)
    try {
      let data: Task[] = []
      // Since TaskProgressPage now passes all tasks via preloadedTasks,
      // selectedTaskType based fetching within ProgressTracker might become redundant
      // if preloadedTasks is always provided and up-to-date.
      // For now, keeping the internal fetching logic as a fallback or if preloadedTasks is not given.
      if (preloadedTasks) {
        // If preloadedTasks are provided, use them directly, no need to fetch by type here
        // However, if a refresh is needed independent of preloadedTasks, this logic might still be useful.
        // Consider if refreshTasks should always call getAllTasks or respect selectedTaskType.
        // Given TaskProgressPage's changes, getAllTasks is more consistent.
        console.log(
          'ProgressTracker: Refreshing all tasks as preloadedTasks are primary source',
        )
        data = await getAllTasks()
      } else {
        switch (selectedTaskType) {
          case 'STEP':
            data = await getAllStepTasks()
            break
          case 'HABIT':
            data = await getAllHabitTasks()
            break
          case 'CREATIVE':
            data = await getAllCreativeTasks()
            break
          default:
            data = await getAllTasks()
            break
        }
      }
      setTasks(data)
      message.success('数据已刷新')
    } catch (error) {
      console.error('ProgressTracker: 刷新任务失败', error)
      message.error('刷新任务列表失败')
    } finally {
      setLoading(false)
      onDataRefreshed?.()
    }
  }, [selectedTaskType, onDataRefreshed, preloadedTasks]) // Added preloadedTasks to dependency

  React.useEffect(() => {
    if (preloadedTasks) {
      setTasks(preloadedTasks)
      setLoading(false)
    } else if (!preloadedTasks && selectedTaskType) {
      // Only fetch if no preloaded tasks
      const fetchTasksByType = async () => {
        setLoading(true)
        try {
          let data: Task[] = []
          switch (selectedTaskType) {
            case 'STEP':
              data = await getAllStepTasks()
              break
            case 'HABIT':
              data = await getAllHabitTasks()
              break
            case 'CREATIVE':
              data = await getAllCreativeTasks()
              break
            default: // 'ALL' or undefined
              data = await getAllTasks()
              break
          }
          setTasks(data)
        } catch (error) {
          message.error('获取任务列表失败')
        } finally {
          setLoading(false)
        }
      }
      fetchTasksByType()
    }
  }, [selectedTaskType, preloadedTasks])

  const habitTasks = tasks.filter((t): t is HabitTask => t.type === 'HABIT')
  const stepTasks = tasks.filter((t): t is StepTask => t.type === 'STEP')
  const creativeTasks = tasks.filter(
    (t): t is CreativeTask => t.type === 'CREATIVE',
  )

  const handleTabChange = (key: string) => {
    setActiveTabKey(key)
    if (onTabChange) {
      onTabChange(key)
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
          <HabitTracker
            tasks={habitTasks}
            onCheckIn={onCheckIn}
            loadingTaskIds={loadingTaskIds}
            onTaskSelect={onTaskSelect}
            manageTasksPath={manageTasksPath} // Pass down prop
          />
        </TabPane>
        <TabPane
          tab="步骤清单"
          key="2"
        >
          <TodoList
            tasks={stepTasks}
            onTaskUpdate={refreshTasks} // This can be used to trigger a refresh of ProgressTracker's tasks
            onTaskSelect={onTaskSelect}
            onStepUpdate={onStepUpdate}
          />
        </TabPane>
        <TabPane
          tab="创作计划"
          key="3"
        >
          {creativeTasks.length > 0 && onTaskUpdate ? (
            <CreativeTaskDetails
              task={creativeTasks[0]}
              onUpdate={onTaskUpdate}
              manageTasksPath={manageTasksPath} // Pass down prop
            />
          ) : (
            <p>暂无创作任务或更新处理器未提供。</p>
          )}
        </TabPane>
      </Tabs>
    </Card>
  )
}

export default ProgressTracker
