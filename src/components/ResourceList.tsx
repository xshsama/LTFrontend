import { List, Skeleton } from 'antd'
import React from 'react'
import { Resource } from '../types/resource'

interface ResourceListProps {
  resources: Resource[]
  loading?: boolean
}

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  loading = false,
}) => {
  return (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={resources}
      loading={loading}
      renderItem={(item) => (
        <List.Item
          key={item.id}
          actions={[<a key="edit">编辑</a>, <a key="delete">删除</a>]}
          extra={
            item.type === 'video' ? (
              <img
                width={272}
                alt="thumbnail"
                src={item.thumbnail || 'https://via.placeholder.com/272x153'}
              />
            ) : null
          }
        >
          <Skeleton
            loading={loading}
            active
          >
            <List.Item.Meta
              title={<a href={item.source}>{item.title}</a>}
              description={item.description}
            />
          </Skeleton>
        </List.Item>
      )}
    />
  )
}

export default ResourceList
