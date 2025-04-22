import { Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState } from 'react'
import '../../styles/tables.css'
import { Goal, Task, TaskStatus, Weight } from '../../types/goals'
import TaskTags from '../TaskTags'

const { Link } = Typography

interface TasksTableProps {
  data: Task[]
  goals: Goal[]
  loading?: boolean
  onRowClick?: (task: Task) => void
  refreshKey?: number // 添加刷新键属性
}

const TasksTable: React.FC<TasksTableProps> = ({
  data,
  goals,
  loading = false,
  onRowClick,
  refreshKey = 0,
}) => {
  // 添加一个状态来跟踪标签刷新
  const [tagRefreshTrigger, setTagRefreshTrigger] = useState(0)

  // 当外部refreshKey变化时更新内部标签刷新触发器
  useEffect(() => {
    setTagRefreshTrigger((prev) => prev + 1)
  }, [refreshKey])
  // 添加行点击处理
  const handleRowClick = (record: Task) => {
    if (onRowClick) {
      onRowClick(record)
    }
  }

  const columns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Link>{text}</Link>,
    },
    {
      title: '关联目标',
      key: 'goal',
      render: (_: any, record: Task) => {
        const goal = goals.find((g: Goal) => g.id === record.goalId)
        return goal ? <Link>{goal.title}</Link> : '-'
      },
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      sorter: (a: Task, b: Task) => a.weight - b.weight,
      render: (weight: Weight) => {
        let weightClass = 'medium'
        let weightText = weight.toString()

        if (weight >= 8) {
          weightClass = 'high'
        } else if (weight >= 5) {
          weightClass = 'medium'
        } else {
          weightClass = 'low'
        }

        const className = `priority-tag ${weightClass}`
        return <Tag className={className}>{weightText}</Tag>
      },
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      filters: [
        { text: '未开始', value: 'NOT_STARTED' },
        { text: '进行中', value: 'IN_PROGRESS' },
        { text: '已完成', value: 'COMPLETED' },
        { text: '已过期', value: 'OVERDUE' },
        { text: '已取消', value: 'CANCELLED' },
      ],
      onFilter: (value: any, record: Task) => record.status === value,
      render: (status: TaskStatus) => {
        const statusMap = {
          NOT_STARTED: '未开始',
          IN_PROGRESS: '进行中',
          COMPLETED: '已完成',
          OVERDUE: '已过期',
          CANCELLED: '已取消',
        }

        let color = 'default'
        if (status === 'COMPLETED') {
          color = 'success'
        } else if (status === 'IN_PROGRESS') {
          color = 'processing'
        } else if (status === 'OVERDUE') {
          color = 'error'
        } else if (status === 'CANCELLED') {
          color = 'warning'
        }

        return <Tag color={color}>{statusMap[status]}</Tag>
      },
    },
    {
      title: '已投入时间',
      dataIndex: 'actualTimeMinutes',
      key: 'actualTimeMinutes',
      render: (time: number) => {
        const actualHours = Math.floor(time / 60)
        const actualMinutes = time % 60

        return (
          <span>
            {actualHours > 0 ? `${actualHours}小时` : ''}
            {actualMinutes > 0
              ? `${actualMinutes}分钟`
              : actualHours > 0
              ? ''
              : '0分钟'}
          </span>
        )
      },
    },
    {
      title: '标签',
      key: 'tags',
      dataIndex: 'tags',
      render: (_, record: Task) => (
        <div className="tag-list">
          <TaskTags
            taskId={record.id}
            maxDisplay={3}
            refreshTrigger={tagRefreshTrigger} // 传递刷新触发器
          />
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      className: 'action-column',
      render: (_: any, record: Task) => (
        <Space size="middle">
          <Link>编辑</Link>
          <Link>删除</Link>
        </Space>
      ),
    },
  ]

  return (
    <div className="table-container">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'clickable-row',
        })}
      />
    </div>
  )
}

export default TasksTable
