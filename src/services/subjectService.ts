import apiService from './apiService';

const API_URL = '/api/subjects';

// 获取当前用户的所有学科
export const getUserSubjects = async () => {
    return apiService.get(API_URL);
};

// 获取特定学科详情
export const getSubject = async (id: number) => {
    return apiService.get(`${API_URL}/${id}`);
};

// 获取所有分类
export const getCategories = async () => {
    return apiService.get('/api/categories');
};

// 获取所有标签 
export const getTags = async () => {
    return apiService.get('/api/tags');
};

// 创建新学科
export const createSubject = async (subjectData: {
    title: string;
    description?: string;
    tags?: string[];
    categoryId?: number;
}) => {
    return apiService.post(API_URL, subjectData);
};

// 更新学科
export const updateSubject = async (id: number, subjectData: {
    title: string;
    description?: string;
    tags?: string[];
    categoryId?: number;
}) => {
    return apiService.put(`${API_URL}/${id}`, subjectData);
};

// 删除学科
export const deleteSubject = async (id: number) => {
    return apiService.delete(`${API_URL}/${id}`);
};
