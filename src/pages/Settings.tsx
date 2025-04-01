import {
  BellOutlined,
  LockOutlined,
  MailOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Divider,
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
const { TabPane } = Tabs
const { Option } = Select

const Settings: React.FC = () => {
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

  return (
    <div>
      <Title
        level={2}
        style={{ marginBottom: '24px' }}
      >
        设置
      </Title>

      <Tabs
        defaultActiveKey="account"
        tabPosition="left"
      >
        <TabPane
          tab={
            <span>
              <UserOutlined /> 账户信息
            </span>
          }
          key="account"
        >
          <Title level={4}>个人资料</Title>
          <Form
            layout="vertical"
            onFinish={onFinishAccount}
            initialValues={
              {
                /* Fetch initial values */
              }
            }
          >
            <Form.Item label="头像">
              <Space align="center">
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  src="https://joeschmoe.io/api/v1/random"
                />{' '}
                {/* Placeholder */}
                <Upload>
                  {' '}
                  {/* Configure Upload component properly later */}
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
              />{' '}
              {/* Usually email is not editable directly */}
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

          <Divider />

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
        </TabPane>
        <TabPane
          tab={
            <span>
              <BellOutlined /> 通知设置
            </span>
          }
          key="notifications"
        >
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
        </TabPane>
        {/* Add more tabs as needed, e.g., 隐私设置, 学习偏好 */}
      </Tabs>
    </div>
  )
}

export default Settings
