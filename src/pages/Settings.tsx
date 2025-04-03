import {
  LockOutlined,
  MailOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
  Upload,
} from 'antd'
import React from 'react'

const { Title } = Typography
const { Option } = Select

const SettingsPage: React.FC = () => {
  // Placeholder handlers - implement actual logic later
  const onFinishAccount = (values: any) => {
    console.log('Account settings submitted:', values)
    // API call to update account settings
  }

  const onFinishPassword = (values: any) => {
    console.log('Password change submitted:', values)
    // API call to change password
  }

  const onFinishNotifications = (values: any) => {
    console.log('Notification settings submitted:', values)
    // API call to update notification settings
  }

  const tabItems = [
    {
      key: '1',
      label: '个人资料',
      children: (
        <div className="settings-section">
          <Title level={4}>个人资料</Title>
          <Form
            layout="vertical"
            onFinish={onFinishAccount}
            initialValues={{}}
          >
            <Form.Item label="头像">
              <Space align="center">
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  src="https://joeschmoe.io/api/v1/random"
                />
                <Upload>
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </Space>
            </Form.Item>
            <Form.Item
              label="昵称"
              name="nickname"
              rules={[{ required: true, message: '请输入昵称!' }]}
            >
              <Input placeholder="输入你的昵称" />
            </Form.Item>
            <Form.Item
              label="邮箱"
              name="email"
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="your.email@example.com"
                disabled
              />
            </Form.Item>
            <Form.Item
              label="个人简介"
              name="bio"
            >
              <Input.TextArea
                rows={4}
                placeholder="简单介绍一下自己吧"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
              >
                保存更改
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: '2',
      label: '账号设置',
      children: (
        <div className="settings-section">
          <Title level={4}>修改密码</Title>
          <Form
            layout="vertical"
            onFinish={onFinishPassword}
          >
            <Form.Item
              label="当前密码"
              name="currentPassword"
              rules={[{ required: true, message: '请输入当前密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="当前密码"
              />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[{ required: true, message: '请输入新密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="新密码"
              />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: '请确认新密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认新密码"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
              >
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: '3',
      label: '通知设置',
      children: (
        <div className="settings-section">
          <Title level={4}>通知偏好</Title>
          <Form
            layout="vertical"
            onFinish={onFinishNotifications}
            initialValues={{ emailNotifications: true, taskReminders: 'daily' }}
          >
            <Form.Item
              name="emailNotifications"
              label="邮件通知"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </Form.Item>
            <Form.Item
              name="taskReminders"
              label="任务提醒频率"
            >
              <Select style={{ width: 200 }}>
                <Option value="daily">每天</Option>
                <Option value="weekly">每周</Option>
                <Option value="never">从不</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="communityUpdates"
              label="社区动态通知"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
              >
                保存通知设置
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ]

  return (
    <div className="settings-container">
      <Title level={2}>设置</Title>
      <Tabs
        items={tabItems}
        defaultActiveKey="1"
      />
    </div>
  )
}

export default SettingsPage
