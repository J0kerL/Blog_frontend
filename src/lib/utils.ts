import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(dateStr: string) {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return formatDate(dateStr);
}

export function truncate(str: string, len: number) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

export function readingTime(content: string) {
  if (!content) return "1 min";
  const words = content.replace(/[#*`\[\]()!>\-]/g, "").length;
  const mins = Math.max(1, Math.ceil(words / 400));
  return `${mins} min`;
}
