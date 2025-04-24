import { Goal } from '../types/goals';
import apiClient from './apiService';

// 获取所有目标列表
export const getGoals = async (): Promise<Goal[]> => {
    try {
        const response = await apiClient.get('/api/goals');
        return response.data;
    } catch (error) {
        console.error('获取目标列表失败:', error);
        throw error;
    }
};

// 根据学科ID获取目标列表
export const getGoalsBySubject = async (subjectId: number): Promise<Goal[]> => {
    try {
        const response = await apiClient.get(`/api/goals/subject/${subjectId}`);
        return response.data;
    } catch (error) {
        console.error(`获取学科(ID:${subjectId})的目标列表失败:`, error);
        throw error;
    }
};

// 创建新目标
export const createGoal = async (goalData: {
    subjectId?: number;
    title: string;
    priority?: string;
    categoryId?: number;
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    description?: string;
    targetDate?: Date;
    progress?: number;
    tags?: string[];
}): Promise<Goal> => {
    try {
        const response = await apiClient.post('/api/goals', goalData);
        return response.data;
    } catch (error) {
        console.error('创建目标失败:', error);
        throw error;
    }
};

// 更新目标
export const updateGoal = async (id: number, goalData: Partial<Goal>): Promise<Goal> => {
    try {
        const response = await apiClient.put(`/api/goals/${id}`, goalData);
        return response.data;
    } catch (error) {
        console.error('更新目标失败:', error);
        throw error;
    }
};

// 获取单个目标详情
export const getGoalById = async (id: number): Promise<Goal> => {
    try {
        const response = await apiClient.get(`/api/goals/${id}`);
        return response.data;
    } catch (error) {
        console.error(`获取目标(ID:${id})详情失败:`, error);
        throw error;
    }
};

// 更新目标进度
export const updateGoalProgress = async (id: number, progress: number): Promise<Goal> => {
    try {
        const response = await apiClient.put(`/api/goals/${id}/progress`, { progress });
        return response.data;
    } catch (error) {
        console.error('更新目标进度失败:', error);
        throw error;
    }
};

// 删除目标
export const deleteGoal = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`api/goals/${id}`);
    } catch (error) {
        console.error('删除目标失败:', error);
        throw error;
    }
};

// 更新目标状态
export const updateGoalStatus = async (id: number, status: string): Promise<Goal> => {
    try {
        const response = await apiClient.put(`/api/goals/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('更新目标状态失败:', error);
        throw error;
    }
};
