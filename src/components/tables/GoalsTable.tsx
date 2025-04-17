import { Progress, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'
import '../../styles/tables.css'
import {
  Goal,
  GoalStatus,
  Priority,
  Tag as TagType,
  Task,
} from '../../types/goals'

const { Link } = Typography

interface GoalsTableProps {
  data: Goal[]
  loading?: boolean
  taskTags?: Record<number, TagType[]> // 关联的任务标签映射
  tasks?: Task[] // 所有任务数据，用于计算关联任务的时间总和
  onRowClick?: (goal: Goal) => void
}

const GoalsTable: React.FC<GoalsTableProps> = ({
  data,
  loading = false,
  taskTags = {},
  tasks = [],
  onRowClick,
}) => {
  // 添加行点击处理
  const handleRowClick = (record: Goal) => {
    if (onRowClick) {
      onRowClick(record)
    }
  }
  const columns: ColumnsType<Goal> = [
    {
      title: '目标名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Link>{text}</Link>,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
        />
      ),
      sorter: (a, b) => a.progress - b.progress,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      filters: [
        { text: '紧急', value: 'URGENT' },
        { text: '高', value: 'HIGH' },
        { text: '中', value: 'MEDIUM' },
        { text: '低', value: 'LOW' },
      ],
      onFilter: (value: any, record: Goal) => record.priority === value,
      render: (priority: Priority) => {
        const priorityMap = {
          URGENT: '紧急',
          HIGH: '高',
          MEDIUM: '中',
          LOW: '低',
        }
        const className = `priority-tag ${
          priority === 'URGENT'
            ? 'urgent'
            : priority === 'HIGH'
            ? 'high'
            : priority === 'MEDIUM'
            ? 'medium'
            : 'low'
        }`
        return <Tag className={className}>{priorityMap[priority]}</Tag>
      },
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      filters: [
        { text: '未开始', value: 'NO_STARTED' },
        { text: '进行中', value: 'ONGOING' },
        { text: '已完成', value: 'COMPLETED' },
        { text: '已过期', value: 'EXPIRED' },
      ],
      onFilter: (value: any, record: Goal) => record.status === value,
      render: (status: GoalStatus) => {
        const statusMap = {
          NO_STARTED: '未开始',
          ONGOING: '进行中',
          COMPLETED: '已完成',
          EXPIRED: '已过期',
        }

        let color = 'default'
        if (status === 'COMPLETED') {
          color = 'success'
        } else if (status === 'ONGOING') {
          color = 'processing'
        } else if (status === 'EXPIRED') {
          color = 'error'
        }

        return <Tag color={color}>{statusMap[status]}</Tag>
      },
    },
    {
      title: '学时',
      dataIndex: 'expectedHours',
      key: 'expectedHours',
      render: (
        expectedHours: number | undefined,
        record: Goal,
        index: number,
      ) => {
        // 获取与该目标关联的任务
        const associatedTasks = tasks.filter(
          (task) => task.goalId === record.id,
        )

        // 计算关联任务的总时间（分钟）
        const totalTaskMinutes = associatedTasks.reduce(
          (sum, task) => sum + (task.actualTimeMinutes || 0),
          0,
        )

        // 转换为小时和分钟
        const taskHours = Math.floor(totalTaskMinutes / 60)
        const taskMinutes = totalTaskMinutes % 60

        // 格式化显示文本
        const timeText =
          taskHours > 0
            ? `${taskHours}小时${taskMinutes > 0 ? `${taskMinutes}分钟` : ''}`
            : taskMinutes > 0
            ? `${taskMinutes}分钟`
            : '0分钟'

        return <Tooltip title={`任务总时间: ${timeText}`}>{timeText}</Tooltip>
      },
    },
    {
      title: '标签',
      key: 'tags',
      render: (_: any, record: Goal) => {
        // 从关联的任务中获取标签
        const goalTags = taskTags[record.id] || []

        return (
          <div className="tag-list">
            {goalTags.slice(0, 3).map((tag) => (
              <Tag
                color={tag.color || 'blue'}
                key={tag.id}
              >
                {tag.name}
              </Tag>
            ))}
            {goalTags.length > 3 && (
              <Tooltip
                title={goalTags
                  .slice(3)
                  .map((tag) => tag.name)
                  .join(', ')}
              >
                <Tag>+{goalTags.length - 3}</Tag>
              </Tooltip>
            )}
            {goalTags.length === 0 && (
              <span style={{ color: '#999' }}>无标签</span>
            )}
          </div>
        )
      },
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
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'clickable-row',
        })}
      />
    </div>
  )
}

export default GoalsTable
