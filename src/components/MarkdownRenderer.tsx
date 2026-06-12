import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { slugifyHeading } from "@/lib/markdown";
import { isValidElement, type ReactNode } from "react";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  const getText = (node: ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(getText).join("");
    // 处理 React 元素（如 <strong>、<em> 等）
    if (isValidElement(node) && node.props.children) {
      return getText(node.props.children);
    }
    return "";
  };

  const headingComponents = {
    h1: ({ children, ...props }: any) => <h1 id={slugifyHeading(getText(children))} {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 id={slugifyHeading(getText(children))} {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 id={slugifyHeading(getText(children))} {...props}>{children}</h3>,
    h4: ({ children, ...props }: any) => <h4 id={slugifyHeading(getText(children))} {...props}>{children}</h4>,
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={headingComponents}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
