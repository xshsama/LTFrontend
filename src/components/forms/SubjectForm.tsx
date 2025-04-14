import { PlusOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, message, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../../services/apiService'
import { getCategories, getTags } from '../../services/subjectService'

interface Category {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
}

// 定义学科接口
interface Subject {
  id?: number
  title: string
  description?: string
  tags?: string[]
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
  const [tags, setTags] = useState<Tag[]>([])
  const [fetching, setFetching] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true)
        const [categoriesRes, tagsRes] = await Promise.all([
          getCategories(),
          getTags(),
        ])
        setCategories(categoriesRes.data)
        setTags(tagsRes.data)
      } catch (error) {
        console.error('获取数据失败:', error)
        message.error('获取分类和标签数据失败')
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
    }
  }, [initialData, form])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      message.warning('请输入分类名称')
      return
    }

    try {
      setCreatingCategory(true)
      const res = await apiService.post('/api/categories', {
        name: newCategoryName,
      })
      setCategories([...categories, res.data])
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
    try {
      setLoading(true)
      const data: Subject = {
        id: initialData?.id,
        title: values.title,
        description: values.description,
        tags: values.tags,
        categoryId: values.categoryId,
      }

      await onSubmit(data)
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
      onFinish={handleSubmit}
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
        name="description"
        label="描述"
      >
        <Input.TextArea
          placeholder="请输入学科描述"
          rows={4}
        />
      </Form.Item>

      <Form.Item
        name="tags"
        label="标签"
      >
        <Select
          mode="tags"
          placeholder="请选择或输入标签"
          tokenSeparators={[',']}
        />
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
