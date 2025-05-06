import { Tag } from '../types/tag'
import { Goal } from './goals'

export interface BaseTask {
    id: number
    title: string
    status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'OVERDUE'
    type: 'STEP' | 'HABIT' | 'CREATIVE'
    completionDate?: Date
    createdAt: Date
    updatedAt: Date
    goalId: number
    goal?: Goal
    tags: Tag[]
    metadata?: string
    // 元数据解析的常用字段，实际存储在metadata中
    actualTimeMinutes?: number
    estimatedTimeMinutes?: number
    priority?: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface StepTaskDetailDTO {
    completedSteps: number
    blockedSteps: number
    steps?: StepDTO[]
}

export interface StepDTO {
    id: string
    title: string
    description?: string
    status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'
    order?: number
    validationScore?: number
    asTodoList?: boolean
    todoItems?: TodoItem[]
}

export interface StepTask extends BaseTask {
    type: 'STEP'
    completedSteps: number
    blockedSteps: number
    validationScore?: number
    stepsJson?: string
    steps?: Step[]
    stepTaskDetail?: StepTaskDetailDTO // 添加后端返回的详情字段
}

export interface Step {
    id: string
    title: string
    order?: number
    dependencies?: string[]
    status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'
    completionRules?: CompletionRule
    completed?: boolean
    completedAt?: Date
    asTodoList?: boolean
    todoItems?: TodoItem[]
    description?: string
    estimatedDuration?: number
}

export interface TodoItem {
    id: string
    content: string
    completed: boolean
    createdAt?: Date
    completedAt?: Date
    priority?: number // 0-低，1-中，2-高
    notes?: string
}

export interface CompletionRule {
    type: 'MANUAL' | 'AUTO_CHECK' | 'FILE_UPLOAD'
    criteria?: {
        minDuration?: number
        requiredFiles?: string[]
    }
}

export interface HabitTask extends BaseTask {
    type: 'HABIT'
    frequency: string
    daysOfWeek?: string
    currentStreak?: number
    longestStreak?: number
    lastCompleted?: Date
    checkinsJson?: string
}

export interface CreativeTask extends BaseTask {
    type: 'CREATIVE'
    currentPhase: 'DRAFTING' | 'REVIEWING' | 'FINALIZING'
    publicationFormats?: string
    licenseType?: string
    versionsJson?: string
    feedbacksJson?: string
}

export type Task = StepTask | HabitTask | CreativeTask

// 用于创建任务的请求类型
export interface CreateTaskRequest {
    title: string
    type: 'STEP' | 'HABIT' | 'CREATIVE'
    goalId: number
    tagIds?: number[]
    metadata?: string

    // 步骤型任务特有字段
    stepsJson?: string

    // 习惯型任务特有字段
    frequency?: string
    daysOfWeekJson?: string
    customPattern?: string

    // 创意型任务特有字段
    publicationFormats?: string
    licenseType?: string
}

// 用于更新任务的请求类型
export interface UpdateTaskRequest {
    title?: string
    status?: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED'
    completionDate?: Date
    tagIds?: number[]
    metadata?: string

    // 步骤型任务特有字段
    stepsJson?: string
    completedSteps?: number
    blockedSteps?: number

    // 习惯型任务特有字段
    frequency?: string
    daysOfWeekJson?: string
    customPattern?: string
    checkinsJson?: string

    // 创意型任务特有字段
    versionsJson?: string
    feedbacksJson?: string
    currentPhase?: 'DRAFTING' | 'REVIEWING' | 'FINALIZING'
    publicationFormats?: string
    licenseType?: string
}

// 更新任务状态请求
export interface UpdateStatusRequest {
    status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'OVERDUE'
}

// 步骤型任务特有 - 更新步骤状态请求
export interface UpdateStepStatusRequest {
    stepId: string
    status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'
}

// 习惯型任务特有 - 添加打卡记录请求
export interface AddCheckinRequest {
    date: string // YYYY-MM-DD格式
    status: 'DONE' | 'SKIP' | 'PARTIAL'
    notes?: string
}

// 创意型任务特有 - 更新创意任务阶段请求
export interface UpdateCreativePhaseRequest {
    phase: 'DRAFTING' | 'REVIEWING' | 'FINALIZING'
}

// 创意型任务特有 - 添加版本请求
export interface AddVersionRequest {
    snapshot: string // 内容快照或存储路径
    changes: string[] // 变更描述
}

// 创意型任务特有 - 添加反馈请求
export interface AddFeedbackRequest {
    userId: string
    creativityRating: number // 1-5
    logicRating: number // 1-5
    comments?: string
}
