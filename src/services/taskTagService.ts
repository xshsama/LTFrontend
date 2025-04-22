import apiClient from './apiService';

/**
 * 任务标签相关服务
 */

// 为任务添加单个标签
export const addTagToTask = async (taskId: number, tagId: number) => {
    try {
        const response = await apiClient.post('/api/task-tags/add-tag', {
            taskId,
            tagId
        });
        return response.data.data;
    } catch (error) {
        console.error('添加标签到任务失败:', error);
        throw error;
    }
};

// 为任务添加多个标签
export const addTagsToTask = async (taskId: number, tagIds: number[]) => {
    try {
        const response = await apiClient.post('/api/task-tags/add-tags', {
            taskId,
            tagIds
        });
        return response.data.data;
    } catch (error) {
        console.error('批量添加标签到任务失败:', error);
        throw error;
    }
};

// 从任务中移除标签
export const removeTagFromTask = async (taskId: number, tagId: number) => {
    try {
        const response = await apiClient.delete(`/api/task-tags/task/${taskId}/tag/${tagId}`);
        return response.data.data;
    } catch (error) {
        console.error('从任务中移除标签失败:', error);
        throw error;
    }
};

// 获取任务的所有标签
export const getTagsByTaskId = async (taskId: number) => {
    try {
        const response = await apiClient.get(`/api/task-tags/task/${taskId}/tags`);
        return response.data.data;
    } catch (error) {
        console.error('获取任务标签失败:', error);
        throw error;
    }
};

// 设置任务标签（替换所有现有标签）
export const setTaskTags = async (taskId: number, tagIds: number[]) => {
    try {
        // 以对象形式发送请求，使用 {tagIds: [...]} 格式
        const response = await apiClient.put(`/api/task-tags/task/${taskId}/set-tags`, {
            tagIds: tagIds
        });
        return response.data.data;
    } catch (error) {
        console.error('设置任务标签失败:', error);
        throw error;
    }
};

// 清除任务的所有标签
export const clearTaskTags = async (taskId: number) => {
    try {
        const response = await apiClient.delete(`/api/task-tags/task/${taskId}/clear-tags`);
        return response.data.data;
    } catch (error) {
        console.error('清除任务标签失败:', error);
        throw error;
    }
};
