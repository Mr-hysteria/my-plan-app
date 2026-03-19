import { getFocusDateKey, toDateKey } from "@/src/lib/dates";

import { PlanTask, TaskPriority } from "./types";

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function sortTasksForFocus(tasks: PlanTask[]): PlanTask[] {
  return [...tasks].sort((left, right) => {
    const leftPinned = left.pinnedForDate ? 1 : 0;
    const rightPinned = right.pinnedForDate ? 1 : 0;
    if (leftPinned !== rightPinned) {
      return rightPinned - leftPinned;
    }

    const priorityDiff = PRIORITY_ORDER[right.priority] - PRIORITY_ORDER[left.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const aiDiff = (right.aiScore ?? 0) - (left.aiScore ?? 0);
    if (aiDiff !== 0) {
      return aiDiff;
    }

    const leftDue = left.dueDate ?? "9999-12-31";
    const rightDue = right.dueDate ?? "9999-12-31";
    if (leftDue !== rightDue) {
      return leftDue.localeCompare(rightDue);
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function selectDailyFocus(
  tasks: PlanTask[],
  focusDateKey = getFocusDateKey(),
  count = 5,
): PlanTask[] {
  const candidates = tasks.filter(
    (task) => task.status === "backlog" || task.status === "in_progress",
  );
  const pinned = sortTasksForFocus(
    candidates.filter((task) => task.pinnedForDate === focusDateKey),
  );
  const pinnedIds = new Set(pinned.map((task) => task.id));
  const autoSelected = sortTasksForFocus(candidates.filter((task) => !pinnedIds.has(task.id)));

  return [...pinned, ...autoSelected].slice(0, count);
}

export function selectPoolTasks(tasks: PlanTask[], focusDateKey = getFocusDateKey()): PlanTask[] {
  const focusIds = new Set(selectDailyFocus(tasks, focusDateKey).map((task) => task.id));
  return sortTasksForFocus(
    tasks.filter((task) => {
      if (task.status !== "backlog" && task.status !== "in_progress") {
        return false;
      }
      return !focusIds.has(task.id);
    }),
  );
}

export function selectRecentlyCompleted(tasks: PlanTask[], limit = 6): PlanTask[] {
  return [...tasks]
    .filter((task) => task.status === "done")
    .sort((left, right) => (right.completedAt ?? "").localeCompare(left.completedAt ?? ""))
    .slice(0, limit);
}

export function selectTasksForDate(tasks: PlanTask[], dateKey: string): {
  due: PlanTask[];
  completed: PlanTask[];
  pinned: PlanTask[];
} {
  const due = sortTasksForFocus(tasks.filter((task) => task.dueDate === dateKey));
  const completed = [...tasks]
    .filter((task) => task.completedAt && toDateKey(task.completedAt) === dateKey)
    .sort((left, right) => (right.completedAt ?? "").localeCompare(left.completedAt ?? ""));
  const pinned = sortTasksForFocus(tasks.filter((task) => task.pinnedForDate === dateKey));

  return { due, completed, pinned };
}

export function buildCalendarMarks(tasks: PlanTask[], selectedDate: string) {
  return tasks.reduce<Record<string, { dots: { key: string; color: string }[]; selected?: boolean; selectedColor?: string }>>(
    (accumulator, task) => {
      if (task.dueDate) {
        const current = accumulator[task.dueDate] ?? { dots: [] };
        if (!current.dots.some((dot) => dot.key === "due")) {
          current.dots.push({ key: "due", color: "#F59E0B" });
        }
        accumulator[task.dueDate] = current;
      }

      if (task.completedAt) {
        const completedDate = toDateKey(task.completedAt);
        const current = accumulator[completedDate] ?? { dots: [] };
        if (!current.dots.some((dot) => dot.key === "done")) {
          current.dots.push({ key: "done", color: "#10B981" });
        }
        accumulator[completedDate] = current;
      }

      if (task.pinnedForDate) {
        const current = accumulator[task.pinnedForDate] ?? { dots: [] };
        if (!current.dots.some((dot) => dot.key === "focus")) {
          current.dots.push({ key: "focus", color: "#3B82F6" });
        }
        accumulator[task.pinnedForDate] = current;
      }

      return accumulator;
    },
    {
      [selectedDate]: {
        dots: [],
        selected: true,
        selectedColor: "#2563EB",
      },
    },
  );
}

export function selectTaskCounts(tasks: PlanTask[]) {
  const active = tasks.filter((task) => task.status === "backlog" || task.status === "in_progress").length;
  const done = tasks.filter((task) => task.status === "done").length;
  const dropped = tasks.filter((task) => task.status === "dropped").length;

  return {
    active,
    done,
    dropped,
    total: tasks.length,
  };
}
