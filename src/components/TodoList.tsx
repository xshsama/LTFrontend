import { Checkbox, List, Typography } from 'antd'
import React from 'react'
import { Task } from '../types/task'

const { Text } = Typography

interface TodoListProps {
  tasks: Task[]
}

const TodoList: React.FC<TodoListProps> = ({ tasks }) => {
  return (
    <List
      dataSource={tasks}
      renderItem={(task) => (
        <List.Item>
          <Checkbox checked={task.status === 'ARCHIVED'}>
            <Text delete={task.status === 'ARCHIVED'}>{task.title}</Text>
          </Checkbox>
        </List.Item>
      )}
    />
  )
}

export default TodoList
