export type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT';
export type GoalStatus = 'ONGOING' | 'COMPLETED' | 'EXPIRED' | 'NO_STARTED';
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type AchievementType = '目标' | '任务';

export interface Subject {
    id: number;
    title: string;
    description?: string;
    imageUrl?: string;
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
    deadline?: string;
    status: GoalStatus;
    completionDate?: string;
    priority: Priority;
    progress: number;
    expectedHours?: number;
    actualHours: number;
    createdAt: string;
    updatedAt: string;
    subjectId: number;
    categoryId?: number;
    // 标签会从关联的任务中获取，而不是直接存储
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    dueDate?: string;
    status: TaskStatus;
    completionDate?: string;
    priority: Priority;
    estimatedTimeMinutes?: number;
    actualTimeMinutes: number;
    createdAt: string;
    updatedAt: string;
    goalId: number;
    tags: Tag[]; // 只有Task直接关联标签
}

export interface Tag {
    id: number;
    name: string;
    color?: string;
    userId: number;
}

export interface Achievement {
    id: number;
    title: string;
    completionDate: string;
    type: AchievementType;
    relatedItemId: number;
    relatedItemTitle: string;
    points: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}