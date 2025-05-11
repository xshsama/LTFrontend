import { Goal, GoalStatus, Priority } from '../types/goals'; // Corrected GoalPriority to Priority
import apiClient from './apiService';

// Define the request payload structure for updating a goal, matching backend GoalDTO.UpdateGoalRequest
interface UpdateGoalRequest {
    title?: string;
    status?: GoalStatus; // Use GoalStatus enum/type
    completionDate?: string | null; // ISO string format for date
    priority?: Priority; // Use Priority type
    progress?: number;
    categoryId?: number | null;
}

// 获取所有目标列表
export const getGoals = async (): Promise<Goal[]> => {
    try {
        console.log('正在请求目标列表...');
        // 移除手动的token获取和header设置，依赖apiService拦截器
        const response = await apiClient.get('/api/goals');
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
        // 移除手动的token获取和header设置，依赖apiService拦截器
        const response = await apiClient.get(`/api/goals/subject/${subjectId}`);
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
    status?: 'ONGOING' | 'COMPLETED' | 'EXPIRED';
    description?: string;
    targetDate?: Date;
    progress?: number;
    tags?: string[];
}): Promise<Goal> => {
    try {
        // 移除手动的token获取和header设置，依赖apiService拦截器
        // apiClient的拦截器会自动处理Authorization头
        // Content-Type通常由axios根据data类型自动设置，或在apiClient默认配置中设置
        console.log('正在发送创建目标请求:', goalData);
        const response = await apiClient.post('/api/goals', goalData);
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
export const updateGoal = async (id: number, goalData: UpdateGoalRequest): Promise<Goal> => {
    try {
        console.log(`正在发送更新目标 (ID: ${id}) 请求:`, goalData);
        // 移除手动的token获取和header设置，依赖apiService拦截器
        const response = await apiClient.put(`/api/goals/${id}`, goalData);
        console.log(`更新目标 (ID: ${id}) 成功:`, response.data);
        window.dispatchEvent(new CustomEvent('goalUpdated', { detail: { goalId: id } }));
        return response.data;
    } catch (error: any) {
        console.error(`更新目标 (ID: ${id}) 失败:`, error.response?.status, error.response?.data || error.message);
        // Provide more specific error messages
        let errorMessage = '更新目标失败';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
            errorMessage = '目标未找到';
        } else if (error.response?.status === 403) {
            errorMessage = '权限不足';
        } else if (error.response?.status === 401) {
            errorMessage = '认证已过期，请重新登录';
        }
        throw new Error(errorMessage);
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
        window.dispatchEvent(new CustomEvent('goalUpdated', { detail: { goalId: id } }));
        return response.data;
    } catch (error) {
        console.error('更新目标进度失败:', error);
        throw error;
    }
};

// 删除目标
export const deleteGoal = async (id: number): Promise<void> => {
    try {
        console.log(`正在发送删除目标 (ID: ${id}) 请求...`);
        // 移除手动的token获取和header设置，依赖apiService拦截器
        await apiClient.delete(`/api/goals/${id}`);
        console.log(`删除目标 (ID: ${id}) 成功`);
    } catch (error: any) {
        console.error(`删除目标 (ID: ${id}) 失败:`, error.response?.status, error.response?.data || error.message);
        // Provide more specific error messages
        let errorMessage = '删除目标失败';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
            errorMessage = '目标未找到';
        } else if (error.response?.status === 403) {
            errorMessage = '权限不足';
        } else if (error.response?.status === 401) {
            errorMessage = '认证已过期，请重新登录';
        }
        throw new Error(errorMessage);
    }
};

// 更新目标状态
export const updateGoalStatus = async (id: number, status: GoalStatus): Promise<Goal> => {
    try {
        const response = await apiClient.put(`/api/goals/${id}/status`, { status });
        window.dispatchEvent(new CustomEvent('goalUpdated', { detail: { goalId: id } }));
        return response.data;
    } catch (error) {
        console.error('更新目标状态失败:', error);
        throw error;
    }
};
