import type { AxiosError } from 'axios';
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
        console.log('完整API响应:', {
            data: response.data,

        });

        // 检查响应数据结构
        if (!response.data) {
            throw new Error('API返回空数据');
        }

        let tags = [];
        // 处理不同格式的响应数据
        if (response.data.code === 200) {
            // 格式1: {code:200, data: [...]}
            tags = response.data.data || [];
        } else if (Array.isArray(response.data)) {
            // 格式2: [...]
            tags = response.data;
        } else if (response.data && typeof response.data === 'object') {
            // 格式3: {...}
            tags = [response.data];
        }

        if (tags.length === 0) {
            console.warn('获取到空标签列表，响应数据:', response.data);
        }

        // 清洗数据，去除循环引用
        const cleanTags = tags.map((tag: Tag | null) => {
            if (!tag) return null;

            const cleanTag: Tag = { ...tag };
            // 移除可能存在的循环引用
            if (cleanTag.user) {
                cleanTag.user = {
                    id: cleanTag.user.id,
                    username: cleanTag.user.username
                };
            }
            return cleanTag;
        }).filter(Boolean);

        // 验证并限制返回的标签数量
        const validTags = cleanTags
            .filter((tag: Tag | null): tag is Tag => tag !== null && tag.id !== undefined && tag.name !== undefined)
            .slice(0, 1000); // 最多返回1000个标签

        console.log('获取到的有效标签数量:', validTags.length, '标签样例:', validTags[0]);
        return validTags;
    } catch (error: unknown) {
        let errorMessage = '获取标签列表失败';
        if (typeof error === 'object' && error !== null) {
            const axiosError = error as AxiosError;
            if (axiosError.response) {
                console.error('获取标签列表失败 - 响应数据:', {
                    status: axiosError.response.status,
                    data: axiosError.response.data,
                    headers: axiosError.response.headers
                });
                errorMessage += `: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`;
            } else if (axiosError.request) {
                console.error('获取标签列表失败 - 无响应:', axiosError.request);
                errorMessage += ': 服务器无响应';
            } else {
                console.error('获取标签列表失败 - 请求错误:', axiosError.message);
                errorMessage += `: ${axiosError.message}`;
            }
        } else if (typeof error === 'string') {
            errorMessage += `: ${error}`;
        }
        throw new Error(errorMessage);
    }
};

// 创建新标签
export const createTag = async (name: string): Promise<Tag> => {
    try {
        const response = await apiClient.post('/api/tags', { name });
        return response.data;
    } catch (error) {
        console.error('创建标签失败:', error);
        throw error;
    }
};

// 创建新目标
export const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
    try {
        const response = await apiClient.post('/api/goals', goal);
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
        const response = await apiClient.post('/api/tasks', task);
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
        const response = await apiClient.get('/api/goals');
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
        const url = goalId ? `/tasks?goalId=${goalId}` : '/api/tasks';
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
