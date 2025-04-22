import {
  Button,
  Card,
  InputNumber,
  Select,
  Space,
  Typography,
  message,
} from 'antd'
import React, { useEffect, useState } from 'react'
import { addTagToTask, getTagsByTaskId } from '../services/taskTagService'

const { Title, Text } = Typography

interface TagOption {
  value: number
  label: string
  color?: string
}

const TagManager: React.FC = () => {
  const [taskId, setTaskId] = useState<number | null>(null)
  const [tagId, setTagId] = useState<number | null>(null)
  const [availableTags, setAvailableTags] = useState<TagOption[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [currentTags, setCurrentTags] = useState<any[]>([])

  // 加载可用标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        // 此处应该调用获取所有标签的API
        // 这里使用模拟数据
        // 在实际应用中，您应该替换为真实的API调用
        const mockTags = [
          { id: 1, name: '重要', color: 'red' },
          { id: 2, name: '学习', color: 'blue' },
          { id: 3, name: '进行中', color: 'green' },
          { id: 4, name: '高优先级', color: 'orange' },
          { id: 5, name: '低优先级', color: 'gray' },
          { id: 6, name: '复习', color: 'purple' },
        ]

        setAvailableTags(
          mockTags.map((tag) => ({
            value: tag.id,
            label: tag.name,
            color: tag.color,
          })),
        )
      } catch (error) {
        console.error('获取标签失败:', error)
        message.error('获取标签列表失败')
      }
    }

    fetchTags()
  }, [])

  // 加载当前任务的标签
  const loadTaskTags = async () => {
    if (!taskId) return

    try {
      setLoading(true)
      const tags = await getTagsByTaskId(taskId)
      setCurrentTags(tags || [])
    } catch (error) {
      console.error('获取任务标签失败:', error)
      message.error('获取任务标签失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async () => {
    if (!taskId || !tagId) {
      message.warning('请选择任务ID和标签')
      return
    }

    try {
      setLoading(true)
      await addTagToTask(taskId, tagId)
      message.success('成功添加标签到任务')

      // 重新加载任务标签
      await loadTaskTags()
    } catch (error) {
      console.error('添加标签失败:', error)
      message.error('添加标签失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title="任务标签管理"
      style={{ maxWidth: 600, margin: '20px auto' }}
    >
      <Space
        direction="vertical"
        style={{ width: '100%' }}
      >
        <Title level={5}>添加标签到任务</Title>

        <div>
          <Text>任务ID:</Text>
          <InputNumber
            style={{ width: '100%', marginTop: 8 }}
            placeholder="输入任务ID"
            value={taskId}
            onChange={(value) => {
              setTaskId(value)
              if (value) {
                loadTaskTags()
              } else {
                setCurrentTags([])
              }
            }}
          />
        </div>

        <div>
          <Text>选择标签:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="选择标签"
            value={tagId}
            onChange={setTagId}
            options={availableTags}
            optionRender={(option) => (
              <Space>
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    backgroundColor: option.data.color || 'blue',
                    borderRadius: '50%',
                    marginRight: 8,
                  }}
                ></span>
                {option.label}
              </Space>
            )}
          />
        </div>

        <Button
          type="primary"
          loading={loading}
          onClick={handleAddTag}
          style={{ marginTop: 16 }}
        >
          添加标签到任务
        </Button>

        {taskId && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>当前任务标签</Title>
            {loading ? (
              <Text>加载中...</Text>
            ) : currentTags.length > 0 ? (
              <Space wrap>
                {currentTags.map((tag) => (
                  <div
                    key={tag.id}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: tag.color || 'blue',
                      color: 'white',
                      margin: '0 4px 4px 0',
                    }}
                  >
                    {tag.name}
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary">该任务暂无标签</Text>
            )}
          </div>
        )}
      </Space>
    </Card>
  )
}

export default TagManager
