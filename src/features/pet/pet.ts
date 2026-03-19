import { PlanTask, PRIORITY_WEIGHT } from "@/src/features/tasks/types";

type PetMood = "excited" | "steady" | "encouraging";

const LEVEL_XP = 120;

const QUOTES: Record<PetMood, string[]> = {
  excited: [
    "今天状态很好，我们继续把势能滚起来。",
    "你在稳稳推进长期目标，我已经开始摇尾巴了。",
    "节奏很棒，优先把最值钱的一件事做完。",
  ],
  steady: [
    "进度在走，别贪多，先把今日聚焦收掉。",
    "把一件高价值任务做完，今天就已经赢了。",
    "保持稳定比爆发更重要，我们继续。",
  ],
  encouraging: [
    "先别焦虑，挑一件最小可执行的任务开始。",
    "你不需要一次解决全部问题，先推进 15 分钟就好。",
    "哪怕只完成一件，也是在把计划重新拉回正轨。",
  ],
};

export function getTaskXp(task: PlanTask): number {
  if (task.status !== "done") {
    return 0;
  }

  return Math.round(10 * PRIORITY_WEIGHT[task.priority] + (task.aiScore ?? 0) * 0.2);
}

export function getPetSummary(tasks: PlanTask[]) {
  const completedTasks = tasks.filter((task) => task.status === "done");
  const activeTasks = tasks.filter(
    (task) => task.status === "backlog" || task.status === "in_progress",
  );
  const totalXp = completedTasks.reduce((sum, task) => sum + getTaskXp(task), 0);
  const level = Math.min(100, Math.floor(totalXp / LEVEL_XP) + 1);
  const xpIntoLevel = totalXp % LEVEL_XP;
  const completionRate = tasks.length === 0 ? 0 : completedTasks.length / tasks.length;

  let mood: PetMood = "steady";
  if (completionRate >= 0.45) {
    mood = "excited";
  } else if (completionRate < 0.2 || activeTasks.length > completedTasks.length + 3) {
    mood = "encouraging";
  }

  const quoteList = QUOTES[mood];
  const quote = quoteList[totalXp % quoteList.length];

  return {
    totalXp,
    level,
    xpIntoLevel,
    xpNeeded: LEVEL_XP,
    completionRate,
    mood,
    quote,
    accessory:
      level >= 20 ? "星星披风" : level >= 10 ? "护目镜" : level >= 5 ? "蓝色围巾" : "新手项圈",
  };
}
