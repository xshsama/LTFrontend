import { Goal } from '../types/goals';
import apiClient from './apiService';

// 获取所有目标列表
export const getGoals = async (): Promise<Goal[]> => {
    try {
        console.log('正在请求目标列表...');
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('获取目标列表失败：未找到认证令牌');
            return []; // 返回空数组而不是抛出错误
        }

        const response = await apiClient.get('/api/goals', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('获取目标列表成功:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('获取目标列表失败:', error.response?.status, error.response?.data || error.message);
        // 返回空数组而不是抛出错误，避免界面崩溃
        return [];
    }
};

// 根据学科ID获取目标列表
export const getGoalsBySubject = async (subjectId: number): Promise<Goal[]> => {
    try {
        console.log(`正在获取学科ID=${subjectId}的目标列表...`);
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn(`获取学科(ID:${subjectId})的目标列表失败：未找到认证令牌`);
            return []; // 返回空数组而不是抛出错误
        }

        const response = await apiClient.get(`/api/goals/subject/${subjectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`获取学科(ID:${subjectId})的目标列表成功:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error(`获取学科(ID:${subjectId})的目标列表失败:`, error.response?.status, error.response?.data || error.message);
        // 返回空数组避免页面崩溃
        return [];
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
        // 验证令牌
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('创建目标失败: 未找到认证令牌');
            throw new Error('未登录或认证会话已过期，请重新登录后再试');
        }

        console.log('正在发送创建目标请求:', goalData);
        const response = await apiClient.post('/api/goals', goalData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('创建目标成功:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('创建目标失败:', error.response?.status, error.response?.data || error.message);

        let errorMessage = '创建目标失败';
        // 从响应中提取更有用的错误信息
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 403) {
            errorMessage = '权限不足，无法创建目标';
        } else if (error.response?.status === 401) {
            errorMessage = '认证已过期，请重新登录';
        }

        throw new Error(errorMessage);
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
