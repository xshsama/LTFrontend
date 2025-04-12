import { Task } from '../types/goals';
import apiClient from './apiService';

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
    description?: string;
    dueDate?: string;
    priority?: string;
    estimatedTimeMinutes?: number;
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
