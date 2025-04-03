import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  LoginOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Button, Result, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const { Title } = Typography

// Define Course interface
export interface Course {
  id: string
  key: string
  name: string
  category: string
  relatedGoalsCount: number
  relatedTasksCount: number
  tags?: string[]
}

export const courseData: Course[] = [] // Provide an empty array

// Define table columns
const courseColumns: ColumnsType<Course> = [
  {
    title: '课程/科目名称',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => (
      <a>
        <BookOutlined style={{ marginRight: 8 }} />
        {text}
      </a>
    ),
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    filters: [
      { text: '编程', value: '编程' },
      { text: '语言', value: '语言' },
      { text: '设计', value: '设计' },
    ],
    onFilter: (value: React.Key | boolean, record: Course) =>
      record.category === value,
  },
  {
    title: '关联目标数',
    dataIndex: 'relatedGoalsCount',
    key: 'relatedGoalsCount',
    sorter: (a: Course, b: Course) => a.relatedGoalsCount - b.relatedGoalsCount,
    align: 'center',
  },
  {
    title: '关联任务数',
    dataIndex: 'relatedTasksCount',
    key: 'relatedTasksCount',
    sorter: (a: Course, b: Course) => a.relatedTasksCount - b.relatedTasksCount,
    align: 'center',
  },
  {
    title: '标签',
    key: 'tags',
    dataIndex: 'tags',
    render: (tags?: string[]) => (
      <>
        {tags?.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </>
    ),
  },
  {
    title: '操作',
    key: 'action',
    render: (_: any, record: Course) => (
      <Space size="middle">
        <Tooltip title="编辑">
          <Button
            shape="circle"
            icon={<EditOutlined />}
          />
        </Tooltip>
        <Tooltip title="删除">
          <Button
            shape="circle"
            icon={<DeleteOutlined />}
            danger
          />
        </Tooltip>
      </Space>
    ),
  },
]

const Courses: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // 处理登录按钮点击
  const handleLogin = () => {
    navigate('/login')
  }

  // 如果未登录，显示提示信息
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Result
          status="info"
          title="课程与科目管理"
          subTitle="登录后可查看和管理您的课程和科目"
          extra={
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleLogin}
            >
              立即登录
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Title
          level={2}
          style={{ marginBottom: 0 }}
        >
          课程/科目
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
        >
          添加课程/科目
        </Button>
      </div>
      <Table
        columns={courseColumns}
        dataSource={courseData}
      />
    </div>
  )
}

export default Courses
