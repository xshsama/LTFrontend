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
import apiService from '../services/apiService'
import {
  createSubject,
  getCategoryBySubject,
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
    render: (tags?: any) => {
      console.log('渲染标签数据:', tags) // 输出标签数据以便调试
      // 检查标签数据的类型和结构
      if (!tags || (Array.isArray(tags) && tags.length === 0)) {
        return <Tag color="default">无标签</Tag> // 当没有标签时显示"无标签"
      }

      // 如果tags是数组，直接渲染
      if (Array.isArray(tags)) {
        return (
          <>
            {tags.map((tag, index) => {
              // 如果tag是对象（例如 {id: 1, name: 'tag1'}），使用name属性
              if (typeof tag === 'object' && tag !== null) {
                return (
                  <Tag
                    key={tag.id || index}
                    color={tag.color || 'blue'}
                  >
                    {tag.name}
                  </Tag>
                )
              }
              // 如果tag是字符串，直接使用
              return (
                <Tag
                  key={index}
                  color="blue"
                >
                  {tag}
                </Tag>
              )
            })}
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

      // 修复: 使用apiService实例而不是直接调用URL
      // 让请求拦截器能自动添加Authorization头
      const response = await apiService.get('/api/subjects')

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

      // 创建一个暂存对象，通过Promise.all处理所有异步请求
      const subjectsWithCategories = await Promise.all(
        subjectsArray.map(async (subject: any) => {
          let categoryName = '未分类'
          let categoryId = null

          // 如果有科目ID，则通过API获取对应的分类信息
          if (subject.id) {
            try {
              // 通过getCategoryBySubject API获取分类信息
              const categoryResponse = await getCategoryBySubject(subject.id)
              console.log('科目分类响应:', categoryResponse.data)
              if (categoryResponse.data && categoryResponse.data.name) {
                categoryName = categoryResponse.data.name
                categoryId = categoryResponse.data.id
              }
            } catch (error) {
              console.error(`获取科目${subject.id}的分类信息失败:`, error)
            }
          }

          // 使用debug方式查看subject的结构
          console.log('科目详细数据:', JSON.stringify(subject, null, 2))

          // 获取关联目标和任务的数量 - 优先使用后端提供的统计字段
          let goalsCount = 0
          if (subject.totalGoals !== undefined) {
            goalsCount = subject.totalGoals
          } else if (subject.goalsCount !== undefined) {
            goalsCount = subject.goalsCount
          } else if (subject.goals) {
            goalsCount = Array.isArray(subject.goals) ? subject.goals.length : 0
          }

          let tasksCount = 0
          if (subject.totalTasks !== undefined) {
            tasksCount = subject.totalTasks
          } else if (subject.tasksCount !== undefined) {
            tasksCount = subject.tasksCount
          } else if (subject.tasks) {
            tasksCount = Array.isArray(subject.tasks) ? subject.tasks.length : 0
          }

          // 调试输出关联数量
          console.log(
            `科目 ${
              subject.name || subject.title
            } 的关联目标数: ${goalsCount}, 关联任务数: ${tasksCount}`,
          )

          // 处理标签 - 可能是数组或其他格式
          let tags = []
          if (subject.tags) {
            // 确保tags总是一个数组
            tags = Array.isArray(subject.tags)
              ? subject.tags
              : typeof subject.tags === 'string'
              ? [subject.tags]
              : []

            // 如果是空数组，添加一个默认标签以便于测试
            if (tags.length === 0) {
              tags = ['学习中']
            }
          }

          // 返回包含分类名称和ID的科目信息
          const courseData = {
            id: subject.id || Date.now(), // 如果id为undefined，使用时间戳作为临时id
            key: subject.id ? subject.id.toString() : Date.now().toString(), // 安全地调用toString
            name: subject.name || subject.title || '未命名学科', // 兼容新旧数据格式
            categoryId: categoryId, // 保存分类ID用于编辑
            category: categoryName, // 显示实际的分类名称
            relatedGoalsCount: goalsCount,
            relatedTasksCount: tasksCount,
            tags: tags,
            description: subject.description || '', // 添加描述字段
          }

          console.log('转换后的课程数据:', courseData)
          return courseData
        }),
      )

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
          name: data.name,
          tags: data.tags,
          categoryId: data.categoryId,
        })
        messageApi.success('课程更新成功!')
      } else {
        // 创建新课程
        await createSubject({
          name: data.name,
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
                    name: editingCourse.name,
                    categoryId: editingCourse.categoryId
                      ? Number(editingCourse.categoryId)
                      : undefined,
                    // Subject 接口需要这些字段
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
