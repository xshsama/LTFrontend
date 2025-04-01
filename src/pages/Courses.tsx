import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Button, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'

const { Title } = Typography

// Define Course interface
export interface Course {
  // Added export
  id: string // Added id for linking
  key: string
  name: string
  category: string // e.g., '编程', '语言', '设计'
  relatedGoalsCount: number // Number of goals linked to this course
  relatedTasksCount: number // Number of tasks linked to this course
  tags?: string[]
}

// Example data
/* // Commenting out mock data
export const courseData: Course[] = [
  // Added export
  {
    id: 'course-1', // Added id
    key: '1',
    name: 'React 深度学习',
    category: '编程',
    relatedGoalsCount: 2,
    relatedTasksCount: 5,
    tags: ['前端', 'JavaScript', '框架'],
  },
  {
    id: 'course-2', // Added id
    key: '2',
    name: '高级英语写作',
    category: '语言',
    relatedGoalsCount: 1,
    relatedTasksCount: 3,
    tags: ['英语', '写作'],
  },
  {
    id: 'course-3', // Added id
    key: '3',
    name: 'UI/UX 设计基础',
    category: '设计',
    relatedGoalsCount: 0,
    relatedTasksCount: 2,
    tags: ['设计', '用户体验'],
  },
  {
    id: 'course-4', // Added id
    key: '4',
    name: '数据结构与算法',
    category: '编程',
    relatedGoalsCount: 1, // Example count
    relatedTasksCount: 4, // Example count
    tags: ['算法', '基础'],
  },
  {
    id: 'course-5', // Added id
    key: '5',
    name: '商务英语口语',
    category: '语言',
    relatedGoalsCount: 1, // Example count
    relatedTasksCount: 2, // Example count
    tags: ['英语', '口语', '商务'],
  },
];
*/
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
    ), // Add icon and make clickable
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    filters: [
      // Example filters based on data
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
