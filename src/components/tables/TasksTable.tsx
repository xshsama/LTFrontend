import { Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'
import '../../styles/tables.css'
import { Task, TaskStatus, Weight } from '../../types/goals'

const { Link } = Typography

interface TasksTableProps {
  data: Task[]
  loading?: boolean
  onRowClick?: (task: Task) => void
}

const TasksTable: React.FC<TasksTableProps> = ({
  data,
  loading = false,
  onRowClick,
}) => {
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
          {record.tags && record.tags.length > 0 ? (
            <>
              {record.tags.slice(0, 3).map((tag) => (
                <Tag
                  color={tag.color || 'blue'}
                  key={tag.id}
                >
                  {tag.name}
                </Tag>
              ))}
              {record.tags.length > 3 && (
                <Tooltip
                  title={record.tags
                    .slice(3)
                    .map((tag) => tag.name)
                    .join(', ')}
                >
                  <Tag>+{record.tags.length - 3}</Tag>
                </Tooltip>
              )}
            </>
          ) : (
            <span className="no-tags">无标签</span>
          )}
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
