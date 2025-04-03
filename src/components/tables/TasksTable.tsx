import { Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'
import '../../styles/tables.css'
import { Task } from '../../types/goals'

const { Link } = Typography

interface TasksTableProps {
  data: Task[]
  loading?: boolean
}

const TasksTable: React.FC<TasksTableProps> = ({ data, loading = false }) => {
  const columns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Link>{text}</Link>,
    },
    {
      title: '关联目标',
      dataIndex: 'relatedGoal',
      key: 'relatedGoal',
      render: (text: string) => <Link>{text}</Link>,
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      sorter: (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      filters: [
        { text: '高', value: '高' },
        { text: '中', value: '中' },
        { text: '低', value: '低' },
      ],
      onFilter: (value: any, record: Task) => record.priority === value,
      render: (priority: Task['priority']) => {
        const className = `priority-tag ${
          priority === '高' ? 'high' : priority === '中' ? 'medium' : 'low'
        }`
        return <Tag className={className}>{priority}</Tag>
      },
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      filters: [
        { text: '进行中', value: '进行中' },
        { text: '未开始', value: '未开始' },
        { text: '已完成', value: '已完成' },
      ],
      onFilter: (value: any, record: Task) => record.status === value,
      render: (status: Task['status']) => {
        const className = `status-tag ${
          status === '进行中'
            ? 'in-progress'
            : status === '已完成'
            ? 'completed'
            : 'not-started'
        }`
        return <Tag className={className}>{status}</Tag>
      },
    },
    {
      title: '标签',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <div className="tag-list">
          {tags.map((tag) => (
            <Tag key={tag}>{tag.toUpperCase()}</Tag>
          ))}
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
        rowKey="key"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </div>
  )
}

export default TasksTable
