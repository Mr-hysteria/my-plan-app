import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AiRecommendation } from "@/src/features/ai/ai-client";
import { getFocusDateKey } from "@/src/lib/dates";
import { createTaskId, PlanTask, TaskPriority, TaskStatus, TaskTag } from "@/src/features/tasks/types";

type AppSettings = {
  petName: string;
  aiProxyUrl: string;
};

type AppState = {
  tasks: PlanTask[];
  settings: AppSettings;
  lastRecommendation?: AiRecommendation;
  addTask: (title: string) => void;
  updateTask: (taskId: string, changes: Partial<PlanTask>) => void;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  completeTask: (taskId: string) => void;
  dropTask: (taskId: string) => void;
  togglePinForToday: (taskId: string) => void;
      applyAiInsights: (
        insights: {
          taskId: string;
          score: number;
          reason: string;
        }[],
      ) => void;
  setLastRecommendation: (recommendation?: AiRecommendation) => void;
  setPetName: (name: string) => void;
  setAiProxyUrl: (url: string) => void;
  pruneDroppedTasks: () => void;
};

const DEFAULT_PROXY_URL = process.env.EXPO_PUBLIC_AI_PROXY_URL ?? "http://localhost:8787";

function buildTask(title: string): PlanTask {
  const now = new Date().toISOString();
  return {
    id: createTaskId(),
    title: title.trim(),
    priority: "medium",
    tag: "work",
    status: "backlog",
    createdAt: now,
    updatedAt: now,
  };
}

function updateTaskCollection(
  tasks: PlanTask[],
  taskId: string,
  updater: (task: PlanTask) => PlanTask,
): PlanTask[] {
  return tasks.map((task) => (task.id === taskId ? updater(task) : task));
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      settings: {
        petName: "阿柴",
        aiProxyUrl: DEFAULT_PROXY_URL,
      },
      lastRecommendation: undefined,
      addTask: (title) =>
        set((state) => {
          const normalized = title.trim();
          if (!normalized) {
            return state;
          }
          return {
            tasks: [buildTask(normalized), ...state.tasks],
          };
        }),
      updateTask: (taskId, changes) =>
        set((state) => ({
          tasks: updateTaskCollection(state.tasks, taskId, (task) => ({
            ...task,
            ...sanitizeTaskChanges(changes, task),
            updatedAt: new Date().toISOString(),
          })),
        })),
      setTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: updateTaskCollection(state.tasks, taskId, (task) => ({
            ...task,
            status,
            completedAt: status === "done" ? new Date().toISOString() : undefined,
            pinnedForDate: status === "done" || status === "dropped" ? undefined : task.pinnedForDate,
            updatedAt: new Date().toISOString(),
          })),
        })),
      completeTask: (taskId) =>
        set((state) => ({
          tasks: updateTaskCollection(state.tasks, taskId, (task) => ({
            ...task,
            status: "done",
            completedAt: new Date().toISOString(),
            pinnedForDate: undefined,
            updatedAt: new Date().toISOString(),
          })),
        })),
      dropTask: (taskId) =>
        set((state) => ({
          tasks: updateTaskCollection(state.tasks, taskId, (task) => ({
            ...task,
            status: "dropped",
            pinnedForDate: undefined,
            updatedAt: new Date().toISOString(),
          })),
        })),
      togglePinForToday: (taskId) =>
        set((state) => {
          const focusDate = getFocusDateKey();
          return {
            tasks: updateTaskCollection(state.tasks, taskId, (task) => ({
              ...task,
              pinnedForDate: task.pinnedForDate === focusDate ? undefined : focusDate,
              updatedAt: new Date().toISOString(),
            })),
          };
        }),
      applyAiInsights: (insights) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            const insight = insights.find((item) => item.taskId === task.id);
            if (!insight) {
              return task;
            }
            return {
              ...task,
              aiScore: insight.score,
              aiReason: insight.reason,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),
      setLastRecommendation: (lastRecommendation) => set({ lastRecommendation }),
      setPetName: (petName) =>
        set((state) => ({
          settings: {
            ...state.settings,
            petName: petName.trim() || "阿柴",
          },
        })),
      setAiProxyUrl: (aiProxyUrl) =>
        set((state) => ({
          settings: {
            ...state.settings,
            aiProxyUrl: aiProxyUrl.trim(),
          },
        })),
      pruneDroppedTasks: () =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.status !== "dropped"),
        })),
    }),
    {
      name: "my-plan-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        settings: state.settings,
        lastRecommendation: state.lastRecommendation,
      }),
    },
  ),
);

function sanitizeTaskChanges(changes: Partial<PlanTask>, task: PlanTask): Partial<PlanTask> {
  const nextPriority = isTaskPriority(changes.priority) ? changes.priority : task.priority;
  const nextTag = isTaskTag(changes.tag) ? changes.tag : task.tag;
  const nextStatus = isTaskStatus(changes.status) ? changes.status : task.status;
  const completedAt =
    nextStatus === "done"
      ? task.completedAt ?? new Date().toISOString()
      : changes.completedAt ?? undefined;

  return {
    title: changes.title?.trim() || task.title,
    note: changes.note?.trim() || undefined,
    dueDate: changes.dueDate,
    priority: nextPriority,
    tag: nextTag,
    status: nextStatus,
    aiScore: changes.aiScore ?? task.aiScore,
    aiReason: changes.aiReason ?? task.aiReason,
    pinnedForDate:
      nextStatus === "done" || nextStatus === "dropped" ? undefined : changes.pinnedForDate ?? task.pinnedForDate,
    completedAt,
  };
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === "low" || value === "medium" || value === "high";
}

function isTaskTag(value: unknown): value is TaskTag {
  return value === "work" || value === "study" || value === "life" || value === "sideProject";
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "backlog" || value === "in_progress" || value === "done" || value === "dropped";
}
