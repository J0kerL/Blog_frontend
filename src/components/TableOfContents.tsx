import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { extractTocItems, type TocItem } from "@/lib/markdown";

interface Props {
  content: string;
}

export default function TableOfContents({ content }: Props) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    setItems(extractTocItems(content, 3));
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -75% 0px" }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="rounded-2xl border bg-card/80 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-foreground mb-3">目录</h4>
      <div className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "block text-sm py-1.5 leading-5 transition-colors hover:text-primary",
              item.level === 1 && "font-medium",
              item.level === 2 && "pl-3",
              item.level === 3 && "pl-6",
              activeId === item.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.text}
          </a>
        ))}
      </div>
    </nav>
  );
}
