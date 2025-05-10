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

            // 确保每个步骤有必要属性
            if (task.steps && task.steps.length > 0) {
                task.steps = task.steps.map(step => ({
                    ...step,
                    // 确保每个步骤有必需的属性
                    status: step.status || 'PENDING'
                }));
            }

            // 如果任务有stepTaskDetail且有steps，但task.steps为空，使用stepTaskDetail.steps
            if (task.stepTaskDetail && task.stepTaskDetail.steps && task.stepTaskDetail.steps.length > 0) {
                task.steps = task.stepTaskDetail.steps.map(step => ({
                    ...step,
                    // 确保每个步骤有必需的属性
                    status: step.status || 'PENDING'
                }));
            }
            // 如果有stepsJson但没有解析过，尝试解析
            else if (task.stepsJson && (!task.steps || task.steps.length === 0)) {
                try {
                    const parsedSteps = JSON.parse(task.stepsJson);
                    // 确保解析结果是数组
                    if (Array.isArray(parsedSteps)) {
                        task.steps = parsedSteps.map(step => ({
                            ...step
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
        // 根据其他API路径模式调整
        const apiPath = `/tasks/${id}`;
        console.log(`获取任务详情，路径: ${apiPath}`);
        const response = await apiClient.get(apiPath);
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
        // 根据后端日志，调整路径格式与其他API保持一致
        const apiPath = `/tasks/${id}/status`;
        console.log(`发送任务状态更新请求到: ${apiPath}`);
        const response = await apiClient.put(apiPath, { status });
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
// ===== 习惯任务打卡 =====

// 执行习惯任务打卡
export const checkInHabitTask = async (id: number): Promise<Task> => {
    try {
        console.log(`正在发送习惯任务 (ID: ${id}) 打卡请求...`);
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error(`习惯任务 (ID: ${id}) 打卡失败: 未找到认证令牌`);
            throw new Error('认证失败，请重新登录');
        }
        // Check-in typically doesn't require a request body
        const response = await apiClient.post(`/api/tasks/${id}/check-in`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`习惯任务 (ID: ${id}) 打卡成功:`, response.data);
        // Assuming the backend returns the updated task DTO
        // Need to ensure the returned data structure matches the Task type
        // Perform necessary checks or transformations if needed
        if (response.data && typeof response.data === 'object') {
            // Basic check, might need more specific validation based on Task type
            return response.data as Task;
        } else {
            console.error('打卡API返回格式不符合预期:', response.data);
            throw new Error('打卡成功，但未能获取更新后的任务数据');
        }
    } catch (error: any) {
        console.error(`习惯任务 (ID: ${id}) 打卡失败:`, error.response?.status, error.response?.data || error.message);
        let errorMessage = '打卡失败';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
            errorMessage = '任务未找到或非习惯任务';
        } else if (error.response?.status === 409) { // Conflict for already checked in
            errorMessage = '今日已打卡';
        } else if (error.response?.status === 403) {
            errorMessage = '权限不足';
        } else if (error.response?.status === 401) {
            errorMessage = '认证已过期，请重新登录';
        }
        throw new Error(errorMessage);
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
// ===== 创意型任务特有方法 =====

// 更新创意任务阶段
export const updateCreativeTaskPhase = async (id: number, phase: 'DRAFTING' | 'REVIEWING' | 'FINALIZING'): Promise<CreativeTask | null> => {
    try {
        const response = await apiClient.put(`/api/tasks/creative/${id}/phase`, { phase });
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error(`更新创意任务(ID:${id})阶段失败:`, error);
        throw error;
    }
};

// 为创意任务添加版本
export const addVersionToCreativeTask = async (id: number, versionData: { snapshot: string; changes: string[] }): Promise<CreativeTask | null> => {
    try {
        const response = await apiClient.post(`/api/tasks/creative/${id}/version`, versionData); // Changed 'versions' to 'version'
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error(`为创意任务(ID:${id})添加版本失败:`, error);
        throw error;
    }
};

// 为创意任务添加反馈
export const addFeedbackToCreativeTask = async (id: number, feedbackData: { userId: string; creativityRating: number; logicRating: number; comments?: string }): Promise<CreativeTask | null> => {
    try {
        const response = await apiClient.post(`/api/tasks/creative/${id}/feedback`, feedbackData);
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error(`为创意任务(ID:${id})添加反馈失败:`, error);
        throw error;
    }
};

// 更新步骤型任务的步骤信息
export const updateStepTaskSteps = async (id: number, steps: any[]): Promise<StepTask | null> => {
    try {
        // 确认任务ID有效
        if (!id || isNaN(id)) {
            throw new Error(`无效的任务ID: ${id}`);
        }

        // 确认steps是有效数组
        if (!Array.isArray(steps) || steps.length === 0) {
            throw new Error('步骤数据无效或为空');
        }

        console.log(`准备更新任务ID=${id}的步骤信息，共${steps.length}个步骤`);

        // 将steps数组转换为JSON字符串
        const stepsJson = JSON.stringify(steps);
        console.log(`步骤JSON(前200字符): ${stepsJson.substring(0, 200)}...`);

        // 检查授权令牌
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('警告: 尝试更新步骤但未找到授权令牌');
        }

        // 调用API更新步骤信息（添加超时设置和重试选项）
        // 根据后端日志，请求路径应为 /api/tasks/id/update-steps
        const apiPath = `/api/tasks/${id}/update-steps`;
        console.log(`发送PUT请求到 ${apiPath}`);

        const response = await apiClient.put(apiPath,
            { stepsJson },
            {
                timeout: 10000,  // 10秒超时
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`步骤更新响应状态: ${response.status}`);
        console.log('步骤更新响应数据:', response.data);

        if (response.data) {
            // 返回更新后的任务数据
            const responseData = response.data.data || response.data;
            console.log('更新成功，返回数据:', responseData);
            return responseData;
        }
        console.warn('API返回成功但没有数据');
        return null;
    } catch (error: any) {
        // 详细记录错误信息
        console.error(`更新任务(ID=${id})步骤失败:`, error.message || '未知错误');

        // 检查是否是网络错误
        if (error.code === 'ECONNABORTED') {
            console.error('请求超时，服务器可能无响应');
        }

        // 检查是否有HTTP错误响应
        if (error.response) {
            console.error(`HTTP错误状态: ${error.response.status}`);
            console.error('错误响应数据:', error.response.data);

            // 针对特定错误码给出更有用的信息
            switch (error.response.status) {
                case 401:
                    console.error('认证失败，请重新登录');
                    break;
                case 403:
                    console.error('权限不足，无法更新该任务的步骤');
                    break;
                case 404:
                    console.error(`任务ID=${id}不存在`);
                    break;
                case 400:
                    console.error('请求数据格式错误');
                    break;
            }
        }

        throw error;
    }
};

// 更新步骤状态
export const updateStepStatus = async (taskId: number, stepId: string, status: string): Promise<StepTask | null> => {
    try {
        console.log(`更新任务ID ${taskId} 中步骤 ${stepId} 的状态为 ${status}`);

        // 确保token存在
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('缺少认证令牌，无法更新任务步骤');
            throw new Error('认证令牌缺失，请重新登录');
        }

        // 首先获取当前任务信息
        const task = await getStepTaskById(taskId);
        if (!task || !task.steps) {
            console.error('任务不存在或没有步骤信息');
            return null;
        }

        console.log(`获取到任务详情:`, JSON.stringify(task, null, 2).substring(0, 200) + '...');

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

        console.log(`准备更新步骤信息: 任务ID=${taskId}, 总共${updatedSteps.length}个步骤`);

        // 直接尝试更新步骤状态（不通过单独的updateStep接口）
        try {
            // 调用API更新步骤信息
            const result = await updateStepTaskSteps(taskId, updatedSteps);
            console.log('步骤状态更新成功:', result);
            return result;
        } catch (updateError: any) {
            console.error(`直接更新步骤失败: ${updateError.message || '未知错误'}`);

            // 如果出错信息包含403，提示权限问题
            if (updateError.response && updateError.response.status === 403) {
                console.error('权限被拒绝(403)，可能需要重新登录或检查账号权限');
            }

            throw updateError;
        }
    } catch (error: any) {
        console.error(`更新步骤状态失败:`, error.message || error);
        // 添加更详细的错误日志
        if (error.response) {
            console.error(`HTTP错误状态: ${error.response.status}`);
            console.error(`错误响应数据:`, error.response.data);
        }
        throw error;
    }
};
