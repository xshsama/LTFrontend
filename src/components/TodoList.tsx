import { PlusOutlined } from '@ant-design/icons'
import {
  Tag as AntTag,
  Button,
  Checkbox,
  Collapse,
  List,
  Typography,
} from 'antd'
import React from 'react'
import '../styles/TodoList.css'
import { StepTask, Task, TodoItem } from '../types/task'

const { Text } = Typography
const { Panel } = Collapse

interface TodoListProps {
  tasks: Task[]
}

const TodoList: React.FC<TodoListProps> = ({ tasks }) => {
  // 过滤出包含待办事项的任务或者标记为待办事项列表的步骤
  const tasksWithTodos = tasks.filter((task) => {
    if (task.type === 'STEP' && (task as StepTask).steps) {
      return (task as StepTask).steps!.some(
        (step) => step.asTodoList, // 只要标记为待办事项列表就显示，不再检查todoItems是否存在或有内容
      )
    }
    return false
  })

  if (tasksWithTodos.length === 0) {
    return <Text type="secondary">暂无待办事项</Text>
  }

  return (
    <Collapse
      defaultActiveKey={tasksWithTodos.map((task) => task.id.toString())}
    >
      {tasksWithTodos.map((task) => (
        <Panel
          header={
            <div>
              <Text strong>{task.title}</Text>
              <AntTag
                color={task.status === 'COMPLETED' ? 'success' : 'processing'}
                className="task-tag"
              >
                {task.status === 'COMPLETED' ? '已完成' : '进行中'}
              </AntTag>
            </div>
          }
          key={task.id.toString()}
        >
          {task.type === 'STEP' && (task as StepTask).steps && (
            <>
              {(task as StepTask)
                .steps!.filter(
                  (step) => step.asTodoList, // 只要标记为待办事项列表就显示
                )
                .map((step) => (
                  <div
                    key={step.id}
                    className="todo-step-container"
                  >
                    <div className="todo-step-header">
                      <Text strong>{step.title}</Text>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          // 这里可以添加一个弹窗来添加新的待办事项
                          // 简单起见，这里只显示一个消息
                          // 实际应用中可以添加一个Modal或者使用更复杂的状态管理
                          alert('此功能需要在任务详情中添加')
                        }}
                      >
                        添加
                      </Button>
                    </div>
                    {step.todoItems && step.todoItems.length > 0 ? (
                      <TodoItemsList todoItems={step.todoItems} />
                    ) : (
                      <Text
                        type="secondary"
                        className="todo-empty-text"
                      >
                        暂无待办项，请添加
                      </Text>
                    )}
                  </div>
                ))}
            </>
          )}
        </Panel>
      ))}
    </Collapse>
  )
}

interface TodoItemsListProps {
  todoItems: TodoItem[]
  onToggleComplete?: (item: TodoItem) => void
}

const TodoItemsList: React.FC<TodoItemsListProps> = ({
  todoItems,
  onToggleComplete,
}) => {
  // 切换待办事项完成状态
  const handleToggleComplete = (item: TodoItem) => {
    if (onToggleComplete) {
      onToggleComplete(item)
    } else {
      // 默认本地状态切换实现
      item.completed = !item.completed
      if (item.completed) {
        item.completedAt = new Date()
      } else {
        item.completedAt = undefined
      }
    }
  }

  return (
    <List
      size="small"
      dataSource={todoItems}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              type="text"
              size="small"
              onClick={() => handleToggleComplete(item)}
            >
              {item.completed ? '取消完成' : '完成'}
            </Button>,
          ]}
        >
          <Checkbox
            checked={item.completed}
            disabled
          >
            <Text
              delete={item.completed}
              type={item.completed ? 'secondary' : undefined}
              className={
                item.priority === 2
                  ? 'priority-high'
                  : item.priority === 1
                  ? 'priority-medium'
                  : ''
              }
            >
              {item.content}
            </Text>
          </Checkbox>
        </List.Item>
      )}
    />
  )
}

export default TodoList
