export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function slugifyHeading(text: string) {
  // 先去除 Markdown 标记
  const clean = text
    .replace(/\*\*(.+?)\*\*/g, "$1")  // 粗体
    .replace(/\*(.+?)\*/g, "$1")        // 斜体
    .replace(/`(.+?)`/g, "$1")          // 行内代码
    .replace(/~~(.+?)~~/g, "$1")        // 删除线
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // 链接
    .replace(/[!\[\]()]/g, "");         // 剩余标记
  
  return clean
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractTocItems(content: string, maxLevel = 3): TocItem[] {
  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];

  return headings
    .map((heading) => {
      const level = heading.match(/^(#+)/)?.[1].length || 1;
      const rawText = heading.replace(/^#+\s+/, "").trim();
      // 清理 Markdown 标记
      const text = rawText
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .replace(/~~(.+?)~~/g, "$1")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .replace(/[!\[\]()]/g, "");
      return { id: slugifyHeading(rawText), text, level };
    })
    .filter((item) => item.text && item.level <= maxLevel);
}

