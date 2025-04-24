import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'
import '../../styles/tables.css'
import { Subject as BaseSubject } from '../../types/goals'

const { Link } = Typography

// 学科接口定义
interface Subject extends BaseSubject {
  categoriesCount?: number
  goalsCount?: number
  completionRate?: number
}

interface SubjectTableProps {
  data: Subject[]
  loading?: boolean
  onEdit?: (subject: Subject) => void
  onDelete?: (id: number) => void
  onRowClick?: (subject: Subject) => void
  addButton?: React.ReactNode
}

const SubjectTable: React.FC<SubjectTableProps> = ({
  data,
  loading = false,
  onEdit,
  onDelete,
  onRowClick,
  addButton,
}) => {
  // 处理编辑按钮点击
  const handleEdit = (e: React.MouseEvent, record: Subject) => {
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

  // 处理行点击
  const handleRowClick = (record: Subject) => {
    if (onRowClick) {
      onRowClick(record)
    }
  }

  const columns: ColumnsType<Subject> = [
    {
      title: '学科名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Link strong>{text}</Link>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '分类数量',
      dataIndex: 'categoriesCount',
      key: 'categoriesCount',
      width: 120,
      sorter: (a, b) => (a.categoriesCount || 0) - (b.categoriesCount || 0),
      render: (count: number | undefined) => count || 0,
    },
    {
      title: '目标数量',
      dataIndex: 'goalsCount',
      key: 'goalsCount',
      width: 120,
      sorter: (a, b) => (a.goalsCount || 0) - (b.goalsCount || 0),
      render: (count: number | undefined) => count || 0,
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 120,
      sorter: (a, b) => (a.completionRate || 0) - (b.completionRate || 0),
      render: (rate: number | undefined) => (
        <Tag color={getCompletionRateColor(rate)}>
          {rate ? `${Math.round(rate)}%` : '0%'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return a.createdAt.getTime() - b.createdAt.getTime()
      },
      render: (date: Date | undefined) =>
        date ? date.toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      className: 'action-column',
      render: (_, record: Subject) => (
        <Space size="middle">
          <Tooltip title="编辑学科">
            <EditOutlined
              onClick={(e) => handleEdit(e, record)}
              className="action-icon"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个学科吗?"
            description="删除此学科将会删除其下所有的分类和目标。"
            onConfirm={(e) => handleDelete(e as React.MouseEvent, record.id!)}
            okText="确定"
            cancelText="取消"
            onCancel={(e) => e?.stopPropagation()}
          >
            <DeleteOutlined
              className="action-icon delete-icon"
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="table-container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <Typography.Title
          level={4}
          style={{ margin: 0 }}
        >
          学科列表
        </Typography.Title>
        {addButton}
      </div>

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

// 根据完成率获取颜色
const getCompletionRateColor = (rate: number | undefined): string => {
  if (!rate) return 'default'
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'processing'
  if (rate >= 20) return 'warning'
  return 'error'
}

export default SubjectTable
