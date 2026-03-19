import { useMemo } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { SectionCard } from "@/src/components/SectionCard";
import { getPetSummary } from "@/src/features/pet/pet";
import { selectTaskCounts } from "@/src/features/tasks/selectors";
import { getTheme } from "@/src/lib/theme";
import { useAppStore } from "@/src/store/useAppStore";

const MOOD_LABELS = {
  excited: "兴奋",
  steady: "平稳",
  encouraging: "鼓励中",
} as const;

const MOOD_EMOJIS = {
  excited: "🐕",
  steady: "🐶",
  encouraging: "🥺",
} as const;

export default function PetScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const tasks = useAppStore((state) => state.tasks);
  const petName = useAppStore((state) => state.settings.petName);
  const summary = useMemo(() => getPetSummary(tasks), [tasks]);
  const counts = useMemo(() => selectTaskCounts(tasks), [tasks]);

  return (
    <Screen theme={theme}>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: theme.text }]}>{petName} 的养成面板</Text>
        <Text style={[styles.subtitle, { color: theme.textSoft }]}>
          完成高优先级、高价值任务会更快升级。放弃不会扣分，但会让宠物变得有点失落。
        </Text>
      </View>

      <SectionCard subtitle={`当前心情：${MOOD_LABELS[summary.mood]}`} theme={theme} title="AI Pet">
        <View style={[styles.petCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
          <View style={styles.petVisual}>
            <Text style={styles.petEmoji}>{MOOD_EMOJIS[summary.mood]}</Text>
          </View>
          <View style={styles.petMeta}>
            <Text style={[styles.petName, { color: theme.text }]}>{petName}</Text>
            <Text style={[styles.petAccessory, { color: theme.textMuted }]}>
              当前装备：{summary.accessory}
            </Text>
            <Text style={[styles.petQuote, { color: theme.text }]}>“{summary.quote}”</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard subtitle="每完成一条任务就会累积经验值" theme={theme} title="等级与 XP">
        <View style={styles.metricGrid}>
          <MetricCard label="等级" theme={theme} value={`Lv.${summary.level}`} />
          <MetricCard label="总经验" theme={theme} value={`${summary.totalXp} XP`} />
          <MetricCard
            label="完成率"
            theme={theme}
            value={`${Math.round(summary.completionRate * 100)}%`}
          />
          <MetricCard label="活跃任务" theme={theme} value={`${counts.active}`} />
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.surfaceMuted }]}>
          <View
            style={[
              styles.progressValue,
              {
                backgroundColor: theme.primary,
                width: `${Math.max(8, (summary.xpIntoLevel / summary.xpNeeded) * 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: theme.textSoft }]}>
          当前等级进度：{summary.xpIntoLevel} / {summary.xpNeeded} XP
        </Text>
      </SectionCard>

      <SectionCard subtitle="遵循 PRD 的基础经验公式" theme={theme} title="XP 规则">
        <RuleLine
          theme={theme}
          text="完成任务 XP = 10 x 优先级系数（低 1 / 中 3 / 高 5） + AI 价值分 x 0.2"
        />
        <RuleLine theme={theme} text="右滑完成会触发纸屑和彩色反馈。" />
        <RuleLine theme={theme} text="左滑放弃不会扣分，但会影响宠物心情。" />
        <RuleLine theme={theme} text="每升几级会解锁新的虚拟饰品，占位素材已预留为可扩展结构。" />
      </SectionCard>

      <SectionCard subtitle="当前阶段以轻量可落地为主" theme={theme} title="后续可扩展">
        <Pressable style={[styles.futureCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
          <Text style={[styles.futureTitle, { color: theme.text }]}>下一阶段建议</Text>
          <Text style={[styles.futureBody, { color: theme.textMuted }]}>
            可以继续补上宠物图片素材、升级饰品位、番茄钟联动和更细致的完成动画。
          </Text>
        </Pressable>
      </SectionCard>
    </Screen>
  );
}

function MetricCard({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
      <Text style={[styles.metricLabel, { color: theme.textSoft }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function RuleLine({ text, theme }: { text: string; theme: ReturnType<typeof getTheme> }) {
  return <Text style={[styles.ruleText, { color: theme.textMuted }]}>{text}</Text>;
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
  petCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    alignItems: "center",
  },
  petVisual: {
    width: 120,
    height: 120,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  petEmoji: {
    fontSize: 62,
  },
  petMeta: {
    alignItems: "center",
    gap: 8,
  },
  petName: {
    fontSize: 24,
    fontWeight: "800",
  },
  petAccessory: {
    fontSize: 13,
  },
  petQuote: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  metricLabel: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressValue: {
    height: "100%",
    borderRadius: 999,
  },
  progressLabel: {
    fontSize: 12,
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 22,
  },
  futureCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  futureTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  futureBody: {
    fontSize: 13,
    lineHeight: 20,
  },
});
