import apiClient from './apiService';

/**
 * 获取当前用户的所有标签
 */
export const getAllTags = async () => {
    try {
        const response = await apiClient.get('/api/tags');
        return response.data.data || [];
    } catch (error) {
        console.error('获取标签失败:', error);
        throw error;
    }
};

/**
 * 创建新标签
 */
export const createTag = async (tagData: { name: string; color?: string }) => {
    try {
        const response = await apiClient.post('/api/tags', tagData);
        return response.data.data;
    } catch (error) {
        console.error('创建标签失败:', error);
        throw error;
    }
};

/**
 * 更新标签
 */
export const updateTag = async (tagId: number, tagData: { name?: string; color?: string }) => {
    try {
        const response = await apiClient.put(`/api/tags/${tagId}`, tagData);
        return response.data.data;
    } catch (error) {
        console.error('更新标签失败:', error);
        throw error;
    }
};

/**
 * 删除标签
 */
export const deleteTag = async (tagId: number) => {
    try {
        const response = await apiClient.delete(`/api/tags/${tagId}`);
        return response.data.data;
    } catch (error) {
        console.error('删除标签失败:', error);
        throw error;
    }
};
