import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppTheme } from "@/src/lib/theme";

type FlashEntryProps = {
  theme: AppTheme;
  onSubmit: (value: string) => void;
};

export function FlashEntry({ theme, onSubmit }: FlashEntryProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) {
      return;
    }
    onSubmit(value);
    setValue("");
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.text }]}>闪电录入</Text>
      <Text style={[styles.hint, { color: theme.textSoft }]}>
        输入任务后直接加入任务池，先记录，再慢慢整理。
      </Text>
      <View style={[styles.inputRow, { backgroundColor: theme.surfaceMuted }]}>
        <TextInput
          onChangeText={setValue}
          onSubmitEditing={handleSubmit}
          placeholder="比如：补上 AI 计划助手的宠物页"
          placeholderTextColor={theme.textSoft}
          returnKeyType="done"
          style={[styles.input, { color: theme.text }]}
          value={value}
        />
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed ? theme.primary : theme.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={styles.buttonText}>加入</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  label: {
    fontSize: 20,
    fontWeight: "700",
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
  },
  inputRow: {
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 15,
  },
  button: {
    minHeight: 40,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
