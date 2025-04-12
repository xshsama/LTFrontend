import { Category, Goal, Subject, Tag, Task } from '../types/goals';
import apiClient from './apiService';

// 获取学科列表
export const getSubjects = async (): Promise<Subject[]> => {
    try {
        const response = await apiClient.get('/api/subjects');
        return response.data;
    } catch (error) {
        console.error('获取学科列表失败:', error);
        throw error;
    }
};

// 获取分类列表
export const getCategories = async (subjectId?: number): Promise<Category[]> => {
    try {
        const url = subjectId ? `/api/categories?subjectId=${subjectId}` : '/api/categories';
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error('获取分类列表失败:', error);
        throw error;
    }
};

// 获取标签列表
export const getTags = async (): Promise<Tag[]> => {
    try {
        const response = await apiClient.get('/api/tags');
        return response.data;
    } catch (error) {
        console.error('获取标签列表失败:', error);
        throw error;
    }
};

// 创建新目标
export const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
    try {
        const response = await apiClient.post('/goals', goal);
        if (response.data?.code === 200) {
            return response.data.data;
        }
        throw new Error(response.data?.message || '创建目标失败');
    } catch (error) {
        console.error('创建目标失败:', error);
        throw error;
    }
};

// 创建新任务
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
        const response = await apiClient.post('/tasks', task);
        if (response.data?.code === 200) {
            return response.data.data;
        }
        throw new Error(response.data?.message || '创建任务失败');
    } catch (error) {
        console.error('创建任务失败:', error);
        throw error;
    }
};

// 获取目标列表
export const getGoals = async (): Promise<Goal[]> => {
    try {
        const response = await apiClient.get('/goals');
        if (response.data?.code === 200) {
            return response.data.data;
        }
        throw new Error(response.data?.message || '获取目标列表失败');
    } catch (error) {
        console.error('获取目标列表失败:', error);
        throw error;
    }
};

// 获取任务列表
export const getTasks = async (goalId?: number): Promise<Task[]> => {
    try {
        const url = goalId ? `/tasks?goalId=${goalId}` : '/tasks';
        const response = await apiClient.get(url);
        if (response.data?.code === 200) {
            return response.data.data;
        }
        throw new Error(response.data?.message || '获取任务列表失败');
    } catch (error) {
        console.error('获取任务列表失败:', error);
        throw error;
    }
};
