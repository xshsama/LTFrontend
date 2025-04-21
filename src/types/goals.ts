export type Weight = number;
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT';
export type GoalStatus = 'ONGOING' | 'COMPLETED' | 'EXPIRED' | 'NO_STARTED';
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type AchievementType = '目标' | '任务';

export interface Subject {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    subjectId: number;
}

export interface Goal {
    id: number;
    title: string;
    status: GoalStatus;
    completionDate?: string;
    priority: Priority;
    progress: number;
    createdAt: string;
    updatedAt: string;
    subjectId: number;
    categoryId?: number;
    tags?: string[]; // 添加标签属性
}

export interface Task {
    id: number;
    title: string;
    status: TaskStatus;
    completionDate?: string;
    weight: Weight;
    actualTimeMinutes: number;
    createdAt: string;
    updatedAt: string;
    goalId: number;
    tags: Tag[]; // 只有Task直接关联标签
}

export interface User {
    id: number;
    username: string;
    email?: string;
    isActive?: boolean;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Tag {
    id: number;
    name: string;
    color?: string;
    userId: number;
    user?: User;  // 添加可选的user属性
}

export interface Achievement {
    id: number;
    title: string;
    completionDate: string;
    type: AchievementType;
    relatedItemId: number;
    relatedItemTitle: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}
