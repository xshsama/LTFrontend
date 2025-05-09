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
import apiClient from '../services/apiService'
import {
  createSubject,
  // getCategoriesBySubject, // Removed as data is now included in subject DTO
  updateSubject,
} from '../services/subjectService'

const { Title } = Typography

// Define CategoryDTO type based on backend DTO
interface CategoryDTO {
  id: number
  name: string
  subjectId: number | null // subjectId might be null based on CategoryServiceImpl
}

// Define Course interface - updated category field
export interface Course {
  id: string | number
  key: string
  name: string // Keep for compatibility if needed elsewhere, but prefer title
  title?: string // Primary display name from backend
  categories: CategoryDTO[] // Changed from category: string and categoryId
  description?: string
  relatedGoalsCount: number
  relatedTasksCount: number
  tags?: string[] // This is List<String> from backend
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
    dataIndex: 'categories', // Use the new categories field
    key: 'categories',
    render: (categories: CategoryDTO[]) => {
      // Display the name of the first category, or '未分类'
      const categoryName =
        categories && categories.length > 0 ? categories[0].name : '未分类'
      // Optionally wrap in a Tag or Tooltip if multiple categories need indication
      return categoryName
    },
    // TODO: Update filters and onFilter logic if filtering by category is still needed
    // filters: ...
    // onFilter: ...
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
    render: (tags?: string[]) => {
      // Changed type from any to string[] | undefined
      // console.log('渲染标签数据:', tags) // Optional: keep for debugging
      // 检查标签数据的类型和结构
      if (!tags || (Array.isArray(tags) && tags.length === 0)) {
        return <Tag color="default">无标签</Tag> // 当没有标签时显示"无标签"
      }

      // If tags is a non-empty array (guaranteed to be string[] here)
      if (Array.isArray(tags)) {
        return (
          <>
            {tags.map(
              (
                tag: string,
                index: number, // Explicitly type tag as string
              ) => (
                // Directly render the tag string
                <Tag
                  key={index}
                  color="blue"
                >
                  {' '}
                  {/* Assign a default color or use logic if needed */}
                  {tag}
                </Tag>
              ),
            )}
          </>
        )
      }

      // 如果tags是对象，可能需要特殊处理
      return <Tag color="default">不支持的标签格式</Tag>
    },
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

      // 添加更详细的调试日志
      console.log('开始获取课程数据...')
      console.log('当前认证状态:', isAuthenticated)
      console.log(
        '本地存储中的令牌是否存在:',
        !!localStorage.getItem('authToken'),
      )

      // 修复: 使用apiClient实例而不是直接调用URL
      // 让请求拦截器能自动添加Authorization头
      const response = await apiClient.get('/api/subjects')

      console.log('API请求成功，状态码:', response.status)
      console.log('后端返回的科目数据:', response.data) // 添加调试日志
      console.log('后端返回数据类型:', typeof response.data) // 记录数据类型

      // 更详细地检查响应格式
      let subjectsArray = []
      if (response.data && typeof response.data === 'object') {
        if (response.data.data && Array.isArray(response.data.data)) {
          // ApiResponse格式: {code, message, data: [...]}
          subjectsArray = response.data.data
          console.log('从ApiResponse中提取数组')
        } else if (Array.isArray(response.data)) {
          // 直接是数组
          subjectsArray = response.data
          console.log('响应直接是数组')
        } else {
          // 其他情况，尝试将对象转为数组
          console.log('响应既不是包含data数组的对象，也不是数组，尝试其他方法')
          if (response.data.code === 200 && response.data.data === null) {
            // 处理成功但数据为空的情况
            console.log('成功响应但数据为空')
            subjectsArray = []
          } else {
            // 尝试转换对象为数组
            console.log('尝试从对象中提取可用数据')
            // 如果是单个对象，放入数组中
            subjectsArray = [response.data]
          }
        }
      }

      console.log('处理后的学科数组:', subjectsArray)
      console.log(
        '学科数组类型:',
        typeof subjectsArray,
        '是否为数组:',
        Array.isArray(subjectsArray),
      )
      // 安全检查，确保是数组
      if (!Array.isArray(subjectsArray)) {
        console.error('无法获取有效的学科数组，使用空数组代替')
        subjectsArray = []
      }

      // 直接映射后端返回的 SubjectDTO 数据到前端 Course 类型
      const subjectsWithCategories = subjectsArray.map((subject: any) => {
        // 从 subject.category (CategoryDTO) 获取分类信息
        const categoryName = subject.category?.name || '未分类'
        const categoryId = subject.category?.id || null

        // 直接使用后端计算的统计数据，处理 null 情况
        const goalsCount = Number(subject.totalGoals) || 0
        const tasksCount = Number(subject.totalTasks) || 0

        // 直接使用后端返回的标签名称列表 (List<String>)
        const tags = Array.isArray(subject.tags) ? subject.tags : []

        // 调试输出原始数据
        // console.log('原始科目数据:', JSON.stringify(subject, null, 2));

        const courseData: Course = {
          id: subject.id || Date.now(),
          key: subject.id ? subject.id.toString() : Date.now().toString(),
          title: subject.title || '未命名学科',
          name: subject.title || '未命名学科', // Keep name for table dataIndex compatibility for now
          categories: Array.isArray(subject.categories)
            ? subject.categories
            : [], // Use subject.categories directly
          relatedGoalsCount: goalsCount,
          relatedTasksCount: tasksCount,
          tags: tags, // string[] from backend
          description: subject.description || '',
        }

        // console.log('转换后的课程数据:', courseData);
        return courseData
      }) // End of map function body

      // 在接收到结果后，检查数据是否有效
      console.log('处理后的所有课程数据:', subjectsWithCategories)

      // 确保数据有效并且每个字段都正确初始化
      const validCourses = subjectsWithCategories.map((course) => ({
        ...course,
        // 确保关联计数为数字，避免undefined或null
        relatedGoalsCount: Number(course.relatedGoalsCount) || 0,
        relatedTasksCount: Number(course.relatedTasksCount) || 0,
        // 确保标签是数组
        tags: Array.isArray(course.tags) ? course.tags : [],
        // 确保同时存在name和title属性
        name: course.name || course.title || '未命名学科',
      }))

      setCourses(validCourses)
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
          tags: data.tags,
          categoryId: data.categoryId,
        })
        messageApi.success('课程更新成功!')
      } else {
        // 创建新课程
        await createSubject({
          title: data.title,
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
                    await apiClient.delete(`/api/subjects/${record.id}`)
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
                    title: editingCourse.name, // Use name for form title consistency? Or editingCourse.title?
                    // Get categoryId from the first category in the list, if available
                    categoryId:
                      editingCourse.categories &&
                      editingCourse.categories.length > 0
                        ? editingCourse.categories[0].id
                        : undefined,
                    // Subject interface might need these, provide defaults
                    createdAt: new Date(),
                    updatedAt: new Date(),
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
