import { Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'
import '../../styles/tables.css'
import { Achievement } from '../../types/goals'

const { Link } = Typography

interface AchievementsTableProps {
  data: Achievement[]
  loading?: boolean
}

const AchievementsTable: React.FC<AchievementsTableProps> = ({
  data,
  loading = false,
}) => {
  const columns: ColumnsType<Achievement> = [
    {
      title: '成就名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Link>{text}</Link>,
    },
    {
      title: '完成日期',
      dataIndex: 'completionDate',
      key: 'completionDate',
      sorter: (a, b) =>
        new Date(a.completionDate).getTime() -
        new Date(b.completionDate).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: '目标', value: '目标' },
        { text: '任务', value: '任务' },
      ],
      onFilter: (value: any, record: Achievement) => record.type === value,
      render: (type: Achievement['type']) => (
        <Tag color={type === '目标' ? 'blue' : 'cyan'}>{type}</Tag>
      ),
    },
    {
      title: '关联项',
      dataIndex: 'relatedItemTitle',
      key: 'relatedItemTitle',
      render: (text: string, record: Achievement) => (
        <Tooltip title={`ID: ${record.relatedItemId}`}>
          <Link>{text}</Link>
        </Tooltip>
      ),
    },
    {
      title: '获得积分',
      dataIndex: 'points',
      key: 'points',
      sorter: (a, b) => a.points - b.points,
      render: (points: number) => <Tag color="gold">{points} 分</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip
          placement="topLeft"
          title={description}
        >
          {description}
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      className: 'action-column',
      render: (_: any, record: Achievement) => (
        <Space size="middle">
          <Link>查看详情</Link>
          <Link>分享</Link>
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

export default AchievementsTable
