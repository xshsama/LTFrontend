import { Task } from '../types/task';
import apiClient from './apiService';

// 获取所有任务
export const getAllTasks = async (): Promise<Task[]> => {
    try {
        const response = await apiClient.get('/api/tasks');
        return response.data;
    } catch (error) {
        console.error('获取所有任务失败:', error);
        throw error;
    }
};

// 根据目标ID获取任务列表
export const getTasksByGoal = async (goalId: number): Promise<Task[]> => {
    try {
        const response = await apiClient.get(`/api/tasks/goal/${goalId}`);
        return response.data;
    } catch (error) {
        console.error(`获取目标(ID:${goalId})的任务列表失败:`, error);
        throw error;
    }
};

// 获取单个任务详情
export const getTaskById = async (id: number): Promise<Task> => {
    try {
        const response = await apiClient.get(`/api/tasks/${id}`);
        return response.data;
    } catch (error) {
        console.error(`获取任务(ID:${id})详情失败:`, error);
        throw error;
    }
};

// 创建新任务
export const createTask = async (taskData: {
    goalId: number;
    title: string;
    type: 'STEP' | 'HABIT' | 'CREATIVE';
    status?: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
    weight?: number;
    estimatedTimeMinutes?: number;
    tags?: any[];
    tagIds?: number[];
    // 以下是特定任务类型的字段
    stepsJson?: string;
    frequency?: string;
    daysOfWeekJson?: string;
    customPattern?: string;
    publicationFormats?: string;
    licenseType?: string;
    currentPhase?: string;
}): Promise<Task> => {
    try {
        const response = await apiClient.post('/api/tasks', taskData);
        return response.data;
    } catch (error) {
        console.error('创建任务失败:', error);
        throw error;
    }
};

// 更新任务
export const updateTask = async (id: number, taskData: Partial<Task>): Promise<Task> => {
    try {
        const response = await apiClient.put(`/api/tasks/${id}`, taskData);
        return response.data;
    } catch (error) {
        console.error('更新任务失败:', error);
        throw error;
    }
};

// 更新任务已花费时间
export const updateTaskTimeSpent = async (id: number, actualTimeMinutes: number): Promise<Task> => {
    try {
        const response = await apiClient.put(`/api/tasks/${id}/time-spent`, { actualTimeMinutes });
        return response.data;
    } catch (error) {
        console.error('更新任务已花费时间失败:', error);
        throw error;
    }
};

// 删除任务
export const deleteTask = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/api/tasks/${id}`);
    } catch (error) {
        console.error('删除任务失败:', error);
        throw error;
    }
};

// 更新任务状态
export const updateTaskStatus = async (id: number, status: string): Promise<Task> => {
    try {
        const response = await apiClient.put(`/api/tasks/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('更新任务状态失败:', error);
        throw error;
    }
};

// ===== 任务标签相关方法 =====

// 为任务添加单个标签
export const addTagToTask = async (taskId: number, tagId: number): Promise<void> => {
    try {
        await apiClient.post('/api/task-tags/add-tag', {
            taskId,
            tagId
        });
    } catch (error) {
        console.error('添加标签到任务失败:', error);
        throw error;
    }
};

// 为任务添加多个标签
export const addTagsToTask = async (taskId: number, tagIds: number[]): Promise<void> => {
    try {
        await apiClient.post('/api/task-tags/add-tags', {
            taskId,
            tagIds
        });
    } catch (error) {
        console.error('批量添加标签到任务失败:', error);
        throw error;
    }
};

// 从任务中移除标签
export const removeTagFromTask = async (taskId: number, tagId: number): Promise<void> => {
    try {
        await apiClient.delete(`/api/task-tags/task/${taskId}/tag/${tagId}`);
    } catch (error) {
        console.error('从任务中移除标签失败:', error);
        throw error;
    }
};

// 获取任务的所有标签
export const getTaskTags = async (taskId: number): Promise<any[]> => {
    try {
        const response = await apiClient.get(`/api/task-tags/task/${taskId}/tags`);
        return response.data.data;
    } catch (error) {
        console.error('获取任务标签失败:', error);
        throw error;
    }
};

// 设置任务标签（替换所有现有标签）
export const setTaskTags = async (taskId: number, tagIds: number[]): Promise<void> => {
    try {
        await apiClient.put(`/api/task-tags/task/${taskId}/set-tags`, tagIds);
    } catch (error) {
        console.error('设置任务标签失败:', error);
        throw error;
    }
};

// 清除任务的所有标签
export const clearTaskTags = async (taskId: number): Promise<void> => {
    try {
        await apiClient.delete(`/api/task-tags/task/${taskId}/clear-tags`);
    } catch (error) {
        console.error('清除任务标签失败:', error);
        throw error;
    }
};
