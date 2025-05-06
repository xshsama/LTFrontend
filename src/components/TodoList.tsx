import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, List, Typography, message } from 'antd'
import React from 'react'
import { updateStepStatus, updateTaskStatus } from '../services/taskService'
import '../styles/TodoList.css'
import { Step, StepTask } from '../types/task'

const { Text } = Typography

interface TodoListProps {
  tasks: any[] // 接受tasks属性以兼容ProgressTracker的用法
}

const TodoList: React.FC<TodoListProps> = ({ tasks }) => {
  const refreshData = () => {
    // 触发父组件的刷新方法，或者重新获取数据
    // 假设父组件通过 props 传递了一个名为 onTaskUpdate 的函数来处理数据刷新
    // 如果父组件没有提供这样的函数，需要根据实际情况调整
    if (typeof (tasks as any).onTaskUpdate === 'function') {
      ;(tasks as any).onTaskUpdate()
    } else {
      console.log('Refreshing data...')
      // 这里可以添加重新获取数据的逻辑，例如调用 API
    }
  }

  // 处理步骤状态更改
  const handleStepStatusChange = async (
    taskId: number,
    stepId: string,
    completed: boolean,
  ) => {
    try {
      message.loading('正在更新步骤状态...', 0)
      await updateStepStatus(taskId, stepId, completed ? 'PENDING' : 'DONE')
      message.destroy()
      message.success(completed ? '步骤已标记为未完成' : '步骤已标记为完成')

      // 检查当前任务的所有步骤是否都已完成
      // 重新获取最新的任务数据，确保步骤状态是最新的
      // 这里假设 updateStepStatus 返回更新后的任务数据
      const updatedTask = await updateStepStatus(
        taskId,
        stepId,
        completed ? 'PENDING' : 'DONE',
      )

      if (updatedTask && updatedTask.steps) {
        const allStepsCompleted = updatedTask.steps.every(
          (step) => step.status === 'DONE',
        )
        if (allStepsCompleted && updatedTask.status !== 'COMPLETED') {
          // 如果所有步骤都已完成且任务状态不是 COMPLETED，更新任务状态为 COMPLETED
          message.loading('所有步骤已完成，正在更新任务状态...', 0)
          try {
            // 调用后端接口更新任务状态
            await updateTaskStatus(taskId, 'COMPLETED')
            message.destroy()
            message.success('任务已标记为完成')
          } catch (taskUpdateError) {
            message.destroy()
            message.error('更新任务状态失败，请重试')
            console.error('更新任务状态失败:', taskUpdateError)
          }
        }
      }

      refreshData()
    } catch (error) {
      message.destroy()
      message.error('更新步骤状态失败，请重试')
      console.error('更新步骤状态失败:', error)
    }
  }

  // 如果没有任务或任务数组为空，显示暂无任务的提示
  if (!tasks || tasks.length === 0) {
    return (
      <div className="todo-container">
        <Text type="secondary">暂无任务</Text>
      </div>
    )
  }

  // 筛选出步骤型任务
  const stepTasks = tasks.filter((task) => task.type === 'STEP') as StepTask[]

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

            {/* 显示步骤列表 */}
            {task.steps && task.steps.length > 0 && (
              <div className="steps-container">
                <Text
                  strong
                  style={{ marginTop: 16, marginBottom: 8, display: 'block' }}
                >
                  步骤:
                </Text>
                <List
                  size="small"
                  dataSource={task.steps}
                  renderItem={(step: Step) => (
                    <List.Item
                      key={step.id}
                      className="step-item"
                    >
                      <div className="step-row">
                        <Text
                          delete={step.completed || step.status === 'DONE'}
                          className={
                            step.completed || step.status === 'DONE'
                              ? 'step-completed'
                              : ''
                          }
                        >
                          {step.title}
                        </Text>

                        {/* 完成/取消完成按钮 */}
                        {step.completed || step.status === 'DONE' ? (
                          <div>✅</div>
                        ) : (
                          <Button
                            type="primary"
                            size="small"
                            className="step-action-button"
                            icon={<CheckCircleOutlined />}
                            onClick={() =>
                              handleStepStatusChange(task.id, step.id, false)
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
