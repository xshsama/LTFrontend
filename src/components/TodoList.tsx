import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, List, Typography, message } from 'antd'
import React from 'react'
import { updateStepStatus, updateTask } from '../services/taskService'
import '../styles/TodoList.css'
import { Step, StepTask, Task } from '../types/task'

const { Text } = Typography

interface TodoListProps {
  tasks: any[] // 接受tasks属性以兼容ProgressTracker的用法
  onTaskUpdate?: () => void // 添加数据更新回调
}

const TodoList: React.FC<TodoListProps> = ({ tasks, onTaskUpdate }) => {
  const refreshData = () => {
    // 触发父组件的刷新方法，或者重新获取数据
    if (onTaskUpdate) {
      onTaskUpdate()
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
    const messageKey = `step-${taskId}-${stepId}`
    try {
      // 使用唯一的key避免消息冲突
      message.loading({ content: '正在更新步骤状态...', key: messageKey })

      console.log(
        `尝试更新任务ID=${taskId} 步骤ID=${stepId} 状态为 ${
          completed ? 'PENDING' : 'DONE'
        }`,
      )

      // 调用API更新步骤状态
      const updatedTaskResponse = await updateStepStatus(
        taskId,
        stepId,
        completed ? 'PENDING' : 'DONE',
      )

      // 只有成功后才销毁loading消息
      message.success({
        content: completed ? '步骤已标记为未完成' : '步骤已标记为完成',
        key: messageKey,
      })

      // 检查是否所有步骤都已完成，若是则更新任务状态
      if (updatedTaskResponse && updatedTaskResponse.steps) {
        const allStepsCompleted = updatedTaskResponse.steps.every(
          (step) => step.status === 'DONE',
        )

        if (allStepsCompleted && updatedTaskResponse.status !== 'COMPLETED') {
          const taskUpdateKey = `task-${taskId}`
          // 如果所有步骤都已完成且任务状态不是 COMPLETED，更新任务状态为 COMPLETED
          message.loading({
            content: '所有步骤已完成，正在更新任务状态...',
            key: taskUpdateKey,
          })

          try {
            // 调用后端接口更新任务状态和完成日期
            await updateTask(taskId, {
              status: 'COMPLETED' as Task['status'],
              completionDate: new Date(),
            })

            message.success({
              content: '任务已标记为完成',
              key: taskUpdateKey,
            })
          } catch (taskUpdateError: any) {
            console.error('更新任务状态失败:', taskUpdateError)

            // 检查是否是授权问题
            if (
              taskUpdateError.response &&
              taskUpdateError.response.status === 403
            ) {
              message.error({
                content: '权限不足，无法更新任务状态，请检查登录状态',
                key: taskUpdateKey,
                duration: 5,
              })
            } else {
              message.error({
                content: '更新任务状态失败，请重试',
                key: taskUpdateKey,
              })
            }
          }
        }
      }

      // 调用刷新数据函数通知父组件数据已更改
      refreshData()
    } catch (error: any) {
      console.error('更新步骤状态失败:', error)

      // 根据错误类型给出更明确的错误消息
      if (error.response) {
        // 处理HTTP错误
        switch (error.response.status) {
          case 401:
            message.error({
              content: '会话已过期，请重新登录',
              key: messageKey,
              duration: 5,
            })
            break
          case 403:
            message.error({
              content: '权限不足，无法更新步骤状态',
              key: messageKey,
              duration: 5,
            })
            break
          case 404:
            message.error({
              content: '任务或步骤不存在',
              key: messageKey,
            })
            break
          default:
            message.error({
              content: `服务器错误 (${error.response.status})，请稍后重试`,
              key: messageKey,
            })
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        message.error({
          content: '网络错误，请检查网络连接',
          key: messageKey,
        })
      } else {
        // 其他错误
        message.error({
          content: '更新步骤状态失败，请重试',
          key: messageKey,
        })
      }
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
