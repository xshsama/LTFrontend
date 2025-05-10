import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, List, Typography, message } from 'antd'
import React from 'react'
import '../styles/TodoList.css'
import { StepDTO, StepTask } from '../types/task' // Import StepDTO, remove unused Step if not needed elsewhere

const { Text } = Typography

interface TodoListProps {
  tasks: StepTask[]
  onTaskUpdate?: () => void // This might be for full list refresh after an update
  onTaskSelect?: (task: StepTask) => void
  onStepUpdate?: (
    taskId: number,
    stepId: string,
    newStatus: 'PENDING' | 'DONE',
  ) => Promise<void> // Added prop
}

const TodoList: React.FC<TodoListProps> = ({
  tasks,
  onTaskUpdate, // Kept for now, parent might still use it for full refresh
  onTaskSelect,
  onStepUpdate, // Destructure onStepUpdate
}) => {
  // refreshData can be removed if onTaskUpdate is solely handled by parent after onStepUpdate
  // const refreshData = () => {
  //   if (onTaskUpdate) {
  //     onTaskUpdate()
  //   }
  // }

  const handleStepStatusChange = async (
    taskId: number,
    stepId: string,
    currentStatusIsDone: boolean,
  ) => {
    if (!onStepUpdate) {
      message.error('步骤更新处理函数未提供')
      return
    }

    const newStatus = currentStatusIsDone ? 'PENDING' : 'DONE'
    const messageKey = `step-${taskId}-${stepId}`
    message.loading({ content: '正在更新步骤状态...', key: messageKey })

    try {
      await onStepUpdate(taskId, stepId, newStatus)
      message.success({
        content:
          newStatus === 'DONE' ? '步骤已标记为完成' : '步骤已标记为未完成',
        key: messageKey,
      })
      // Parent (TaskProgressPage) will handle refreshing data and updating task status if all steps are done.
      // So, refreshData() or onTaskUpdate() call is removed from here.
    } catch (error: any) {
      message.error({
        content: `更新步骤状态失败: ${error.message || '请重试'}`,
        key: messageKey,
      })
      console.error('更新步骤状态失败 (TodoList):', error)
    }
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="todo-container">
        <Text type="secondary">暂无任务</Text>
      </div>
    )
  }

  // tasks prop is now expected to be StepTask[] already, so direct use or further filtering might not be needed
  // If tasks can still contain other types, filtering is good. Assuming it's pre-filtered by parent.
  const stepTasks = tasks // Assuming tasks are already filtered StepTask[] by the parent (ProgressTracker)

  if (stepTasks.length === 0) {
    return (
      <div className="todo-container">
        <Text type="secondary">暂无步骤型任务</Text>
      </div>
    )
  }

  return (
    <div className="todo-container">
      <List
        itemLayout="vertical"
        dataSource={stepTasks}
        renderItem={(task) => (
          <List.Item
            key={task.id}
            className="todo-item"
            onClick={() => onTaskSelect?.(task)}
            style={{ cursor: onTaskSelect ? 'pointer' : 'default' }}
          >
            <div className="todo-header">
              <Text
                delete={task.status === 'COMPLETED'}
                className="todo-title"
              ></Text>
            </div>
            <div className="todo-title-row">
              <span
                className={`todo-status-dot status-${task.status.toLowerCase()}`}
              ></span>
              <Text
                delete={task.status === 'COMPLETED'}
                className="todo-title"
              >
                {task.title}
              </Text>
              {task.status === 'COMPLETED' && (
                <CheckCircleOutlined className="todo-completed-icon" />
              )}
            </div>

            {task.stepTaskDetail?.steps &&
              task.stepTaskDetail.steps.length > 0 && (
                <div className="steps-container">
                  <Text
                    strong
                    style={{ marginTop: 16, marginBottom: 8, display: 'block' }}
                  >
                    步骤:
                  </Text>
                  <List
                    size="small"
                    dataSource={task.stepTaskDetail.steps}
                    renderItem={(
                      step: StepDTO, // Changed type to StepDTO
                    ) => (
                      <List.Item
                        key={step.id}
                        className="step-item"
                      >
                        <div className="step-row">
                          <Text
                            delete={step.status === 'DONE'} // Use step.status
                            className={
                              step.status === 'DONE' ? 'step-completed' : '' // Use step.status
                            }
                          >
                            {step.title}
                          </Text>

                          {step.status === 'DONE' ? ( // Use step.status
                            <div>✅</div>
                          ) : (
                            <Button
                              type="primary"
                              size="small"
                              className="step-action-button"
                              icon={<CheckCircleOutlined />}
                              onClick={() =>
                                handleStepStatusChange(
                                  task.id,
                                  step.id,
                                  step.status === 'DONE', // Pass current status to toggle
                                )
                              }
                            >
                              完成
                            </Button>
                          )}
                        </div>
                        {step.description && (
                          <Text
                            type="secondary"
                            className="step-description"
                          >
                            {step.description}
                          </Text>
                        )}
                      </List.Item>
                    )}
                  />
                </div>
              )}
          </List.Item>
        )}
      />
    </div>
  )
}

export default TodoList
