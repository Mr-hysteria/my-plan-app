import * as Haptics from "expo-haptics";
import ConfettiCannon from "react-native-confetti-cannon";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { FlashEntry } from "@/src/components/FlashEntry";
import { Screen } from "@/src/components/Screen";
import { SectionCard } from "@/src/components/SectionCard";
import { TaskCard } from "@/src/components/TaskCard";
import { TaskEditorModal } from "@/src/components/TaskEditorModal";
import { analyzeTasks, recommendNextTask } from "@/src/features/ai/ai-client";
import {
  selectDailyFocus,
  selectPoolTasks,
  selectRecentlyCompleted,
  selectTaskCounts,
} from "@/src/features/tasks/selectors";
import { PlanTask } from "@/src/features/tasks/types";
import { getFocusDateKey } from "@/src/lib/dates";
import { getTheme } from "@/src/lib/theme";
import { useAppStore } from "@/src/store/useAppStore";

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const tasks = useAppStore((state) => state.tasks);
  const settings = useAppStore((state) => state.settings);
  const lastRecommendation = useAppStore((state) => state.lastRecommendation);
  const addTask = useAppStore((state) => state.addTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const setTaskStatus = useAppStore((state) => state.setTaskStatus);
  const completeTask = useAppStore((state) => state.completeTask);
  const dropTask = useAppStore((state) => state.dropTask);
  const togglePinForToday = useAppStore((state) => state.togglePinForToday);
  const applyAiInsights = useAppStore((state) => state.applyAiInsights);
  const setLastRecommendation = useAppStore((state) => state.setLastRecommendation);

  const focusDateKey = getFocusDateKey();
  const [selectedTask, setSelectedTask] = useState<PlanTask | undefined>();
  const [analyzing, setAnalyzing] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [confettiTick, setConfettiTick] = useState(0);

  const dailyFocus = useMemo(() => selectDailyFocus(tasks, focusDateKey), [focusDateKey, tasks]);
  const poolTasks = useMemo(() => selectPoolTasks(tasks, focusDateKey), [focusDateKey, tasks]);
  const recentCompleted = useMemo(() => selectRecentlyCompleted(tasks), [tasks]);
  const counts = useMemo(() => selectTaskCounts(tasks), [tasks]);

  const handleComplete = async (taskId: string) => {
    completeTask(taskId);
    setConfettiTick((value) => value + 1);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore haptics failures on unsupported platforms
    }
  };

  const handleDrop = async (taskId: string) => {
    dropTask(taskId);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // ignore haptics failures on unsupported platforms
    }
  };

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status === "backlog" || task.status === "in_progress"),
    [tasks],
  );

  const handleAnalyze = async () => {
    if (activeTasks.length === 0) {
      Alert.alert("没有可分析的任务", "先录入一些未完成任务，再让 AI 排优先级。");
      return;
    }

    setAnalyzing(true);
    try {
      const results = await analyzeTasks(settings.aiProxyUrl, activeTasks);
      applyAiInsights(results);
      Alert.alert("AI 分析完成", `已更新 ${results.length} 条任务的价值分与建议。`);
    } catch (error) {
      Alert.alert("AI 分析失败", error instanceof Error ? error.message : "请检查中转服务是否可用。");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRecommend = async () => {
    if (activeTasks.length === 0) {
      Alert.alert("暂无推荐内容", "当前没有未完成任务。");
      return;
    }

    setRecommending(true);
    try {
      const recommendation = await recommendNextTask(settings.aiProxyUrl, activeTasks);
      setLastRecommendation(recommendation);
    } catch (error) {
      Alert.alert("获取推荐失败", error instanceof Error ? error.message : "请检查网络或代理地址。");
    } finally {
      setRecommending(false);
    }
  };

  return (
    <Screen theme={theme}>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: theme.text }]}>个人 AI 计划助手</Text>
        <Text style={[styles.subtitle, { color: theme.textSoft }]}>
          先记下来，再交给 AI 帮你看轻重缓急。今日聚焦会在凌晨 4 点自动滚动刷新。
        </Text>
      </View>

      <FlashEntry onSubmit={addTask} theme={theme} />

      <SectionCard
        rightSlot={
          <View style={styles.actionRow}>
            <TopActionButton
              disabled={analyzing}
              label={analyzing ? "分析中..." : "价值分析"}
              onPress={handleAnalyze}
              theme={theme}
            />
            <TopActionButton
              disabled={recommending}
              label={recommending ? "思考中..." : "下一步"}
              onPress={handleRecommend}
              theme={theme}
            />
          </View>
        }
        subtitle={`活跃 ${counts.active} · 完成 ${counts.done} · 放弃 ${counts.dropped}`}
        theme={theme}
        title="今日聚焦"
      >
        {dailyFocus.length === 0 ? (
          <EmptyText theme={theme} text="今天还没有聚焦任务，先在上方录入一条吧。" />
        ) : (
          dailyFocus.map((task) => (
            <TaskCard
              key={task.id}
              onComplete={() => handleComplete(task.id)}
              onDrop={() => handleDrop(task.id)}
              onEdit={() => setSelectedTask(task)}
              onStart={() => setTaskStatus(task.id, "in_progress")}
              onTogglePin={() => togglePinForToday(task.id)}
              pinnedToday={task.pinnedForDate === focusDateKey}
              task={task}
              theme={theme}
            />
          ))
        )}
      </SectionCard>

      {lastRecommendation ? (
        <SectionCard subtitle="AI 基于标题、优先级、截止时间和上下文给出的即时建议。" theme={theme} title="现在最值得做">
          <Text style={[styles.recommendTitle, { color: theme.text }]}>
            {lastRecommendation.title ?? "聚焦最高价值任务"}
          </Text>
          <Text style={[styles.recommendBody, { color: theme.textMuted }]}>{lastRecommendation.reason}</Text>
        </SectionCard>
      ) : null}

      <SectionCard subtitle="长按任务进入详细编辑，左滑放弃，右滑完成。" theme={theme} title="任务池">
        {poolTasks.length === 0 ? (
          <EmptyText theme={theme} text="任务池很干净，继续保持。" />
        ) : (
          poolTasks.map((task) => (
            <TaskCard
              key={task.id}
              onComplete={() => handleComplete(task.id)}
              onDrop={() => handleDrop(task.id)}
              onEdit={() => setSelectedTask(task)}
              onStart={() => setTaskStatus(task.id, "in_progress")}
              onTogglePin={() => togglePinForToday(task.id)}
              pinnedToday={task.pinnedForDate === focusDateKey}
              task={task}
              theme={theme}
            />
          ))
        )}
      </SectionCard>

      <SectionCard subtitle="完成会结算 XP，并影响宠物状态。" theme={theme} title="最近完成">
        {recentCompleted.length === 0 ? (
          <EmptyText theme={theme} text="完成一条任务后，这里会留下你的成就回溯。" />
        ) : (
          recentCompleted.map((task) => (
            <View
              key={task.id}
              style={[styles.completedRow, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
            >
              <Text style={[styles.completedTitle, { color: theme.text }]}>{task.title}</Text>
              <Text style={[styles.completedMeta, { color: theme.textSoft }]}>
                {task.aiScore ? `AI ${task.aiScore}` : "未评分"} · {task.completedAt?.slice(0, 10)}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <TaskEditorModal
        onClose={() => setSelectedTask(undefined)}
        onSave={(changes) => {
          if (!selectedTask) {
            return;
          }
          updateTask(selectedTask.id, changes);
        }}
        task={selectedTask}
        theme={theme}
        visible={Boolean(selectedTask)}
      />

      {confettiTick > 0 ? <ConfettiCannon count={64} fadeOut key={confettiTick} origin={{ x: 200, y: 0 }} /> : null}
    </Screen>
  );
}

function TopActionButton({
  label,
  onPress,
  theme,
  disabled,
}: {
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof getTheme>;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.topActionButton,
        {
          backgroundColor: disabled ? theme.border : theme.primarySoft,
        },
      ]}
    >
      <Text style={[styles.topActionText, { color: disabled ? theme.textSoft : theme.primary }]}>{label}</Text>
    </Pressable>
  );
}

function EmptyText({ text, theme }: { text: string; theme: ReturnType<typeof getTheme> }) {
  return <Text style={[styles.emptyText, { color: theme.textSoft }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  hero: {
    gap: 6,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  topActionButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  topActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  recommendTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  recommendBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  completedRow: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  completedMeta: {
    fontSize: 12,
  },
});
