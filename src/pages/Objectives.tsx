import {
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Button, Space, Table, Tabs, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'

const { Title } = Typography
const { TabPane } = Tabs

// --- Goal Definition ---
export interface Goal {
  id: string
  key: string
  name: string
  deadline: string
  priority: '高' | '中' | '低'
  status: '进行中' | '未开始' | '已完成'
  tags: string[]
  courseId: string
}

/* // Commenting out mock data
export const goalData: Goal[] = [
  {
    id: 'goal-1',
    key: '1',
    name: '完成 React 进阶教程',
    deadline: '2025-04-15',
    priority: '高',
    status: '进行中',
    tags: ['React', '前端'],
    courseId: 'course-1',
  },
  {
    id: 'goal-2',
    key: '2',
    name: '学习 TypeScript 类型系统',
    deadline: '2025-04-30',
    priority: '中',
    status: '未开始',
    tags: ['TypeScript', '编程基础'],
    courseId: 'course-1',
  },
  {
    id: 'goal-3',
    key: '3',
    name: '阅读《设计模式》前五章',
    deadline: '2025-05-10',
    priority: '低',
    status: '未开始',
    tags: ['软件设计', '理论'],
    courseId: 'course-generic',
  }, // Assuming a generic course exists or add one
  {
    id: 'goal-4',
    key: '4',
    name: '掌握常用排序算法',
    deadline: '2025-05-20',
    priority: '高',
    status: '进行中',
    tags: ['算法', '数据结构'],
    courseId: 'course-4',
  }, // Linked to new course
  {
    id: 'goal-5',
    key: '5',
    name: '完成商务邮件模拟写作',
    deadline: '2025-04-25',
    priority: '中',
    status: '未开始',
    tags: ['英语', '写作', '商务'],
    courseId: 'course-5',
  }, // Linked to new course
];
*/
export const goalData: Goal[] = [] // Provide an empty array

const goalColumns: ColumnsType<Goal> = [
  {
    title: '目标名称',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  { title: '截止日期', dataIndex: 'deadline', key: 'deadline' },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    render: (priority: Goal['priority']) => {
      let color =
        priority === '高' ? 'volcano' : priority === '中' ? 'geekblue' : 'green'
      return <Tag color={color}>{priority}</Tag>
    },
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'status',
    render: (status: Goal['status']) => {
      let color = status === '进行中' ? 'processing' : 'default'
      if (status === '已完成') color = 'success'
      return <Tag color={color}>{status}</Tag>
    },
  },
  {
    title: '标签',
    key: 'tags',
    dataIndex: 'tags',
    render: (tags: string[]) => (
      <>
        {' '}
        {tags.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green'
          if (tag === 'React') color = 'blue'
          return (
            <Tag
              color={color}
              key={tag}
            >
              {' '}
              {tag.toUpperCase()}{' '}
            </Tag>
          )
        })}{' '}
      </>
    ),
  },
  {
    title: '操作',
    key: 'action',
    render: (_: any, record: Goal) => (
      <Space size="middle">
        {' '}
        <a>编辑</a> <a>删除</a>{' '}
      </Space>
    ),
  },
]

// --- Task Definition ---
export interface Task {
  key: string
  name: string
  deadline: string
  priority: '高' | '中' | '低'
  status: '进行中' | '未开始' | '已完成'
  relatedGoal: string
  goalId: string
  tags: string[]
}

/* // Commenting out mock data
export const taskData: Task[] = [
  {
    key: '1',
    name: '设置 React Router',
    deadline: '2025-04-01',
    priority: '高',
    status: '进行中',
    relatedGoal: '完成 React 进阶教程',
    goalId: 'goal-1',
    tags: ['React', 'Setup'],
  },
  {
    key: '2',
    name: '学习泛型用法',
    deadline: '2025-04-05',
    priority: '中',
    status: '未开始',
    relatedGoal: '学习 TypeScript 类型系统',
    goalId: 'goal-2',
    tags: ['TypeScript'],
  },
  {
    key: '3',
    name: '实现状态管理 (Context API)',
    deadline: '2025-04-10',
    priority: '高',
    status: '未开始',
    relatedGoal: '完成 React 进阶教程',
    goalId: 'goal-1',
    tags: ['React', 'State Management'],
  },
  {
    key: '4',
    name: '阅读单例模式章节',
    deadline: '2025-04-08',
    priority: '低',
    status: '未开始',
    relatedGoal: '阅读《设计模式》前五章',
    goalId: 'goal-3',
    tags: ['Design Pattern'],
  },
  {
    key: '5',
    name: '实现快速排序',
    deadline: '2025-04-18',
    priority: '高',
    status: '未开始',
    relatedGoal: '掌握常用排序算法',
    goalId: 'goal-4',
    tags: ['算法', '实现'],
  },
  {
    key: '6',
    name: '学习冒泡排序原理',
    deadline: '2025-04-12',
    priority: '中',
    status: '进行中',
    relatedGoal: '掌握常用排序算法',
    goalId: 'goal-4',
    tags: ['算法', '理论'],
  },
  {
    key: '7',
    name: '完成产品介绍邮件草稿',
    deadline: '2025-04-20',
    priority: '中',
    status: '未开始',
    relatedGoal: '完成商务邮件模拟写作',
    goalId: 'goal-5',
    tags: ['写作', '商务'],
  },
  {
    key: '8',
    name: '复习 Hooks useMemo',
    deadline: '2025-04-03',
    priority: '高',
    status: '已完成',
    relatedGoal: '完成 React 进阶教程',
    goalId: 'goal-1',
    tags: ['React', 'Hooks'],
  }, // Added completed task
];
*/
export const taskData: Task[] = [] // Provide an empty array

const taskColumns: ColumnsType<Task> = [
  { title: '任务名称', dataIndex: 'name', key: 'name' },
  {
    title: '关联目标',
    dataIndex: 'relatedGoal',
    key: 'relatedGoal',
    render: (goal: string, record: Task) =>
      goal ? (
        <Tooltip title={goal}>
          <LinkOutlined />
        </Tooltip>
      ) : (
        '-'
      ),
  },
  {
    title: '截止日期',
    dataIndex: 'deadline',
    key: 'deadline',
    sorter: (a: any, b: any) =>
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
    onFilter: (value: React.Key | boolean, record: Task) =>
      record.priority === value,
    render: (priority: Task['priority']) => {
      let color =
        priority === '高' ? 'volcano' : priority === '中' ? 'geekblue' : 'green'
      return <Tag color={color}>{priority}</Tag>
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
    onFilter: (value: React.Key | boolean, record: Task) =>
      record.status === value,
    render: (status: Task['status']) => {
      let color =
        status === '进行中'
          ? 'processing'
          : status === '已完成'
          ? 'success'
          : 'default'
      return <Tag color={color}>{status}</Tag>
    },
  }, // Updated status render and filter
  {
    title: '操作',
    key: 'action',
    render: (_: any, record: Task) => (
      <Space size="middle">
        {' '}
        <Tooltip title="编辑">
          <Button
            shape="circle"
            icon={<EditOutlined />}
          />
        </Tooltip>{' '}
        <Tooltip title="删除">
          <Button
            shape="circle"
            icon={<DeleteOutlined />}
            danger
          />
        </Tooltip>{' '}
      </Space>
    ),
  },
]

// --- Combined Component ---
const Objectives: React.FC = () => {
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
          {' '}
          目标与任务{' '}
        </Title>
      </div>
      <Tabs defaultActiveKey="goals">
        <TabPane
          tab="学习目标"
          key="goals"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '16px',
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
            >
              创建新目标
            </Button>
          </div>
          <Table
            columns={goalColumns}
            dataSource={goalData} // Now uses the empty array
          />
        </TabPane>
        <TabPane
          tab="任务管理"
          key="tasks"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '16px',
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
            >
              创建新任务
            </Button>
          </div>
          <Table
            columns={taskColumns}
            dataSource={taskData} // Now uses the empty array
          />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default Objectives
