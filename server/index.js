const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");

dotenv.config({ path: process.env.SERVER_ENV_PATH || "server/.env" });

const app = express();
const port = Number(process.env.PORT || 8787);
const glmApiUrl =
  process.env.GLM_API_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const glmModel = process.env.GLM_MODEL || "glm-5";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    model: glmModel,
  });
});

app.post("/api/analyze", async (request, response) => {
  try {
    ensureApiKey();
    const tasks = normalizeTasks(request.body?.tasks);
    const result = await callGlm([
      {
        role: "system",
        content:
          "你是一个擅长给个人任务做价值排序的计划顾问。你必须只输出 JSON，不要附带 markdown、解释或代码块。",
      },
      {
        role: "user",
        content: [
          "请根据任务标题、优先级、标签、截止日期和备注，输出每个任务的价值分和一句中文理由。",
          "分数范围 1-100，越高越值得优先推进。",
          '请严格返回 JSON，格式为：{"results":[{"taskId":"任务ID","score":90,"reason":"一句话理由"}]}',
          `任务列表：${JSON.stringify(tasks)}`,
        ].join("\n"),
      },
    ]);

    const parsed = parseJsonPayload(result);
    const results = Array.isArray(parsed.results)
      ? parsed.results
          .filter((item) => typeof item.taskId === "string")
          .map((item) => ({
            taskId: item.taskId,
            score: clampScore(Number(item.score)),
            reason: String(item.reason || "这项任务对长期目标更关键。"),
          }))
      : [];

    response.json({ results });
  } catch (error) {
    response.status(500).json({ error: toErrorMessage(error) });
  }
});

app.post("/api/recommend", async (request, response) => {
  try {
    ensureApiKey();
    const tasks = normalizeTasks(request.body?.tasks);
    const result = await callGlm([
      {
        role: "system",
        content:
          "你是一个极简行动教练。请从任务列表里选出当前最值得做的一件事，并只输出 JSON。",
      },
      {
        role: "user",
        content: [
          "请从任务列表中选出现在最推荐做的一件事，并说明原因。",
          '严格返回 JSON，格式为：{"taskId":"任务ID","title":"任务标题","reason":"一句中文理由"}',
          `任务列表：${JSON.stringify(tasks)}`,
        ].join("\n"),
      },
    ]);

    const parsed = parseJsonPayload(result);
    response.json({
      taskId: typeof parsed.taskId === "string" ? parsed.taskId : undefined,
      title: typeof parsed.title === "string" ? parsed.title : undefined,
      reason: typeof parsed.reason === "string" ? parsed.reason : "优先做最接近截止且影响最大的任务。",
    });
  } catch (error) {
    response.status(500).json({ error: toErrorMessage(error) });
  }
});

app.listen(port, () => {
  console.log(`AI proxy server listening on http://localhost:${port}`);
});

async function callGlm(messages) {
  const requestBody = {
    model: glmModel,
    messages,
    stream: false,
    temperature: 0.4,
  };

  const response = await fetch(glmApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GLM 请求失败：${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("GLM 返回格式异常");
  }
  return content;
}

function parseJsonPayload(content) {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("无法从 GLM 响应中解析 JSON");
    }
    return JSON.parse(candidate.slice(start, end + 1));
  }
}

function normalizeTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error("请至少传入一条任务");
  }

  return tasks.map((task) => ({
    id: String(task.id || ""),
    title: String(task.title || ""),
    priority: String(task.priority || "medium"),
    tag: String(task.tag || "work"),
    status: String(task.status || "backlog"),
    dueDate: task.dueDate ? String(task.dueDate) : undefined,
    note: task.note ? String(task.note) : undefined,
    aiScore: typeof task.aiScore === "number" ? task.aiScore : undefined,
  }));
}

function ensureApiKey() {
  if (!process.env.GLM_API_KEY) {
    throw new Error("服务端未配置 GLM_API_KEY，请先在 server/.env 中填写。");
  }
}

function clampScore(value) {
  if (Number.isNaN(value)) {
    return 50;
  }
  return Math.max(1, Math.min(100, Math.round(value)));
}

function toErrorMessage(error) {
  return error instanceof Error ? error.message : "服务器内部错误";
}
