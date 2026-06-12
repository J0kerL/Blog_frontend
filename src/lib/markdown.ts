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

export function plainTextToMarkdown(value: string) {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  let firstContentLineSeen = false;

  return lines
    .map((rawLine) => {
      const line = rawLine.trim();

      if (!line) return "";
      if (/^#{1,6}\s/.test(line)) return line;
      if (/^([-*+]\s|\d+[.)]\s|>\s)/.test(line)) return line;

      if (!firstContentLineSeen && line.length <= 40) {
        firstContentLineSeen = true;
        return `# ${line}`;
      }

      firstContentLineSeen = true;

      if (/^(一|二|三|四|五|六|七|八|九|十|第.+章|第.+节|[0-9]+[、.])/.test(line) && line.length <= 60) {
        return `## ${line.replace(/^[0-9]+[、.]\s*/, "")}`;
      }

      if (/[:：]$/.test(line) && line.length <= 50) {
        return `### ${line.replace(/[:：]$/, "")}`;
      }

      return line;
    })
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n");
}
