import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppTheme } from "@/src/lib/theme";

type SectionCardProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  theme: AppTheme;
  rightSlot?: React.ReactNode;
}>;

export function SectionCard({
  children,
  title,
  subtitle,
  theme,
  rightSlot,
}: SectionCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleColumn}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.textSoft }]}>{subtitle}</Text> : null}
        </View>
        {rightSlot}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  titleColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
