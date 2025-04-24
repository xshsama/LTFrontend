export {} // 确保此文件被识别为模块
import { CheckOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import {
  Button,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useMemo, useState } from 'react'
import '../../styles/tables.css'
import { Task } from '../../types/task'

const { Link } = Typography
const { TabPane } = Tabs

interface TasksTableProps {
  data: Task[]
  loading?: boolean
  onEdit?: (task: Task) => void
  onDelete?: (id: number) => void
  onStatusChange?: (id: number, status: string) => void
  onRowClick?: (task: Task) => void
  addButton?: React.ReactNode
  goals?: any[] // 添加goals属性
}

// 任务类型的颜色映射
const typeColorMap: Record<string, string> = {
  STEP: 'blue', // 步骤类：蓝色
  HABIT: 'green', // 习惯性：绿色
  CREATIVE: 'purple', // 创作型：紫色
}

// 任务类型的中文名称映射
const typeNameMap: Record<string, string> = {
  STEP: '步骤类',
  HABIT: '习惯性',
  CREATIVE: '创作型',
}

// 状态颜色映射
const statusColorMap: Record<string, string> = {
  NOT_STARTED: 'default',
  IN_PROGRESS: 'processing',
  COMPLETED: 'success',
  OVERDUE: 'error',
  CANCELLED: 'warning',
}

// 状态中文名称映射
const statusNameMap: Record<string, string> = {
  NOT_STARTED: '未开始',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  OVERDUE: '已过期',
  CANCELLED: '已取消',
}

const TasksTable: React.FC<TasksTableProps> = ({
  data,
  loading = false,
  onEdit,
  onDelete,
  onStatusChange,
  onRowClick,
  addButton,
  goals,
}) => {
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // 处理编辑按钮点击
  const handleEdit = (e: React.MouseEvent, record: Task) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(record)
    }
  }

  // 处理删除按钮点击
  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (onDelete && id) {
      onDelete(id)
    }
  }

  // 处理状态更改
  const handleStatusChange = (
    e: React.MouseEvent,
    id: number,
    status: string,
  ) => {
    e.stopPropagation()
    if (onStatusChange) {
      onStatusChange(id, status)
    }
  }

  // 处理行点击
  const handleRowClick = (record: Task) => {
    if (onRowClick) {
      onRowClick(record)
    }
  }

  // 查找任务对应的目标标题
  const getGoalTitle = (task: Task): string => {
    if (!goals || !task.goal) return '-'
    const goal = goals.find((g) => g.id === task.goal?.id)
    return goal ? goal.title : '-'
  }

  // 按类型和状态过滤的任务数据
  const filteredTasks = useMemo(() => {
    let result = [...data]

    // 按类型过滤
    if (activeTab !== 'ALL') {
      result = result.filter((task) => task.type === activeTab)
    }

    // 按状态过滤
    if (statusFilter) {
      result = result.filter((task) => task.status === statusFilter)
    }

    // 添加goalTitle属性
    return result.map((task) => ({
      ...task,
      goalTitle: getGoalTitle(task),
    }))
  }, [data, activeTab, statusFilter, goals])

  const columns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Link strong>{text}</Link>,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={typeColorMap[type] || 'default'}>
          {typeNameMap[type] || type}
        </Tag>
      ),
      filters: Object.entries(typeNameMap).map(([value, text]) => ({
        text,
        value,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status] || 'default'}>
          {statusNameMap[status] || status}
        </Tag>
      ),
      filters: Object.entries(statusNameMap).map(([value, text]) => ({
        text,
        value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '关联目标',
      dataIndex: 'goalTitle',
      key: 'goalTitle',
      ellipsis: {
        showTitle: false,
      },
      render: (goalTitle: string) => (
        <Tooltip title={goalTitle}>{goalTitle}</Tooltip>
      ),
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 80,
      sorter: (a, b) => (a.weight || 0) - (b.weight || 0),
    },
    {
      title: '实际时间(分钟)',
      dataIndex: 'actualTimeMinutes',
      key: 'actualTimeMinutes',
      width: 120,
      sorter: (a, b) => (a.actualTimeMinutes || 0) - (b.actualTimeMinutes || 0),
    },
    {
      title: '完成日期',
      dataIndex: 'completionDate',
      key: 'completionDate',
      width: 120,
      sorter: (a, b) => {
        if (!a.completionDate || !b.completionDate) return 0
        return (
          new Date(a.completionDate).getTime() -
          new Date(b.completionDate).getTime()
        )
      },
      render: (date: string | undefined) =>
        date ? new Date(date).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      className: 'action-column',
      render: (_, record: Task) => (
        <Space size="small">
          {record.status !== 'COMPLETED' && (
            <Tooltip title="标记为已完成">
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={(e) => handleStatusChange(e, record.id!, 'COMPLETED')}
              />
            </Tooltip>
          )}
          <Tooltip title="编辑任务">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => handleEdit(e, record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个任务吗?"
            description="删除后不可恢复"
            onConfirm={(e) => handleDelete(e as React.MouseEvent, record.id!)}
            okText="确定"
            cancelText="取消"
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="table-container">
      <div className="table-header">
        <Typography.Title
          level={4}
          style={{ margin: 0 }}
        >
          任务列表
        </Typography.Title>
        <Space>
          <Select
            allowClear
            placeholder="状态筛选"
            style={{ width: 120 }}
            onChange={(value) => setStatusFilter(value)}
            value={statusFilter}
          >
            {Object.entries(statusNameMap).map(([value, text]) => (
              <Select.Option
                key={value}
                value={value}
              >
                {text}
              </Select.Option>
            ))}
          </Select>
          {addButton}
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="task-type-tabs"
      >
        <TabPane
          tab="全部任务"
          key="ALL"
        />
        <TabPane
          tab="步骤类"
          key="STEP"
        />
        <TabPane
          tab="习惯性"
          key="HABIT"
        />
        <TabPane
          tab="创作型"
          key="CREATIVE"
        />
      </Tabs>

      <Table
        columns={columns}
        dataSource={filteredTasks}
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
