import { UploadOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, message, Spin, Upload } from 'antd'
import { RcFile, UploadProps } from 'antd/es/upload'
import React, { useState } from 'react'
import { uploadAvatar } from '../services/profileService'
import '../styles/AvatarUploader.css' // 导入单独的CSS文件

interface AvatarUploaderProps {
  currentAvatar?: string
  onSuccess?: (avatarUrl: string) => void
  size?: number // Avatar大小
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  onSuccess,
  size = 120,
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentAvatar)

  // 验证文件大小和类型
  const beforeUpload = (file: RcFile): boolean => {
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/gif'
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG/GIF 格式的图片!')
      return false
    }

    const isLessThan2M = file.size / 1024 / 1024 < 2
    if (!isLessThan2M) {
      message.error('图片大小不能超过 2MB!')
      return false
    }

    return isJpgOrPng && isLessThan2M
  }

  // 处理头像上传
  const handleChange: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }

    if (info.file.status === 'done') {
      // 这里不实际执行什么，因为我们使用了customRequest
      setLoading(false)
    }
  }

  // 自定义上传请求
  const customRequest = async ({
    file,
    onSuccess: uploadSuccess,
    onError,
  }: any) => {
    try {
      setLoading(true)
      const newAvatarUrl = await uploadAvatar(file)

      setAvatarUrl(newAvatarUrl)

      if (uploadSuccess) {
        uploadSuccess()
      }

      if (onSuccess) {
        onSuccess(newAvatarUrl)
      }

      message.success('头像上传成功!')
      setLoading(false)
    } catch (error) {
      console.error('头像上传失败:', error)
      message.error('头像上传失败，请重试!')

      if (onError) {
        onError(error)
      }

      setLoading(false)
    }
  }

  return (
    <div className="avatar-uploader">
      <Spin spinning={loading}>
        <div className="avatar-wrapper">
          <Avatar
            size={size}
            src={avatarUrl}
            icon={!avatarUrl && <UserOutlined />}
          />

          <div className="upload-button">
            <Upload
              name="avatar"
              listType="text"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              customRequest={customRequest}
            >
              <Button
                icon={<UploadOutlined />}
                size="small"
                loading={loading}
              >
                更换头像
              </Button>
            </Upload>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default AvatarUploader
