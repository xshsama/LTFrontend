import { CreativeTask, HabitTask, StepTask, Task } from '../types/task';
import apiClient from './apiService';

// 获取所有任务
export const getAllTasks = async (): Promise<Task[]> => {
    try {
        const response = await apiClient.get('/api/tasks');

        // 打印后端返回的完整数据以便调试
        console.log('🚀 getAllTasks - 后端API返回的原始数据:', response);
        console.log('🚀 getAllTasks - 后端API返回的data字段:', response.data);

        // 检查是否为包装的API响应格式
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            console.log('🔍 识别为ApiResponse包装格式，提取data数组，长度:', response.data.data.length);
            return response.data.data; // 返回包装在ApiResponse中的data数组
        } else if (Array.isArray(response.data)) {
            console.log('🔍 识别为直接数组格式，长度:', response.data.length);
            return response.data; // 直接返回数组
        } else {
            console.error('❌ API返回格式不符合预期:', response.data);
            return []; // 返回空数组避免错误
        }
    } catch (error) {
        console.error('❌ 获取所有任务失败:', error);
        throw error;
    }
};

// ----- 按任务类型获取任务的API -----

// 获取所有步骤型任务
export const getAllStepTasks = async (): Promise<StepTask[]> => {
    try {
        const response = await apiClient.get('/api/tasks/step');

        console.log('步骤型任务API原始返回数据:', response.data);

        // 处理响应数据
        let tasks: StepTask[] = [];

        // 检查是否为包装的API响应格式
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            tasks = response.data.data;
        } else if (Array.isArray(response.data)) {
            tasks = response.data;
        } else {
            console.error('API返回格式不符合预期:', response.data);
            return [];
        }

        // 确保每个任务的steps属性都正确初始化
        tasks.forEach(task => {
            if (!task.steps) {
                task.steps = [];
            }

            // 确保每个步骤的todoItems属性都是一个数组
            if (task.steps && task.steps.length > 0) {
                task.steps = task.steps.map(step => ({
                    ...step,
                    // 确保每个步骤有必需的属性
                    status: step.status || 'PENDING',
                    todoItems: step.todoItems || [] // 确保todoItems始终是一个数组
                }));
            }

            // 如果任务有stepTaskDetail且有steps，但task.steps为空，使用stepTaskDetail.steps
            if (task.stepTaskDetail && task.stepTaskDetail.steps && task.stepTaskDetail.steps.length > 0) {
                task.steps = task.stepTaskDetail.steps.map(step => ({
                    ...step,
                    // 确保每个步骤有必需的属性
                    status: step.status || 'PENDING',
                    todoItems: step.todoItems || []
                }));
            }
            // 如果有stepsJson但没有解析过，尝试解析
            else if (task.stepsJson && (!task.steps || task.steps.length === 0)) {
                try {
                    const parsedSteps = JSON.parse(task.stepsJson);
                    // 确保解析结果是数组
                    if (Array.isArray(parsedSteps)) {
                        // 对解析后的steps也确保todoItems是数组
                        task.steps = parsedSteps.map(step => ({
                            ...step,
                            todoItems: step.todoItems || []
                        }));
                    } else {
                        console.error('解析的stepsJson不是数组格式');
                        task.steps = []; // 设置为空数组作为后备
                    }
                } catch (e) {
                    console.error('解析stepsJson失败:', e);
                }
            }
        });

        return tasks;
    } catch (error) {
        console.error('获取步骤型任务失败:', error);
        throw error;
    }
};

// 根据目标ID获取任务列表
export const getTasksByGoal = async (goalId: number): Promise<Task[]> => {
    try {
        const response = await apiClient.get(`/api/tasks/goal/${goalId}`);
        // 检查是否为包装的API响应格式
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            return response.data.data; // 返回包装在ApiResponse中的data数组
        } else if (Array.isArray(response.data)) {
            return response.data; // 直接返回数组
        } else {
            console.error(`获取目标(ID:${goalId})的任务列表返回格式不符预期:`, response.data);
            return []; // 返回空数组避免错误
        }
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

// 获取所有习惯型任务
export const getAllHabitTasks = async (): Promise<HabitTask[]> => {
    try {
        const response = await apiClient.get('/api/tasks/habit');

        // 检查是否为包装的API响应格式
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.error('API返回格式不符合预期:', response.data);
            return [];
        }
    } catch (error) {
        console.error('获取习惯型任务失败:', error);
        throw error;
    }
};

// 获取所有创意型任务
export const getAllCreativeTasks = async (): Promise<CreativeTask[]> => {
    try {
        const response = await apiClient.get('/api/tasks/creative');

        // 检查是否为包装的API响应格式
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.error('API返回格式不符合预期:', response.data);
            return [];
        }
    } catch (error) {
        console.error('获取创意型任务失败:', error);
        throw error;
    }
};

// 获取单个步骤型任务
export const getStepTaskById = async (id: number): Promise<StepTask | null> => {
    try {
        const response = await apiClient.get(`/api/tasks/step/${id}`);

        // 检查是否为包装的API响应格式
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error(`获取步骤型任务(ID:${id})失败:`, error);
        throw error;
    }
};

// 获取单个习惯型任务
export const getHabitTaskById = async (id: number): Promise<HabitTask | null> => {
    try {
        const response = await apiClient.get(`/api/tasks/habit/${id}`);

        // 检查是否为包装的API响应格式
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error(`获取习惯型任务(ID:${id})失败:`, error);
        throw error;
    }
};

// 获取单个创意型任务
export const getCreativeTaskById = async (id: number): Promise<CreativeTask | null> => {
    try {
        const response = await apiClient.get(`/api/tasks/creative/${id}`);

        // 检查是否为包装的API响应格式
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error(`获取创意型任务(ID:${id})失败:`, error);
        throw error;
    }
};

// 更新步骤型任务的步骤信息
export const updateStepTaskSteps = async (id: number, steps: any[]): Promise<StepTask | null> => {
    try {
        // 将steps数组转换为JSON字符串
        const stepsJson = JSON.stringify(steps);

        // 调用API更新步骤信息
        const response = await apiClient.put(`/api/tasks/${id}/update-steps`, {
            stepsJson
        });

        console.log('步骤更新响应:', response.data);

        if (response.data && (response.data.data || response.data)) {
            // 返回更新后的任务数据
            return response.data.data || response.data;
        }
        return null;
    } catch (error) {
        console.error('更新步骤型任务步骤失败:', error);
        throw error;
    }
};

// 更新步骤状态
export const updateStepStatus = async (taskId: number, stepId: string, status: string): Promise<StepTask | null> => {
    try {
        console.log(`更新任务ID ${taskId} 中步骤 ${stepId} 的状态为 ${status}`);

        // 首先获取当前任务信息
        const task = await getStepTaskById(taskId);
        if (!task || !task.steps) {
            console.error('任务不存在或没有步骤信息');
            return null;
        }

        // 找到对应步骤并更新其状态
        const updatedSteps = task.steps.map(step => {
            if (step.id === stepId) {
                return {
                    ...step,
                    status: status,
                    completed: status === 'DONE' // 如果状态是DONE，则标记为已完成
                };
            }
            return step;
        });

        // 调用API更新步骤信息
        return await updateStepTaskSteps(taskId, updatedSteps);
    } catch (error) {
        console.error(`更新步骤状态失败:`, error);
        throw error;
    }
};
