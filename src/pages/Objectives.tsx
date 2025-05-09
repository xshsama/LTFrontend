import { LoginOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  message,
  Modal,
  Result,
  Space,
  Tabs,
  // TagType, // Removed incorrect import from antd
  Typography,
} from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GoalForm from '../components/forms/GoalForm'
// Import UpdateGoalRequest type if needed, or rely on type inference from service
// import { UpdateGoalRequest } from '../services/goalService'; // Assuming type is defined/exported there
import TaskForm from '../components/forms/TaskForm'
import AchievementsTable from '../components/tables/AchievementsTable'
import GoalsTable from '../components/tables/GoalsTable'
import TasksTable from '../components/tables/TasksTable'
import { useAuth } from '../contexts/AuthContext'
import {
  createGoal,
  deleteGoal,
  getGoals,
  updateGoal,
} from '../services/goalService' // Import updateGoal and deleteGoal
import {
  getCategories,
  getSubjects,
  getTags,
} from '../services/objectiveService'
import {
  createTask,
  getAllTasks,
  getTasksByGoal,
  getTaskTags, // Import getTaskTags
} from '../services/taskService'
import {
  Achievement,
  Category,
  Goal,
  Tag as GoalTagType,
  Subject,
} from '../types/goals' // Aliased Tag from goals.ts
import { Tag as TaskTagType } from '../types/tag' // Imported Tag from tag.ts
import { CreateTaskRequest, Task } from '../types/task'

const { Title } = Typography

const ObjectivesPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth() // Assuming 'user' object with 'id' is available from useAuth
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])

  // 添加学科和分类的状态管理
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [availableTags, setAvailableTags] = useState<GoalTagType[]>([]) // Use GoalTagType

  // 模态框状态
  const [goalModalVisible, setGoalModalVisible] = useState(false)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [isEditGoalModalVisible, setIsEditGoalModalVisible] = useState(false) // State for edit modal
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null) // State for goal being edited

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
      // 检查是否已登录
      if (!isAuthenticated) {
        console.log('用户未登录，跳过获取目标数据')
        return
      }

      setLoading(true)
      try {
        // 检查Token是否存在
        const token = localStorage.getItem('authToken')
        if (!token) {
          console.warn('未找到认证令牌，无法获取目标数据')
          // 设置一个默认的测试目标
          const testData = [
            {
              id: 999999,
              title: '测试目标 (请登录获取真实数据)',
              status: 'NOT_STARTED',
              priority: 'MEDIUM',
              progress: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Goal,
          ]
          setGoals(testData)
          return
        }

        // 从API获取目标数据
        const goalsData = await getGoals()

        // 打印API返回的原始数据
        console.log('从API获取的原始目标数据:', goalsData)

        // 检查数据是否有效且是数组
        if (!goalsData || !Array.isArray(goalsData)) {
          console.warn('API返回的目标数据不是数组格式!', goalsData)
          // 设置一个测试目标
          const testData = [
            {
              id: 999999,
              title: '测试目标 (API返回格式错误)',
              status: 'NOT_STARTED',
              priority: 'MEDIUM',
              progress: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Goal,
          ]
          setGoals(testData)
        } else {
          // 判断数据是否为空
          if (goalsData.length === 0) {
            // 如果没有数据，添加一个测试目标，确保选择框有内容显示
            const testData = [
              {
                id: 999999,
                title: '测试目标 - 请先创建学习目标',
                status: 'NOT_STARTED',
                priority: 'MEDIUM',
                progress: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              } as Goal,
            ]
            console.log('未获取到目标数据，使用测试数据:', testData)
            setGoals(testData)
          } else {
            // 有数据，直接使用
            console.log('更新目标数据:', goalsData)
            setGoals(goalsData)
          }
        }
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

  // 获取所有任务
  useEffect(() => {
    const fetchAllTasks = async () => {
      setLoading(true)
      try {
        const rawTasksData = await getAllTasks()
        // 为每个任务获取其标签
        const tasksWithTagsPromises = rawTasksData.map(async (task) => {
          try {
            const tags = await getTaskTags(task.id)
            return { ...task, tags: tags || [] } // 如果tags为null/undefined，则设为空数组
          } catch (tagError) {
            console.error(`获取任务 ${task.id} 的标签失败:`, tagError)
            return { ...task, tags: [] } // 获取标签失败也设置为空数组
          }
        })
        const populatedTasks = await Promise.all(tasksWithTagsPromises)
        setTasks(populatedTasks as unknown as Task[])
      } catch (error) {
        console.error('获取所有任务失败:', error)
        message.error('获取任务数据失败，请重试！')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchAllTasks()
    }
  }, [isAuthenticated])

  // 获取选定目标的任务列表
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)

  useEffect(() => {
    const fetchTasksByGoal = async () => {
      if (!selectedGoalId) return

      setLoading(true)
      try {
        const rawTasksData = await getTasksByGoal(selectedGoalId)
        // 为每个任务获取其标签
        const tasksWithTagsPromises = rawTasksData.map(async (task) => {
          try {
            const tags = await getTaskTags(task.id)
            return { ...task, tags: tags || [] } // 如果tags为null/undefined，则设为空数组
          } catch (tagError) {
            console.error(
              `获取任务 ${task.id} (目标 ${selectedGoalId}) 的标签失败:`,
              tagError,
            )
            return { ...task, tags: [] } // 获取标签失败也设置为空数组
          }
        })
        const populatedTasks = await Promise.all(tasksWithTagsPromises)
        setTasks(populatedTasks as unknown as Task[])
      } catch (error) {
        console.error(`获取目标(ID:${selectedGoalId})的任务列表失败:`, error)
        message.error('获取任务数据失败，请重试！')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && selectedGoalId) {
      fetchTasksByGoal()
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
  const handleGoalFormSubmit = async (values: {
    subjectId?: number
    title: string
    priority?: string
    categoryId?: number
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
    description?: string
    targetDate?: Date
    progress?: number
    tags?: string[] // 修改为string[]类型，与表单提交的格式匹配
  }) => {
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
    values: CreateTaskRequest,
  ): Promise<Task> => {
    setFormSubmitting(true)
    try {
      // 调用API创建新任务
      const newTask = await createTask(values)

      // 更新状态
      setTasks([newTask, ...tasks])

      // 关闭模态框
      setTaskModalVisible(false)
      message.success('任务添加成功！')

      // 返回创建的任务，以便在TaskForm中使用
      return newTask
    } catch (error: any) {
      console.error('添加任务失败:', error)
      message.error(error.message || '添加任务失败，请重试！')
      throw error // 抛出错误，让调用方知道操作失败
    } finally {
      setFormSubmitting(false)
    }
  }

  // --- Edit and Delete Handlers ---

  const handleDeleteGoal = async (goalId: number) => {
    // Simple confirmation dialog
    if (window.confirm(`确定要删除目标 #${goalId} 吗？此操作不可撤销。`)) {
      try {
        setLoading(true) // Indicate loading state
        await deleteGoal(goalId) // Call the service function
        message.success(`目标 #${goalId} 已成功删除`)
        // Update the goals list in the state by filtering out the deleted goal
        setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId))
        // If the deleted goal was the selected one, clear the selection and tasks
        if (selectedGoalId === goalId) {
          setSelectedGoalId(null)
          setTasks([]) // Clear tasks as the parent goal is gone
        }
      } catch (error: any) {
        console.error(`删除目标 #${goalId} 失败:`, error)
        message.error(error.message || '删除目标失败，请重试')
      } finally {
        setLoading(false) // Reset loading state
      }
    }
  }

  const handleEditGoalClick = (goal: Goal) => {
    console.log('Editing goal:', goal) // Log the goal being edited
    // Ensure dates are handled correctly if GoalForm expects Date objects
    // The Goal type might have Date objects, but initialValues might need conversion if form expects specific format
    setEditingGoal({
      ...goal,
      // Example: If form needs Date objects for date inputs
      // targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
    })
    setIsEditGoalModalVisible(true)
  }

  const handleEditGoalModalCancel = () => {
    setIsEditGoalModalVisible(false)
    setEditingGoal(null) // Clear the editing state
  }

  // Type for values should match UpdateGoalRequest from goalService
  // We might need to define/import it properly if not inferred
  const handleEditGoalFormSubmit = async (values: any) => {
    if (!editingGoal) {
      console.error('Cannot submit edit form, editingGoal is null')
      return
    }
    console.log(
      'Submitting update for goal:',
      editingGoal.id,
      'with values:',
      values,
    )
    setFormSubmitting(true)
    try {
      // Prepare data matching UpdateGoalRequest structure
      // The GoalForm's onFinish provides values based on form fields
      // We need to ensure it aligns with what updateGoal service expects
      const updatePayload = {
        title: values.title,
        status: values.status,
        priority: values.priority,
        // Add other fields from 'values' that match UpdateGoalRequest
        // completionDate: values.completionDate ? values.completionDate.format('YYYY-MM-DD') : null, // Example formatting
        // progress: values.progress,
        // categoryId: values.categoryId,
        // subjectId is usually not updatable via goal update, handle if needed
      }

      const updatedGoalData = await updateGoal(editingGoal.id, updatePayload)
      message.success(`目标 #${editingGoal.id} 更新成功`)

      // Update the goals list in the state
      setGoals((prevGoals) =>
        prevGoals.map(
          (g) => (g.id === editingGoal.id ? { ...g, ...updatedGoalData } : g), // Merge updates, ensure all fields are present
        ),
      )

      handleEditGoalModalCancel() // Close modal and clear state
    } catch (error: any) {
      console.error(`更新目标 #${editingGoal.id} 失败:`, error)
      message.error(error.message || '更新目标失败，请重试')
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

  // 计算每个目标下所有附属任务的标签集合（去重）
  const goalAggregatedTaskTags = useMemo(() => {
    const result: Record<number, GoalTagType[]> = {} // Ensure result stores GoalTagType arrays
    if (!tasks || tasks.length === 0 || !goals || goals.length === 0) {
      return result
    }

    const currentUserId = user?.id || 0 // Get current user ID, fallback to 0 or handle as error

    goals.forEach((goal) => {
      const tasksForThisGoal = tasks.filter(
        (task) => task.goalId === goal.id || task.goal?.id === goal.id,
      )
      const allTagsForThisGoal: GoalTagType[] = [] // This list will now contain GoalTagType
      const uniqueTagIds = new Set<number>()

      tasksForThisGoal.forEach((task) => {
        if (task.tags && task.tags.length > 0) {
          // task.tags are TaskTagType[]
          task.tags.forEach((tagFromTask: TaskTagType) => {
            // Explicitly type tagFromTask
            if (!uniqueTagIds.has(tagFromTask.id)) {
              // Convert TaskTagType to GoalTagType
              const goalTagVersion: GoalTagType = {
                id: tagFromTask.id,
                title: tagFromTask.title,
                color: tagFromTask.color,
                userId: currentUserId, // Assign current user's ID
                // user: user && user.username ? { id: currentUserId, username: user.username } : undefined, // Optional: populate user object
              }
              allTagsForThisGoal.push(goalTagVersion) // Pushing GoalTagType
              uniqueTagIds.add(tagFromTask.id)
            }
          })
        }
      })
      result[goal.id] = allTagsForThisGoal
    })
    return result
  }, [goals, tasks, user]) // Added user to dependency array

  // 计算包含动态进度的目标列表
  const goalsWithCalculatedProgress = useMemo(() => {
    if (!goals || goals.length === 0 || !tasks) {
      return goals || [] // Return original goals or empty array if no data
    }

    return goals.map((goal) => {
      const associatedTasks = tasks.filter(
        (task) => task.goalId === goal.id || task.goal?.id === goal.id,
      )
      const totalTasks = associatedTasks.length
      if (totalTasks === 0) {
        return { ...goal, progress: 0 } // No tasks, progress is 0
      }

      const completedTasks = associatedTasks.filter(
        (task) => task.status === 'COMPLETED' || task.status === 'ARCHIVED',
      ).length

      const calculatedProgress = Math.round((completedTasks / totalTasks) * 100)

      return { ...goal, progress: calculatedProgress } // Update progress
    })
  }, [goals, tasks])

  const tabItems = [
    {
      key: 'goals',
      label: '学习目标',
      children: (
        <GoalsTable
          data={goalsWithCalculatedProgress} // Use goals with calculated progress
          loading={loading}
          taskTags={goalAggregatedTaskTags}
          tasks={tasks as any}
          subjects={subjects}
          onEdit={handleEditGoalClick} // Pass edit handler
          onDelete={handleDeleteGoal} // Pass delete handler
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
          data={tasks as any}
          goals={goals}
          loading={loading}
          onRowClick={(task: any) => {
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
          // isSubmitting={formSubmitting} // Incorrect prop name
          // Pass availableTags if GoalForm needs it
          // availableTags={availableTags} // Removed prop, GoalForm does not accept it
          onCancel={() => setGoalModalVisible(false)}
          loading={formSubmitting} // Correct prop name is loading
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
        {/* {console.log('传递给TaskForm的goals数据:', JSON.stringify(goals))} */}
        <TaskForm
          goals={
            goals.length > 0
              ? goals
              : [
                  {
                    id: 888888,
                    title: '测试目标 - 请先创建学习目标',
                    status: 'NOT_STARTED',
                    priority: 'MEDIUM',
                    progress: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  } as Goal,
                ]
          }
          availableTags={availableTags as any}
          onFinish={handleTaskFormSubmit}
          onCancel={() => setTaskModalVisible(false)}
          loading={formSubmitting}
        />
      </Modal>

      {/* 编辑目标的模态框 */}
      <Modal
        title="编辑学习目标"
        open={isEditGoalModalVisible}
        onCancel={handleEditGoalModalCancel}
        footer={null} // Footer is handled by Form's submit button
        destroyOnClose={true} // Reset form state when modal is closed
        maskClosable={false}
      >
        {/* Render GoalForm only when editingGoal is not null */}
        {editingGoal && (
          <GoalForm
            subjects={subjects}
            categories={categories}
            initialValues={editingGoal} // Pass the goal data to prefill the form
            onFinish={handleEditGoalFormSubmit} // Use the edit submit handler
            onCancel={handleEditGoalModalCancel} // Pass cancel handler
            loading={formSubmitting} // Correct prop name is loading
            // availableTags={availableTags} // Pass tags if needed by GoalForm
          />
        )}
      </Modal>
    </div>
  )
}

export default ObjectivesPage
