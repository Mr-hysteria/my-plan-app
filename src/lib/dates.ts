const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toDateKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getFocusDateKey(now = new Date()): string {
  const date = new Date(now);
  if (date.getHours() < 4) {
    date.setDate(date.getDate() - 1);
  }
  return toDateKey(date);
}

export function parseDateInput(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return undefined;
  }

  const date = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(date.getTime()) || toDateKey(date) !== trimmed) {
    return undefined;
  }

  return trimmed;
}

export function formatDisplayDate(value?: string): string {
  if (!value) {
    return "未设置";
  }

  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export function getDaysUntil(dateKey?: string, now = new Date()): number | undefined {
  if (!dateKey) {
    return undefined;
  }

  const target = new Date(`${dateKey}T00:00:00`);
  const current = new Date(`${toDateKey(now)}T00:00:00`);
  return Math.round((target.getTime() - current.getTime()) / MS_PER_DAY);
}

export function getDueLabel(dateKey?: string): string | undefined {
  const diff = getDaysUntil(dateKey);
  if (diff === undefined) {
    return undefined;
  }
  if (diff === 0) {
    return "今天到期";
  }
  if (diff === 1) {
    return "明天到期";
  }
  if (diff! > 1) {
    return `${diff} 天后到期`;
  }
  if (diff === -1) {
    return "已逾期 1 天";
  }
  return `已逾期 ${Math.abs(diff)} 天`;
}

export function isSameDateKey(left?: string, right?: string): boolean {
  return Boolean(left && right && left === right);
}

export function formatRelativeUpdatedAt(value: string): string {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();

  if (diff < 60_000) {
    return "刚刚更新";
  }
  if (diff < 3_600_000) {
    return `${Math.max(1, Math.floor(diff / 60_000))} 分钟前更新`;
  }
  if (diff < 86_400_000) {
    return `${Math.max(1, Math.floor(diff / 3_600_000))} 小时前更新`;
  }
  return `${Math.max(1, Math.floor(diff / 86_400_000))} 天前更新`;
}
