export interface Goal {
    id: number
    title: string
    description?: string
    targetDate?: Date
    status: 'ONGOING' | 'COMPLETED' | 'EXPIRED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    progress?: number
    subjectId?: number
    tags?: Tag[]
    createdAt: Date
    updatedAt: Date
}

export interface Task {
    id: number
    title: string
    weight: number
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED'
    type: 'STEP' | 'HABIT' | 'CREATIVE'
    completionDate?: Date
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    studyHours: number
    actualTimeMinutes?: number
    goalId: number
    tags?: Tag[]
    createdAt: Date
    updatedAt: Date
}

export interface Achievement {
    id: number
    title: string
    completionDate: Date
    type: string
    relatedItemId: number
    relatedItemTitle: string
    description: string
    createdAt: Date
    updatedAt: Date
}

export interface Tag {
    id: number
    title: string
    color: string
    userId: number
    user?: {
        id: number
        username: string
    }
}

export interface Subject {
    id: number
    title: string
    description?: string
    createdAt: Date
    updatedAt: Date
}

export interface Category {
    id: number
    name: string
    description?: string
    subjectId?: number
    createdAt: Date
    updatedAt: Date
}

export type GoalStatus = 'ONGOING' | 'COMPLETED' | 'EXPIRED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
