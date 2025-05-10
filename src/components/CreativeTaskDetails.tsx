import { EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Collapse,
  Descriptions,
  Form,
  Input,
  List,
  message,
  Modal,
  Rate,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
  addFeedbackToCreativeTask,
  addVersionToCreativeTask,
  updateCreativeTaskPhase,
  updateTask,
} from '../services/taskService'
import {
  CreativeFeedbackDTO,
  CreativeTask,
  CreativeVersionDTO,
  Task,
} from '../types/task' // Import new DTOs

const { Title, Text, Paragraph } = Typography
const { Panel } = Collapse
const { Option } = Select

// Removed local VersionDTO and FeedbackDTO definitions

interface CreativeTaskDetailsProps {
  task: CreativeTask
  onUpdate: (updatedTask: Task) => void // Callback to update task list in parent
}

const CreativeTaskDetails: React.FC<CreativeTaskDetailsProps> = ({
  task,
  onUpdate,
}) => {
  const [isEditingPhase, setIsEditingPhase] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(task.currentPhase)
  const [isAddingVersion, setIsAddingVersion] = useState(false)
  const [isAddingFeedback, setIsAddingFeedback] = useState(false)
  const [isEditingSettings, setIsEditingSettings] = useState(false)

  const [versions, setVersions] = useState<CreativeVersionDTO[]>([]) // Use imported type
  const [feedbacks, setFeedbacks] = useState<CreativeFeedbackDTO[]>([]) // Use imported type

  const [versionForm] = Form.useForm()
  const [feedbackForm] = Form.useForm()
  const [settingsForm] = Form.useForm()

  useEffect(() => {
    setCurrentPhase(task.currentPhase)
    settingsForm.setFieldsValue({
      publicationFormats: task.publicationFormats
        ? task.publicationFormats.split(',')
        : [],
      licenseType: task.licenseType,
    })

    // Parse versionsJson and feedbacksJson
    if (task.versionsJson) {
      try {
        setVersions(JSON.parse(task.versionsJson))
      } catch (e) {
        console.error('Failed to parse versionsJson', e)
        setVersions([])
      }
    } else {
      setVersions([])
    }

    if (task.feedbacksJson) {
      try {
        setFeedbacks(JSON.parse(task.feedbacksJson))
      } catch (e) {
        console.error('Failed to parse feedbacksJson', e)
        setFeedbacks([])
      }
    } else {
      setFeedbacks([])
    }
  }, [task, settingsForm])

  const handlePhaseChange = async (newPhase: CreativeTask['currentPhase']) => {
    try {
      const updatedTask = await updateCreativeTaskPhase(task.id, newPhase)
      if (updatedTask) {
        onUpdate(updatedTask) // This should merge with existing task fields
        setCurrentPhase(newPhase)
        message.success('创作阶段已更新')
      }
      setIsEditingPhase(false)
    } catch (error) {
      message.error('更新创作阶段失败')
    }
  }

  const handleAddVersion = async (values: {
    snapshot: string
    changes: string
  }) => {
    try {
      const changesArray = values.changes
        .split('\n')
        .filter((c) => c.trim() !== '')
      const updatedTask = await addVersionToCreativeTask(task.id, {
        snapshot: values.snapshot,
        changes: changesArray,
      })
      if (updatedTask) {
        onUpdate(updatedTask)
        message.success('新版本已添加')
      }
      setIsAddingVersion(false)
      versionForm.resetFields()
    } catch (error) {
      message.error('添加版本失败')
    }
  }

  const handleAddFeedback = async (values: {
    userId?: string
    creativityRating: number
    logicRating: number
    comments?: string
  }) => {
    try {
      const feedbackData = {
        ...values,
        userId: values.userId || 'anonymous_reviewer',
      }
      const updatedTask = await addFeedbackToCreativeTask(task.id, feedbackData)
      if (updatedTask) {
        onUpdate(updatedTask)
        message.success('反馈已添加')
      }
      setIsAddingFeedback(false)
      feedbackForm.resetFields()
    } catch (error) {
      message.error('添加反馈失败')
    }
  }

  const handleSettingsSave = async (values: {
    publicationFormats: string[]
    licenseType: string
  }) => {
    try {
      const taskDataToUpdate: Partial<CreativeTask> = {
        publicationFormats: values.publicationFormats.join(','),
        licenseType: values.licenseType,
      }
      const updated = await updateTask(
        task.id,
        taskDataToUpdate as Partial<Task>,
      ) // Use generic updateTask
      if (updated) {
        onUpdate(updated as CreativeTask)
        message.success('发布设置已更新')
      }
      setIsEditingSettings(false)
    } catch (error) {
      message.error('更新发布设置失败')
    }
  }

  return (
    <Space
      direction="vertical"
      style={{ width: '100%' }}
      size="large"
    >
      <Card title="创作阶段管理">
        <Space>
          <Text>当前阶段: </Text>
          {isEditingPhase ? (
            <Select
              value={currentPhase}
              onChange={handlePhaseChange}
              style={{ width: 150 }}
            >
              <Option value="DRAFTING">草稿阶段</Option>
              <Option value="REVIEWING">审阅阶段</Option>
              <Option value="FINALIZING">最终确定</Option>
            </Select>
          ) : (
            <Tag
              color={
                currentPhase === 'DRAFTING'
                  ? 'blue'
                  : currentPhase === 'REVIEWING'
                  ? 'orange'
                  : 'green'
              }
            >
              {currentPhase}
            </Tag>
          )}
          <Button
            icon={isEditingPhase ? <SaveOutlined /> : <EditOutlined />}
            onClick={() => setIsEditingPhase(!isEditingPhase)}
          >
            {isEditingPhase ? '保存' : '修改阶段'}
          </Button>
        </Space>
      </Card>

      <Card
        title="发布设置"
        extra={
          <Button
            icon={isEditingSettings ? <SaveOutlined /> : <EditOutlined />}
            onClick={() => setIsEditingSettings(!isEditingSettings)}
          >
            {isEditingSettings ? '保存设置' : '编辑设置'}
          </Button>
        }
      >
        {isEditingSettings ? (
          <Form
            form={settingsForm}
            layout="vertical"
            onFinish={handleSettingsSave}
            initialValues={{
              publicationFormats: task.publicationFormats
                ? task.publicationFormats.split(',')
                : [],
              licenseType: task.licenseType,
            }}
          >
            <Form.Item
              name="publicationFormats"
              label="发布格式"
            >
              <Select
                mode="tags"
                placeholder="例如: PDF, EPUB, HTML"
                tokenSeparators={[',']}
              />
            </Form.Item>
            <Form.Item
              name="licenseType"
              label="许可证类型"
            >
              <Select placeholder="选择许可证">
                <Option value="CC_BY">CC BY (署名)</Option>
                <Option value="ALL_RIGHTS_RESERVED">保留所有权利</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
              >
                保存设置
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Descriptions
            bordered
            column={1}
          >
            <Descriptions.Item label="发布格式">
              {task.publicationFormats
                ?.split(',')
                .map((pf) => <Tag key={pf}>{pf}</Tag>) || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="许可证类型">
              {task.licenseType || '未设置'}
            </Descriptions.Item>
            {/* Assuming validationScore is directly on CreativeTask from backend DTO */}
            {typeof task.validationScore === 'number' && (
              <Descriptions.Item label="评估分数">
                <Rate
                  disabled
                  value={task.validationScore}
                  count={5}
                />{' '}
                {/* Assuming score is 1-5 */}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Card>

      <Collapse accordion>
        <Panel
          header={`版本历史 (${versions.length})`}
          key="1"
        >
          <Button
            icon={<PlusOutlined />}
            onClick={() => setIsAddingVersion(true)}
            style={{ marginBottom: 16 }}
          >
            添加新版本
          </Button>
          <List
            itemLayout="horizontal"
            dataSource={versions}
            renderItem={(
              item: CreativeVersionDTO, // Use imported type
            ) => (
              <List.Item>
                <List.Item.Meta
                  title={`版本 ${item.versionId || 'N/A'} - ${
                    item.timestamp
                      ? dayjs(item.timestamp).format('YYYY-MM-DD HH:mm')
                      : 'N/A'
                  }`}
                  description={
                    <>
                      <Paragraph>
                        快照/链接: <Text copyable>{item.snapshot || '无'}</Text>
                      </Paragraph>
                      <Paragraph>
                        变更描述: {item.changes?.join('; ') || '无'}
                      </Paragraph>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Panel>
        <Panel
          header={`反馈信息 (${feedbacks.length})`}
          key="2"
        >
          <Button
            icon={<PlusOutlined />}
            onClick={() => setIsAddingFeedback(true)}
            style={{ marginBottom: 16 }}
          >
            添加反馈
          </Button>
          <List
            itemLayout="horizontal"
            dataSource={feedbacks}
            renderItem={(
              item: CreativeFeedbackDTO, // Use imported type
            ) => (
              <List.Item>
                <List.Item.Meta
                  title={`来自用户: ${item.userId || '匿名'}`}
                  description={
                    <>
                      <Paragraph>
                        创意评分:{' '}
                        <Rate
                          disabled
                          value={item.creativityRating}
                          count={5}
                        />
                      </Paragraph>
                      <Paragraph>
                        逻辑评分:{' '}
                        <Rate
                          disabled
                          value={item.logicRating}
                          count={5}
                        />
                      </Paragraph>
                      <Paragraph>评论: {item.comments || '无评论'}</Paragraph>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Panel>
      </Collapse>

      <Modal
        title="添加新版本"
        visible={isAddingVersion}
        onCancel={() => setIsAddingVersion(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={versionForm}
          layout="vertical"
          onFinish={handleAddVersion}
        >
          <Form.Item
            name="snapshot"
            label="内容快照/存储链接"
            rules={[{ required: true, message: '请输入快照或链接' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="changes"
            label="变更描述 (每行一条)"
            rules={[{ required: true, message: '请输入变更描述' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
            >
              提交版本
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加反馈"
        visible={isAddingFeedback}
        onCancel={() => setIsAddingFeedback(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={feedbackForm}
          layout="vertical"
          onFinish={handleAddFeedback}
        >
          <Form.Item
            name="userId"
            label="审阅者ID (可选)"
          >
            <Input placeholder="您的用户ID或昵称" />
          </Form.Item>
          <Form.Item
            name="creativityRating"
            label="创意评分"
            rules={[{ required: true, message: '请选择创意评分' }]}
          >
            <Rate count={5} />
          </Form.Item>
          <Form.Item
            name="logicRating"
            label="逻辑评分"
            rules={[{ required: true, message: '请选择逻辑评分' }]}
          >
            <Rate count={5} />
          </Form.Item>
          <Form.Item
            name="comments"
            label="评论内容"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
            >
              提交反馈
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

export default CreativeTaskDetails
