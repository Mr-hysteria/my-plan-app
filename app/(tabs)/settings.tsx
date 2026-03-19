import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { SectionCard } from "@/src/components/SectionCard";
import { getTheme } from "@/src/lib/theme";
import { useAppStore } from "@/src/store/useAppStore";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const settings = useAppStore((state) => state.settings);
  const setPetName = useAppStore((state) => state.setPetName);
  const setAiProxyUrl = useAppStore((state) => state.setAiProxyUrl);
  const pruneDroppedTasks = useAppStore((state) => state.pruneDroppedTasks);

  const [petName, setPetNameInput] = useState(settings.petName);
  const [proxyUrl, setProxyUrlInput] = useState(settings.aiProxyUrl);

  useEffect(() => {
    setPetNameInput(settings.petName);
    setProxyUrlInput(settings.aiProxyUrl);
  }, [settings.aiProxyUrl, settings.petName]);

  return (
    <Screen theme={theme}>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: theme.text }]}>设置</Text>
        <Text style={[styles.subtitle, { color: theme.textSoft }]}>
          这里维护 AI 中转地址、宠物名字，以及一些轻量清理操作。
        </Text>
      </View>

      <SectionCard subtitle="这些内容都会存到本地，不上传第三方云端。" theme={theme} title="个人偏好">
        <FieldLabel label="宠物名称" theme={theme} />
        <TextInput
          onChangeText={setPetNameInput}
          placeholder="比如：阿柴"
          placeholderTextColor={theme.textSoft}
          style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
          value={petName}
        />

        <FieldLabel label="AI 中转服务地址" theme={theme} />
        <TextInput
          autoCapitalize="none"
          onChangeText={setProxyUrlInput}
          placeholder="http://localhost:8787"
          placeholderTextColor={theme.textSoft}
          style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
          value={proxyUrl}
        />

        <Pressable
          onPress={() => {
            setPetName(petName);
            setAiProxyUrl(proxyUrl);
            Alert.alert("已保存", "设置已写入本地存储。");
          }}
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.primaryButtonText}>保存设置</Text>
        </Pressable>
      </SectionCard>

      <SectionCard subtitle="客户端不保存 Key，只保存你的中转服务地址。" theme={theme} title="AI 接入说明">
        <Text style={[styles.paragraph, { color: theme.textMuted }]}>
          1. 在项目根目录运行 `npm run server` 启动 Node.js 中转服务。
        </Text>
        <Text style={[styles.paragraph, { color: theme.textMuted }]}>
          2. 在 `server/.env` 中填写 `GLM_API_KEY`。客户端只请求代理接口，不直接带 Key。
        </Text>
        <Text style={[styles.paragraph, { color: theme.textMuted }]}>
          3. 真机调试时，请把这里的 `localhost` 改成你电脑的局域网 IP。
        </Text>
      </SectionCard>

      <SectionCard subtitle="清理不想保留的内容，维持任务池整洁。" theme={theme} title="项目清理">
        <Pressable
          onPress={() => {
            pruneDroppedTasks();
            Alert.alert("已清理", "所有已放弃任务都已从本地列表中移除。");
          }}
          style={[styles.secondaryButton, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>删除所有已放弃任务</Text>
        </Pressable>
      </SectionCard>
    </Screen>
  );
}

function FieldLabel({ label, theme }: { label: string; theme: ReturnType<typeof getTheme> }) {
  return <Text style={[styles.label, { color: theme.text }]}>{label}</Text>;
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
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
