import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TurndownService from "turndown";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  SeparatorHorizontal,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (val: string) => void;
  height?: number;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let codeBlock: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${paragraph.map(parseInlineMarkdown).join("<br />")}</p>`);
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (codeBlock) {
        html.push(`<pre><code>${escapeHtml(codeBlock.join("\n"))}</code></pre>`);
        codeBlock = null;
      } else {
        flushParagraph();
        flushList();
        codeBlock = [];
      }
      continue;
    }

    if (codeBlock) {
      codeBlock.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      html.push(`<h${heading[1].length}>${parseInlineMarkdown(heading[2])}</h${heading[1].length}>`);
      continue;
    }

    const unorderedItem = line.match(/^[-*]\s+(.+)$/);
    if (unorderedItem) {
      flushParagraph();
      if (listType !== "ul") {
        flushList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${parseInlineMarkdown(unorderedItem[1])}</li>`);
      continue;
    }

    const orderedItem = line.match(/^\d+[.)]\s+(.+)$/);
    if (orderedItem) {
      flushParagraph();
      if (listType !== "ol") {
        flushList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${parseInlineMarkdown(orderedItem[1])}</li>`);
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      html.push(`<blockquote><p>${parseInlineMarkdown(line.slice(2))}</p></blockquote>`);
      continue;
    }

    if (line === "---") {
      flushParagraph();
      flushList();
      html.push("<hr />");
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  if (codeBlock) {
    html.push(`<pre><code>${escapeHtml(codeBlock.join("\n"))}</code></pre>`);
  }

  return html.join("");
}

function createTurndownService() {
  const turndown = new TurndownService({
    codeBlockStyle: "fenced",
    headingStyle: "atx",
    bulletListMarker: "-",
  });

  turndown.addRule("emptyParagraph", {
    filter: (node) => node.nodeName === "P" && !node.textContent?.trim(),
    replacement: () => "",
  });

  return turndown;
}

export default function MarkdownEditor({ value, onChange, height = 560 }: Props) {
  const turndown = useMemo(createTurndownService, []);
  const applyingExternalValue = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Image.configure({
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "直接像写文档一样输入内容，使用上方工具栏设置标题、列表、引用、代码块和图片。",
      }),
    ],
    content: markdownToHtml(value || ""),
    editorProps: {
      attributes: {
        class: "blog-rich-editor-content markdown-body min-h-[360px] max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (applyingExternalValue.current) return;
      onChange(turndown.turndown(editor.getHTML()).trim());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentMarkdown = turndown.turndown(editor.getHTML()).trim();
    if ((value || "").trim() === currentMarkdown) return;

    applyingExternalValue.current = true;
    editor.commands.setContent(markdownToHtml(value || ""), { emitUpdate: false });
    applyingExternalValue.current = false;
  }, [editor, turndown, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("请输入链接地址", previousUrl || "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    if (!editor) return;
    const url = window.prompt("请输入图片地址");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  if (!editor) return null;

  const toolbarItems = [
    {
      label: "一级标题",
      icon: Heading1,
      active: editor.isActive("heading", { level: 1 }),
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "二级标题",
      icon: Heading2,
      active: editor.isActive("heading", { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "加粗",
      icon: Bold,
      active: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "斜体",
      icon: Italic,
      active: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "引用",
      icon: Quote,
      active: editor.isActive("blockquote"),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "无序列表",
      icon: List,
      active: editor.isActive("bulletList"),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "有序列表",
      icon: ListOrdered,
      active: editor.isActive("orderedList"),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "代码块",
      icon: Code,
      active: editor.isActive("codeBlock"),
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2 overflow-x-auto">
        {toolbarItems.map((item) => (
          <Button
            key={item.label}
            type="button"
            variant="ghost"
            size="sm"
            title={item.label}
            className={cn("h-9 px-2", item.active && "bg-background text-primary shadow-sm")}
            onClick={item.action}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        ))}

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button type="button" variant="ghost" size="sm" title="链接" className="h-9 px-2" onClick={setLink}>
          <LinkIcon className={cn("h-4 w-4", editor.isActive("link") && "text-primary")} />
        </Button>
        <Button type="button" variant="ghost" size="sm" title="图片" className="h-9 px-2" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          title="分割线"
          className="h-9 px-2"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <SeparatorHorizontal className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          title="撤销"
          className="h-9 px-2"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          title="重做"
          className="h-9 px-2"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="ml-auto hidden text-xs text-muted-foreground lg:block">
          所见即所得编辑，保存时自动转为 Markdown
        </div>
      </div>

      <div className="overflow-y-auto bg-background px-4 sm:px-6 py-5" style={{ minHeight: Math.min(height, 400), maxHeight: Math.max(height, 720) }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
