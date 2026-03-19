import { Pressable, StyleSheet, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

import { getDueLabel, formatRelativeUpdatedAt } from "@/src/lib/dates";
import { AppTheme } from "@/src/lib/theme";
import { PRIORITY_LABELS, PlanTask, STATUS_LABELS, TAG_LABELS } from "@/src/features/tasks/types";

type TaskCardProps = {
  theme: AppTheme;
  task: PlanTask;
  pinnedToday: boolean;
  onComplete: () => void;
  onDrop: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
  onStart: () => void;
};

export function TaskCard({
  theme,
  task,
  pinnedToday,
  onComplete,
  onDrop,
  onEdit,
  onTogglePin,
  onStart,
}: TaskCardProps) {
  return (
    <Swipeable
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={() => (
        <View style={[styles.swipeAction, styles.leftAction, { backgroundColor: theme.danger }]}>
          <Text style={styles.swipeText}>放弃</Text>
        </View>
      )}
      renderRightActions={() => (
        <View style={[styles.swipeAction, styles.rightAction, { backgroundColor: theme.success }]}>
          <Text style={styles.swipeText}>完成</Text>
        </View>
      )}
      onSwipeableOpen={(direction) => {
        if (direction === "left") {
          onDrop();
        } else {
          onComplete();
        }
      }}
    >
      <Pressable
        delayLongPress={250}
        onLongPress={onEdit}
        style={[
          styles.card,
          {
            backgroundColor: theme.surfaceMuted,
            borderColor: pinnedToday ? theme.primary : theme.border,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: theme.text }]}>{task.title}</Text>
            <Text style={[styles.meta, { color: theme.textSoft }]}>
              {TAG_LABELS[task.tag]} · {PRIORITY_LABELS[task.priority]}优先级 · {STATUS_LABELS[task.status]}
            </Text>
          </View>
          {typeof task.aiScore === "number" ? (
            <View style={[styles.scoreBadge, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.scoreText, { color: theme.primary }]}>AI {task.aiScore}</Text>
            </View>
          ) : null}
        </View>

        {task.note ? <Text style={[styles.note, { color: theme.textMuted }]}>{task.note}</Text> : null}

        <View style={styles.footer}>
          <View style={styles.badges}>
            {getDueLabel(task.dueDate) ? (
              <View style={[styles.infoBadge, { backgroundColor: theme.card }]}>
                <Text style={[styles.infoText, { color: theme.warning }]}>{getDueLabel(task.dueDate)}</Text>
              </View>
            ) : null}
            {pinnedToday ? (
              <View style={[styles.infoBadge, { backgroundColor: theme.primarySoft }]}>
                <Text style={[styles.infoText, { color: theme.primary }]}>今日 Pin</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.updatedAt, { color: theme.textSoft }]}>
            {formatRelativeUpdatedAt(task.updatedAt)}
          </Text>
        </View>

        {task.aiReason ? <Text style={[styles.reason, { color: theme.textMuted }]}>{task.aiReason}</Text> : null}

        <View style={styles.actions}>
          {task.status === "backlog" ? (
            <ActionButton label="开始做" onPress={onStart} theme={theme} tone="neutral" />
          ) : null}
          <ActionButton
            label={pinnedToday ? "取消 Pin" : "Pin 今日"}
            onPress={onTogglePin}
            theme={theme}
            tone="primary"
          />
          <ActionButton label="编辑" onPress={onEdit} theme={theme} tone="neutral" />
        </View>
      </Pressable>
    </Swipeable>
  );
}

function ActionButton({
  label,
  onPress,
  theme,
  tone,
}: {
  label: string;
  onPress: () => void;
  theme: AppTheme;
  tone: "primary" | "neutral";
}) {
  const backgroundColor = tone === "primary" ? theme.primarySoft : theme.card;
  const textColor = tone === "primary" ? theme.primary : theme.text;

  return (
    <Pressable onPress={onPress} style={[styles.actionButton, { backgroundColor }]}>
      <Text style={[styles.actionText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  swipeAction: {
    justifyContent: "center",
    width: 96,
    marginVertical: 2,
    borderRadius: 18,
  },
  leftAction: {
    alignItems: "flex-start",
    paddingLeft: 18,
  },
  rightAction: {
    alignItems: "flex-end",
    paddingRight: 18,
  },
  swipeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  meta: {
    fontSize: 12,
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  infoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  updatedAt: {
    fontSize: 11,
  },
  reason: {
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
