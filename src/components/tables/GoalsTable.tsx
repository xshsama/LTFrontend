import { Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'
import '../../styles/tables.css'
import { Goal } from '../../types/goals'

interface GoalsTableProps {
  data: Goal[]
  loading?: boolean
}

const GoalsTable: React.FC<GoalsTableProps> = ({ data, loading = false }) => {
  const columns: ColumnsType<Goal> = [
    {
      title: '目标名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a>{text}</a>,
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
      onFilter: (value: any, record: Goal) => record.priority === value,
      render: (priority: Goal['priority']) => {
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
      onFilter: (value: any, record: Goal) => record.status === value,
      render: (status: Goal['status']) => {
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
      render: (_: any, record: Goal) => (
        <Space size="middle">
          <a>编辑</a>
          <a>删除</a>
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
      />
    </div>
  )
}

export default GoalsTable
