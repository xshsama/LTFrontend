import { PlusOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, message, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { default as apiClient } from '../../services/apiService'
import {
  getCategories,
  getCategoriesBySubject, // Import the renamed function
} from '../../services/subjectService'
import { Subject as BaseSubject } from '../../types/goals'

// 移除冗余导出声明，文件末尾已有默认导出

interface Category {
  id: number
  name: string
}

// 扩展的学科接口，添加表单中需要的字段
interface Subject extends BaseSubject {
  categoryId?: number
}

// 定义表单属性接口
interface SubjectFormProps {
  initialData?: Subject
  onSubmit: (data: Subject) => Promise<void>
  onCancel?: () => void
  isEditing?: boolean
}

const SubjectForm: React.FC<SubjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [fetching, setFetching] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true)
        const categoriesRes = await getCategories()
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error('获取数据失败:', error)
        message.error('获取分类数据失败')
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        title: initialData.title,
      })

      // 如果是编辑模式且有学科ID，则通过API获取该学科的分类信息
      if (isEditing && initialData.id) {
        const fetchCategoryForSubject = async () => {
          try {
            setFetching(true)
            // Call the renamed function which returns an array wrapped in ApiResponse
            const response = await getCategoriesBySubject(initialData.id)
            // Assuming the response structure is { code, message, data: CategoryDTO[] }
            const categoriesData = response.data?.data
            if (
              categoriesData &&
              Array.isArray(categoriesData) &&
              categoriesData.length > 0
            ) {
              // Take the ID of the first category in the list
              const categoryId = categoriesData[0].id
              form.setFieldsValue({ categoryId })
            } else {
              // Handle case where no categories are returned or response format is unexpected
              console.log(
                `No categories found for subject ${initialData.id} or unexpected response format.`,
              )
              // Optionally set categoryId to null or undefined if needed
              // form.setFieldsValue({ categoryId: null });
            }
          } catch (error) {
            console.error('获取学科分类信息失败:', error)
            message.error('获取学科分类信息失败')
          } finally {
            setFetching(false)
          }
        }

        fetchCategoryForSubject()
      } else if (initialData.categoryId) {
        // 如果直接提供了categoryId，则直接使用
        form.setFieldsValue({ categoryId: initialData.categoryId })
      }
    }
  }, [initialData, form, isEditing])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      message.warning('请输入分类名称')
      return
    }

    try {
      setCreatingCategory(true)

      // 如果categories数组不为空，说明已有学科，使用第一个学科的ID
      // 如果没有学科，则使用ID为1的默认学科
      let subjectId = 1

      // 查询是否有可用的学科
      try {
        const subjectsRes = await apiClient.get('/api/subjects')
        if (subjectsRes.data && subjectsRes.data.length > 0) {
          subjectId = subjectsRes.data[0].id
        }
      } catch (error) {
        console.error('获取学科列表失败:', error)
      }

      // Send only the fields expected by the backend Category entity
      const res = await apiClient.post('/api/categories', {
        name: newCategoryName,
        description: `分类: ${newCategoryName}`,
        // Removed the 'subject' field as it's not part of the Category entity anymore
        // and the relationship is managed via an intermediate table.
        // Associating the category with a subject needs a separate mechanism/API call if required immediately.
      })

      // 正确处理响应数据
      if (res.data && res.data.data) {
        // 假设返回的数据是一个Category对象
        const newCategory: Category = res.data.data
        setCategories([...categories, newCategory])
      } else if (res.data) {
        // 直接使用响应数据作为Category
        const newCategory: Category = {
          id: res.data.id || Date.now(), // 如果没有id，使用时间戳
          name: res.data.name || newCategoryName,
        }
        setCategories([...categories, newCategory])
      }

      setNewCategoryName('')
      message.success('分类创建成功')
    } catch (error) {
      console.error('创建分类失败:', error)
      message.error('创建分类失败')
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleSubmit = async (values: any) => {
    console.log('表单提交数据:', values) // 添加调试日志
    console.log('表单分类ID:', values.categoryId) // 特别记录分类ID
    try {
      setLoading(true)
      console.log('准备调用onSubmit回调') // 添加调试日志

      // 确保categoryId是数字类型
      const categoryId = values.categoryId
        ? Number(values.categoryId)
        : undefined
      console.log('处理后的分类ID:', categoryId)

      // 构建提交数据
      const submissionData: Subject = {
        ...(initialData || { id: Date.now() }), // 为新学科生成临时ID
        title: values.title,
        categoryId: categoryId,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      // 记录最终提交的数据
      console.log('最终提交数据:', submissionData)

      await onSubmit(submissionData as Subject)
      message.success(`${isEditing ? '更新' : '创建'}学科成功!`)

      if (!isEditing) {
        form.resetFields()
      } else {
        navigate('/subjects')
      }
    } catch (error) {
      console.error('提交学科时出错:', error)
      message.error(`${isEditing ? '更新' : '创建'}学科失败，请稍后再试!`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => {
        console.log('表单onFinish触发，值:', values)
        handleSubmit(values)
      }}
      initialValues={{ title: '' }}
    >
      <Form.Item
        name="title"
        label="学科名称"
        rules={[{ required: true, message: '请输入学科名称!' }]}
      >
        <Input placeholder="请输入学科名称" />
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="分类"
      >
        <Select
          placeholder="请选择分类"
          options={categories.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
          loading={fetching}
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', padding: '0 8px 4px' }}>
                <Input
                  placeholder="新分类名称"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  style={{ flex: 'auto' }}
                />
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={handleCreateCategory}
                  loading={creatingCategory}
                >
                  创建
                </Button>
              </div>
            </>
          )}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
        >
          {isEditing ? '更新' : '创建'}学科
        </Button>
        <Button
          style={{ marginLeft: 8 }}
          onClick={() => (onCancel ? onCancel() : navigate('/subjects'))}
        >
          取消
        </Button>
      </Form.Item>
    </Form>
  )
}

export default SubjectForm
