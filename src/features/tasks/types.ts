export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export const TASK_TAGS = ["work", "study", "life", "sideProject"] as const;
export const TASK_STATUSES = ["backlog", "in_progress", "done", "dropped"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskTag = (typeof TASK_TAGS)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type PlanTask = {
  id: string;
  title: string;
  priority: TaskPriority;
  tag: TaskTag;
  status: TaskStatus;
  note?: string;
  dueDate?: string;
  aiScore?: number;
  aiReason?: string;
  pinnedForDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export const TAG_LABELS: Record<TaskTag, string> = {
  work: "工作",
  study: "学习",
  life: "生活",
  sideProject: "侧线项目",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "待开始",
  in_progress: "进行中",
  done: "已完成",
  dropped: "已放弃",
};

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  low: 1,
  medium: 3,
  high: 5,
};

export function createTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
