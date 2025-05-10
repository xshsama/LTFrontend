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
    description?: string
    estimatedDuration?: number
}

export interface CompletionRule {
    type: 'MANUAL' | 'AUTO_CHECK' | 'FILE_UPLOAD'
    criteria?: {
        minDuration?: number
        requiredFiles?: string[]
    }
}

// Define types corresponding to backend HabitTask enums and DTOs
export type CheckinStatus = 'DONE' | 'SKIP' | 'PARTIAL';

export interface CheckInRecordDTO {
    date: string; // Assuming ISO date string from backend (LocalDate)
    status: CheckinStatus;
    notes?: string;
}

export interface HabitTaskDetailDTO {
    frequency?: string;
    daysOfWeek?: string; // JSON string
    customPattern?: string;
    currentStreak?: number;
    longestStreak?: number;
    lastCompleted?: string | null; // Assuming ISO date string or null from backend (LocalDate)
    checkInRecords?: CheckInRecordDTO[];
}

export interface HabitTask extends BaseTask {
    type: 'HABIT';
    // For nested structure (TaskDTO from backend)
    habitTaskDetail?: HabitTaskDetailDTO;

    // Optional top-level fields for flat structure (HabitTaskDTO from backend)
    // These mirror fields in HabitTaskDetailDTO and HabitTaskDTO.java
    frequency?: string;
    daysOfWeek?: string; // JSON string, matches HabitTaskDetailDTO and HabitTaskDTO.java
    customPattern?: string; // Matches HabitTaskDetailDTO and HabitTaskDTO.java
    currentStreak?: number; // Matches HabitTaskDetailDTO and HabitTaskDTO.java
    longestStreak?: number; // Matches HabitTaskDetailDTO and HabitTaskDTO.java
    lastCompleted?: string | null; // Matches HabitTaskDetailDTO (string | null for LocalDate)
    checkInRecords?: CheckInRecordDTO[]; // Matches HabitTaskDetailDTO and HabitTaskDTO.java
}

// DTOs for CreativeTask versions and feedback
export interface CreativeVersionDTO {
    versionId?: string; // Matches backend CreativeTask.Version.versionId (if it were a DTO field)
    timestamp?: string; // Matches backend CreativeTask.Version.timestamp (LocalDateTime becomes string)
    // Or CreativeTaskDTO.VersionDTO.createdAt (LocalDateTime becomes string)
    snapshot?: string;  // Matches both
    changes?: string[]; // Matches backend CreativeTask.Version.changes (List<String>)
    // Backend CreativeTaskDTO.VersionDTO.changes is 'string', this needs alignment if DTO is primary source.
    // Assuming entity's List<String> is more direct for 'versionsJson' content.
}

export interface CreativeFeedbackDTO {
    userId?: string; // Matches backend CreativeTask.Feedback.userId (if it were a DTO field)
    // Or CreativeTaskDTO.FeedbackDTO.userId (Integer, but string might be safer for frontend if user IDs can be non-numeric)
    // Let's assume string for flexibility, or align with backend DTO if strictly integer.
    creativityRating?: number; // Matches both
    logicRating?: number;    // Matches both
    comments?: string;       // Matches both
}

export interface CreativeTask extends BaseTask {
    type: 'CREATIVE'
    currentPhase: 'DRAFTING' | 'REVIEWING' | 'FINALIZING'
    publicationFormats?: string
    licenseType?: string
    validationScore?: number; // Added field
    versionsJson?: string     // Raw JSON from backend
    feedbacksJson?: string    // Raw JSON from backend
    versions?: CreativeVersionDTO[];   // Parsed versions
    feedbacks?: CreativeFeedbackDTO[]; // Parsed feedbacks
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
