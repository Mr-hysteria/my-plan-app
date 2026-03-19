import { PropsWithChildren } from "react";
import { ScrollView, ScrollViewProps, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppTheme } from "@/src/lib/theme";

type ScreenProps = PropsWithChildren<{
  theme: AppTheme;
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
}>;

export function Screen({
  children,
  theme,
  scroll = true,
  contentContainerStyle,
}: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
});
