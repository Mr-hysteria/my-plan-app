import { PlanTask } from "@/src/features/tasks/types";

export type AiTaskInsight = {
  taskId: string;
  score: number;
  reason: string;
};

export type AiRecommendation = {
  taskId?: string;
  title?: string;
  reason: string;
};

function normalizeProxyUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

function toTaskPayload(tasks: PlanTask[]) {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    tag: task.tag,
    status: task.status,
    dueDate: task.dueDate,
    note: task.note,
    aiScore: task.aiScore,
  }));
}

async function requestJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && typeof data.error === "string" ? data.error : "请求失败";
    throw new Error(message);
  }

  return data as T;
}

export async function analyzeTasks(proxyUrl: string, tasks: PlanTask[]): Promise<AiTaskInsight[]> {
  const baseUrl = normalizeProxyUrl(proxyUrl);
  if (!baseUrl) {
    throw new Error("请先在设置页填写 AI 中转服务地址");
  }

  const response = await requestJson<{ results: AiTaskInsight[] }>(`${baseUrl}/api/analyze`, {
    tasks: toTaskPayload(tasks),
  });

  return response.results ?? [];
}

export async function recommendNextTask(
  proxyUrl: string,
  tasks: PlanTask[],
): Promise<AiRecommendation> {
  const baseUrl = normalizeProxyUrl(proxyUrl);
  if (!baseUrl) {
    throw new Error("请先在设置页填写 AI 中转服务地址");
  }

  return requestJson<AiRecommendation>(`${baseUrl}/api/recommend`, {
    tasks: toTaskPayload(tasks),
  });
}
