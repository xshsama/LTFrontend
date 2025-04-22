import { Spin, Tag, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { getTagsByTaskId } from '../services/taskTagService'

const { Text } = Typography

interface TagItem {
  id: number
  name: string
  color?: string
}

interface TaskTagsProps {
  taskId: number
  showTitle?: boolean
  maxDisplay?: number
  refreshTrigger?: number // 新增一个刷新触发器属性
}

const TaskTags: React.FC<TaskTagsProps> = ({
  taskId,
  showTitle = false,
  maxDisplay = 10,
  refreshTrigger = 0, // 默认值为0
}) => {
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTags = async () => {
      if (!taskId) return

      try {
        setLoading(true)
        console.log('正在获取任务ID为', taskId, '的标签')
        const fetchedTags = await getTagsByTaskId(taskId)
        console.log('获取到的标签数据:', fetchedTags)
        setTags(fetchedTags || [])
        setError(null)
      } catch (err) {
        console.error('获取任务标签失败:', err)
        setError('获取标签失败')
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [taskId, refreshTrigger]) // 添加refreshTrigger作为依赖

  if (loading) return <Spin size="small" />

  if (error) return <Text type="danger">{error}</Text>

  if (!tags || tags.length === 0) return <Text type="secondary">无标签</Text>

  return (
    <div className="task-tags">
      {showTitle && <div className="tags-title">标签:</div>}
      <div className="tags-container">
        {tags.slice(0, maxDisplay).map((tag) => (
          <Tag
            key={tag.id}
            color={tag.color || 'blue'}
          >
            {tag.name}
          </Tag>
        ))}
        {tags.length > maxDisplay && <Tag>+{tags.length - maxDisplay}</Tag>}
      </div>
    </div>
  )
}

export default TaskTags
