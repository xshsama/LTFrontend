import { LoginOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Modal, Result, Space, Tabs, Typography, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GoalForm from '../components/forms/GoalForm'
import TaskForm from '../components/forms/TaskForm'
import AchievementsTable from '../components/tables/AchievementsTable'
import GoalsTable from '../components/tables/GoalsTable'
import TasksTable from '../components/tables/TasksTable'
import { useAuth } from '../contexts/AuthContext'
import { mockAchievementData, mockGoalData, mockTaskData } from '../mock/data'
import { createGoal, getGoals } from '../services/goalService'
import {
  getCategories,
  getSubjects,
  getTags,
} from '../services/objectiveService'
import { createTask, getTasksByGoal } from '../services/taskService'
import {
  Achievement,
  Category,
  Goal,
  Subject,
  Tag as TagType,
  Task,
} from '../types/goals'

const { Title } = Typography

const ObjectivesPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState<Goal[]>(mockGoalData)
  const [tasks, setTasks] = useState<Task[]>(mockTaskData)
  const [achievements, setAchievements] =
    useState<Achievement[]>(mockAchievementData)

  // 添加学科和分类的状态管理
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [availableTags, setAvailableTags] = useState<TagType[]>([])

  // 模态框状态
  const [goalModalVisible, setGoalModalVisible] = useState(false)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // 在组件挂载时获取学科、分类和标签数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [subjectsData, categoriesData, tagsData] = await Promise.all([
          getSubjects(),
          getCategories(),
          getTags(),
        ])

        setSubjects(subjectsData)
        setCategories(categoriesData)
        setAvailableTags(tagsData)
      } catch (error) {
        console.error('获取基础数据失败:', error)
        message.error('获取基础数据失败，请重试！')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  // 获取所有目标
  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true)
      try {
        const goalsData = await getGoals()
        setGoals(goalsData)
      } catch (error) {
        console.error('获取目标数据失败:', error)
        message.error('获取目标数据失败，请重试！')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchGoals()
    }
  }, [isAuthenticated])

  // 获取选定目标的任务列表
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedGoalId) return

      setLoading(true)
      try {
        const tasksData = await getTasksByGoal(selectedGoalId)
        setTasks(tasksData)
      } catch (error) {
        console.error(`获取目标(ID:${selectedGoalId})的任务列表失败:`, error)
        message.error('获取任务数据失败，请重试！')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && selectedGoalId) {
      fetchTasks()
    }
  }, [isAuthenticated, selectedGoalId])

  // 处理选择目标的回调
  const handleGoalSelect = (goalId: number) => {
    setSelectedGoalId(goalId)
  }

  // 处理登录按钮点击
  const handleLogin = () => {
    navigate('/login')
  }

  // 处理添加目标的逻辑
  const handleAddGoal = () => {
    setGoalModalVisible(true)
  }

  // 处理添加任务的逻辑
  const handleAddTask = () => {
    setTaskModalVisible(true)
  }

  // 处理目标表单提交
  const handleGoalFormSubmit = async (
    values: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    setFormSubmitting(true)
    try {
      // 调用API创建新目标
      const newGoal = await createGoal(values)

      // 更新状态
      setGoals([newGoal, ...goals])

      // 关闭模态框
      setGoalModalVisible(false)
      message.success('学习目标添加成功！')
    } catch (error: any) {
      console.error('添加目标失败:', error)
      message.error(error.message || '添加目标失败，请重试！')
    } finally {
      setFormSubmitting(false)
    }
  }

  // 处理任务表单提交
  const handleTaskFormSubmit = async (
    values: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    setFormSubmitting(true)
    try {
      // 调用API创建新任务
      const newTask = await createTask(values)

      // 更新状态
      setTasks([newTask, ...tasks])

      // 关闭模态框
      setTaskModalVisible(false)
      message.success('任务添加成功！')
    } catch (error: any) {
      console.error('添加任务失败:', error)
      message.error(error.message || '添加任务失败，请重试！')
    } finally {
      setFormSubmitting(false)
    }
  }

  // 如果未登录，显示提示信息
  if (!isAuthenticated) {
    return (
      <div className="objectives-container">
        <Result
          status="info"
          title="请先登录"
          subTitle="登录后即可查看和管理您的学习目标、任务和成就"
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

  // 模拟每个目标关联的任务标签
  const taskTagsByGoal: Record<number, TagType[]> = {}
  tasks.forEach((task) => {
    if (!taskTagsByGoal[task.goalId]) {
      taskTagsByGoal[task.goalId] = []
    }
    taskTagsByGoal[task.goalId] = [...taskTagsByGoal[task.goalId], ...task.tags]
  })

  const tabItems = [
    {
      key: 'goals',
      label: '学习目标',
      children: (
        <GoalsTable
          data={goals}
          loading={loading}
          taskTags={taskTagsByGoal}
          onRowClick={(goal) => {
            setSelectedGoalId(goal.id)
          }}
        />
      ),
    },
    {
      key: 'tasks',
      label: '任务清单',
      children: (
        <TasksTable
          data={tasks}
          loading={loading}
          onRowClick={(task) => {
            console.log('Clicked task:', task)
            // 这里可以添加点击任务时的处理逻辑
          }}
        />
      ),
    },
    {
      key: 'achievements',
      label: '完成情况',
      children: (
        <AchievementsTable
          data={achievements}
          loading={loading}
        />
      ),
    },
  ]

  return (
    <div className="objectives-container">
      <div className="objectives-header">
        <Title
          level={2}
          style={{ marginBottom: 0 }}
        >
          目标与任务
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddGoal}
          >
            添加目标
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={handleAddTask}
          >
            添加任务
          </Button>
        </Space>
      </div>
      <Tabs
        defaultActiveKey="goals"
        items={tabItems}
        style={{ marginTop: '24px' }}
      ></Tabs>

      {/* 添加目标的模态框 */}
      <Modal
        title="添加学习目标"
        open={goalModalVisible}
        onCancel={() => setGoalModalVisible(false)}
        footer={null}
        destroyOnClose={true}
        maskClosable={false}
      >
        <GoalForm
          subjects={subjects}
          categories={categories}
          onFinish={handleGoalFormSubmit}
          onCancel={() => setGoalModalVisible(false)}
          loading={formSubmitting}
        />
      </Modal>

      {/* 添加任务的模态框 */}
      <Modal
        title="添加任务"
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
        destroyOnClose={true}
        maskClosable={false}
      >
        <TaskForm
          goals={goals}
          availableTags={availableTags}
          onFinish={handleTaskFormSubmit}
          onCancel={() => setTaskModalVisible(false)}
          loading={formSubmitting}
        />
      </Modal>
    </div>
  )
}

export default ObjectivesPage
