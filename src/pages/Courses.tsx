import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  LoginOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  Button,
  Modal,
  Result,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SubjectForm from '../components/forms/SubjectForm'
import { useAuth } from '../contexts/AuthContext'
import {
  createSubject,
  getCategoryBySubject,
  getUserSubjects,
  updateSubject,
} from '../services/subjectService'

const { Title } = Typography

// Define Course interface
export interface Course {
  id: string
  key: string
  name: string
  category: string
  categoryId?: number // 添加categoryId字段
  description?: string // 添加description字段
  relatedGoalsCount: number
  relatedTasksCount: number
  tags?: string[]
}

// 初始化为空数组，将通过API调用获取数据
export const courseData: Course[] = []

// 定义表格列
const createCourseColumns = (
  handleEdit: (record: Course) => void,
  handleDelete: (record: Course) => void,
): ColumnsType<Course> => [
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
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
        <Tooltip title="删除">
          <Button
            shape="circle"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record)}
          />
        </Tooltip>
      </Space>
    ),
  },
]

const Courses: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // 获取课程/科目数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses()
    }
  }, [isAuthenticated])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await getUserSubjects()

      // 创建一个暂存对象，通过Promise.all处理所有异步请求
      const subjectsWithCategories = await Promise.all(
        response.data.map(async (subject: any) => {
          let categoryName = '未分类'
          let categoryId = null

          // 如果有科目ID，则通过API获取对应的分类信息
          if (subject.id) {
            try {
              // 通过getCategoryBySubject API获取分类信息
              const categoryResponse = await getCategoryBySubject(subject.id)
              if (categoryResponse.data && categoryResponse.data.name) {
                categoryName = categoryResponse.data.name
                categoryId = categoryResponse.data.id
              }
            } catch (error) {
              console.error(`获取科目${subject.id}的分类信息失败:`, error)
            }
          }

          // 返回包含分类名称和ID的科目信息
          return {
            id: subject.id,
            key: subject.id.toString(),
            name: subject.title,
            categoryId: categoryId, // 保存分类ID用于编辑
            category: categoryName, // 显示实际的分类名称
            relatedGoalsCount: subject.totalGoals || 0,
            relatedTasksCount: subject.totalTasks || 0,
            tags: subject.tags || [],
            description: subject.description,
          }
        }),
      )

      setCourses(subjectsWithCategories)
    } catch (error) {
      console.error('获取课程数据失败:', error)
      messageApi.error('获取课程数据失败，请稍后再试!')
    } finally {
      setLoading(false)
    }
  }

  // 处理表单提交（创建或更新课程）
  const handleSubmit = async (data: any) => {
    try {
      setLoading(true)
      if (isEditing && editingCourse) {
        // 更新现有课程
        await updateSubject(editingCourse.id as unknown as number, {
          title: data.title,
          description: data.description,
          tags: data.tags,
          categoryId: data.categoryId,
        })
        messageApi.success('课程更新成功!')
      } else {
        // 创建新课程
        await createSubject({
          title: data.title,
          description: data.description,
          tags: data.tags,
          categoryId: data.categoryId,
        })
        messageApi.success('课程添加成功!')
      }
      setModalVisible(false)
      setIsEditing(false)
      setEditingCourse(null)
      fetchCourses() // 重新获取课程列表
    } catch (error) {
      console.error(`${isEditing ? '更新' : '添加'}课程失败:`, error)
      messageApi.error(`${isEditing ? '更新' : '添加'}课程失败，请稍后再试!`)
    } finally {
      setLoading(false)
    }
  }

  // 打开模态框
  const handleOpenModal = () => {
    setModalVisible(true)
  }

  // 关闭模态框
  const handleCloseModal = () => {
    setModalVisible(false)
  }

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
    <>
      {contextHolder}
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
            onClick={handleOpenModal}
          >
            添加课程/科目
          </Button>
        </div>
        <Table
          columns={createCourseColumns(
            (record) => {
              setEditingCourse(record)
              setIsEditing(true)
              setModalVisible(true)
            },
            (record) => {
              // 这里可以添加删除课程的逻辑
              // 例如显示确认对话框
              Modal.confirm({
                title: '确认删除',
                content: `确定要删除课程"${record.name}"吗？`,
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                  // TODO: 实现删除课程的API调用
                  try {
                    // 假设这里有一个删除API
                    // await deleteSubject(record.id);
                    messageApi.success('课程删除成功!')
                    fetchCourses() // 刷新列表
                  } catch (error) {
                    console.error('删除课程失败:', error)
                    messageApi.error('删除课程失败，请稍后再试!')
                  }
                },
              })
            },
          )}
          dataSource={courses}
          loading={loading}
        />

        <Modal
          title={isEditing ? '编辑课程/科目' : '添加课程/科目'}
          open={modalVisible}
          onCancel={handleCloseModal}
          footer={null}
          destroyOnClose
        >
          <SubjectForm
            initialData={
              editingCourse
                ? {
                    id: Number(editingCourse.id),
                    title: editingCourse.name,
                    description: editingCourse.description,
                    categoryId: editingCourse.categoryId
                      ? Number(editingCourse.categoryId)
                      : undefined,
                    // Subject 接口需要这些字段
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            isEditing={isEditing}
          />
        </Modal>
      </div>
    </>
  )
}

export default Courses
