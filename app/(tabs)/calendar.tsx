import { Calendar } from "react-native-calendars";
import { useMemo, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { SectionCard } from "@/src/components/SectionCard";
import { buildCalendarMarks, selectTasksForDate } from "@/src/features/tasks/selectors";
import { formatDisplayDate, getFocusDateKey } from "@/src/lib/dates";
import { getTheme } from "@/src/lib/theme";
import { useAppStore } from "@/src/store/useAppStore";

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const tasks = useAppStore((state) => state.tasks);
  const [selectedDate, setSelectedDate] = useState(getFocusDateKey());

  const marks = useMemo(() => buildCalendarMarks(tasks, selectedDate), [selectedDate, tasks]);
  const agenda = useMemo(() => selectTasksForDate(tasks, selectedDate), [selectedDate, tasks]);

  return (
    <Screen theme={theme}>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: theme.text }]}>计划视图</Text>
        <Text style={[styles.subtitle, { color: theme.textSoft }]}>
          查看某天到期、完成和被手动 Pin 的任务，回顾你的节奏变化。
        </Text>
      </View>

      <SectionCard subtitle={`当前查看：${formatDisplayDate(selectedDate)}`} theme={theme} title="日历">
        <Calendar
          current={selectedDate}
          enableSwipeMonths
          markedDates={marks}
          markingType="multi-dot"
          onDayPress={(day) => setSelectedDate(day.dateString)}
          style={styles.calendar}
          theme={{
            calendarBackground: theme.card,
            dayTextColor: theme.text,
            monthTextColor: theme.text,
            textDisabledColor: theme.textSoft,
            todayTextColor: theme.primary,
            selectedDayBackgroundColor: theme.primary,
            selectedDayTextColor: "#FFFFFF",
            arrowColor: theme.primary,
            dotColor: theme.primary,
          }}
        />
      </SectionCard>

      <SectionCard subtitle="截止日在所选日期的任务" theme={theme} title="到期任务">
        {agenda.due.length === 0 ? (
          <EmptyBlock theme={theme} text="这一天没有到期任务。" />
        ) : (
          agenda.due.map((task) => <AgendaRow key={task.id} detail={task.tag} theme={theme} title={task.title} />)
        )}
      </SectionCard>

      <SectionCard subtitle="在所选日期真正完成的任务" theme={theme} title="成就回溯">
        {agenda.completed.length === 0 ? (
          <EmptyBlock theme={theme} text="这一天还没有完成记录。" />
        ) : (
          agenda.completed.map((task) => (
            <AgendaRow
              key={task.id}
              detail={task.aiScore ? `AI ${task.aiScore}` : "已完成"}
              theme={theme}
              title={task.title}
            />
          ))
        )}
      </SectionCard>

      <SectionCard subtitle="手动锁定到某一天的重点任务" theme={theme} title="Pinned 任务">
        {agenda.pinned.length === 0 ? (
          <EmptyBlock theme={theme} text="这一天没有被手动 Pin 的任务。" />
        ) : (
          agenda.pinned.map((task) => (
            <AgendaRow key={task.id} detail={`${task.priority} 优先级`} theme={theme} title={task.title} />
          ))
        )}
      </SectionCard>
    </Screen>
  );
}

function AgendaRow({
  title,
  detail,
  theme,
}: {
  title: string;
  detail: string;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <View style={[styles.row, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
      <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.rowDetail, { color: theme.textSoft }]}>{detail}</Text>
    </View>
  );
}

function EmptyBlock({ text, theme }: { text: string; theme: ReturnType<typeof getTheme> }) {
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
  calendar: {
    borderRadius: 18,
    overflow: "hidden",
  },
  row: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowDetail: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
