import { Goal } from './goals'

export interface Task {
    id: number
    title: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED'
    completionDate?: Date
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    type: 'STEP' | 'HABIT' | 'CREATIVE'
    studyHours: number
    weight: number
    actualTimeMinutes?: number
    createdAt: Date
    updatedAt: Date
    goalId: number
    goal?: Goal
}
