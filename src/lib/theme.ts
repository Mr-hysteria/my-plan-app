export type AppTheme = {
  background: string;
  surface: string;
  surfaceMuted: string;
  card: string;
  text: string;
  textMuted: string;
  textSoft: string;
  border: string;
  primary: string;
  primarySoft: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
};

const lightTheme: AppTheme = {
  background: "#F4F7FB",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF3F8",
  card: "#FFFFFF",
  text: "#111827",
  textMuted: "#4B5563",
  textSoft: "#6B7280",
  border: "#D9E2EC",
  primary: "#2563EB",
  primarySoft: "#DBEAFE",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  shadow: "rgba(15, 23, 42, 0.08)",
};

const darkTheme: AppTheme = {
  background: "#000000",
  surface: "#0B0B0D",
  surfaceMuted: "#131418",
  card: "#111216",
  text: "#F9FAFB",
  textMuted: "#D1D5DB",
  textSoft: "#9CA3AF",
  border: "#1F2937",
  primary: "#60A5FA",
  primarySoft: "#172554",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  shadow: "rgba(0, 0, 0, 0.4)",
};

export function getTheme(colorScheme: "light" | "dark" | null | undefined): AppTheme {
  return colorScheme === "dark" ? darkTheme : lightTheme;
}
