import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { parseDateInput } from "@/src/lib/dates";
import { AppTheme } from "@/src/lib/theme";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TAG_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TAGS,
  PlanTask,
  TaskPriority,
  TaskStatus,
  TaskTag,
} from "@/src/features/tasks/types";

type TaskEditorModalProps = {
  visible: boolean;
  task?: PlanTask;
  theme: AppTheme;
  onClose: () => void;
  onSave: (changes: Partial<PlanTask>) => void;
};

export function TaskEditorModal({
  visible,
  task,
  theme,
  onClose,
  onSave,
}: TaskEditorModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [note, setNote] = useState(task?.note ?? "");
  const [dueDateInput, setDueDateInput] = useState(task?.dueDate ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [tag, setTag] = useState<TaskTag>(task?.tag ?? "work");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "backlog");

  useEffect(() => {
    if (!visible) {
      return;
    }
    setTitle(task?.title ?? "");
    setNote(task?.note ?? "");
    setDueDateInput(task?.dueDate ?? "");
    setPriority(task?.priority ?? "medium");
    setTag(task?.tag ?? "work");
    setStatus(task?.status ?? "backlog");
  }, [task, visible]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  const handleSave = () => {
    if (!canSave) {
      Alert.alert("标题不能为空", "请至少填写一句任务描述。");
      return;
    }

    const parsedDueDate = dueDateInput.trim() ? parseDateInput(dueDateInput) : undefined;
    if (dueDateInput.trim() && !parsedDueDate) {
      Alert.alert("日期格式不正确", "请使用 YYYY-MM-DD，例如 2026-03-20。");
      return;
    }

    onSave({
      title: title.trim(),
      note: note.trim() || undefined,
      dueDate: parsedDueDate,
      priority,
      tag,
      status,
    });
    onClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>编辑任务</Text>
            <Pressable onPress={onClose}>
              <Text style={[styles.closeText, { color: theme.primary }]}>关闭</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <FieldLabel label="标题" theme={theme} />
              <TextInput
                onChangeText={setTitle}
                placeholder="给任务一个清晰的结果描述"
                placeholderTextColor={theme.textSoft}
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
                value={title}
              />

              <FieldLabel label="备注" theme={theme} />
              <TextInput
                multiline
                onChangeText={setNote}
                placeholder="可选，写下拆解步骤或补充信息"
                placeholderTextColor={theme.textSoft}
                style={[
                  styles.input,
                  styles.noteInput,
                  { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted },
                ]}
                textAlignVertical="top"
                value={note}
              />

              <FieldLabel label="截止日期" theme={theme} />
              <TextInput
                onChangeText={setDueDateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSoft}
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
                value={dueDateInput}
              />

              <FieldLabel label="优先级" theme={theme} />
              <OptionRow<TaskPriority>
                options={TASK_PRIORITIES}
                selected={priority}
                labels={PRIORITY_LABELS}
                onSelect={setPriority}
                theme={theme}
              />

              <FieldLabel label="标签" theme={theme} />
              <OptionRow<TaskTag>
                options={TASK_TAGS}
                selected={tag}
                labels={TAG_LABELS}
                onSelect={setTag}
                theme={theme}
              />

              <FieldLabel label="状态" theme={theme} />
              <OptionRow<TaskStatus>
                options={TASK_STATUSES}
                selected={status}
                labels={STATUS_LABELS}
                onSelect={setStatus}
                theme={theme}
              />
            </View>
          </ScrollView>

          <Pressable
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: canSave ? theme.primary : theme.border }]}
          >
            <Text style={styles.saveText}>保存修改</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function FieldLabel({ label, theme }: { label: string; theme: AppTheme }) {
  return <Text style={[styles.fieldLabel, { color: theme.text }]}>{label}</Text>;
}

function OptionRow<T extends string>({
  options,
  selected,
  labels,
  onSelect,
  theme,
}: {
  options: readonly T[];
  selected: T;
  labels: Record<T, string>;
  onSelect: (value: T) => void;
  theme: AppTheme;
}) {
  return (
    <View style={styles.optionRow}>
      {options.map((option) => {
        const active = selected === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.option,
              {
                backgroundColor: active ? theme.primarySoft : theme.surfaceMuted,
                borderColor: active ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={{ color: active ? theme.primary : theme.text }}>{labels[option]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modal: {
    maxHeight: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeText: {
    fontSize: 15,
    fontWeight: "600",
  },
  form: {
    gap: 12,
    paddingBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  noteInput: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
