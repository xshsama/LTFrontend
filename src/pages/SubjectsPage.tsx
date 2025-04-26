import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  List,
  message,
  Modal,
  Popconfirm,
  Typography,
} from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SubjectForm from '../components/forms/SubjectForm'
import SubjectTable from '../components/tables/SubjectTable'
import {
  createSubject,
  deleteSubject,
  getUserSubjects,
} from '../services/subjectService'
import { Subject as BaseSubject } from '../types/goals'

const { Title } = Typography

// 本地扩展的 Subject 接口
interface Subject extends BaseSubject {
  categoriesCount?: number
  goalsCount?: number
}

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [refreshKey, setRefreshKey] = useState<number>(0) // 用于强制刷新
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list') // 添加视图模式状态
  const navigate = useNavigate()

  useEffect(() => {
    fetchSubjects()
  }, [refreshKey])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const response = await getUserSubjects()
      setSubjects(response.data)
    } catch (error) {
      console.error('获取学科列表失败:', error)
      message.error('获取学科列表失败，请稍后再试!')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
  }

  const handleCreateSubject = async (data: Subject) => {
    try {
      await createSubject(data)
      message.success('创建学科成功!')
      setModalVisible(false)
      // 刷新学科列表
      setRefreshKey((prevKey) => prevKey + 1)
    } catch (error) {
      console.error('创建学科失败:', error)
      throw error // 将错误抛出，让SubjectForm组件处理
    }
  }

  const handleEditSubject = (subject: Subject) => {
    navigate(`/subjects/edit/${subject.id}`)
  }

  const handleDeleteSubject = async (id: number) => {
    try {
      await deleteSubject(id)
      message.success('删除学科成功!')
      // 刷新学科列表
      setRefreshKey((prevKey) => prevKey + 1)
    } catch (error) {
      console.error('删除学科失败:', error)
      message.error('删除学科失败，请稍后再试!')
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Title level={2}>我的学科</Title>
        <div>
          <Button
            style={{ marginRight: 8 }}
            type={viewMode === 'list' ? 'primary' : 'default'}
            onClick={() => setViewMode('list')}
          >
            列表视图
          </Button>
          <Button
            style={{ marginRight: 16 }}
            type={viewMode === 'table' ? 'primary' : 'default'}
            onClick={() => setViewMode('table')}
          >
            表格视图
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
          >
            添加学科
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 6 }}
          dataSource={subjects}
          loading={loading}
          renderItem={(subject) => (
            <List.Item>
              <Card
                title={subject.title}
                hoverable
                actions={[
                  <EditOutlined
                    key="edit"
                    onClick={() => handleEditSubject(subject)}
                  />,
                  <Popconfirm
                    title="确定要删除这个学科吗?"
                    description="删除此学科将会删除其下所有的分类和目标。"
                    onConfirm={() => handleDeleteSubject(subject.id!)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <DeleteOutlined key="delete" />
                  </Popconfirm>,
                ]}
                onClick={() => navigate(`/subjects/${subject.id}`)}
              >
                <Card.Meta
                  description={`包含 ${subject.categoriesCount || 0} 个分类，${
                    subject.goalsCount || 0
                  } 个目标`}
                />
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <SubjectTable
          data={subjects}
          loading={loading}
          onEdit={handleEditSubject}
          onDelete={handleDeleteSubject}
          onRowClick={(subject) => navigate(`/subjects/${subject.id}`)}
          addButton={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenModal}
            >
              添加学科
            </Button>
          }
        />
      )}

      <Modal
        title="添加新学科"
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose={true}
      >
        <SubjectForm
          onSubmit={handleCreateSubject}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  )
}

export default SubjectsPage
