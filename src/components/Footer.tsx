import { useState } from "react";
import { Link } from "react-router-dom";
import { Github, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const navLinks = [
  { to: "/", label: "首页" },
  { to: "/posts", label: "文章" },
  { to: "/categories", label: "分类" },
  { to: "/tags", label: "标签" },

];

/** QQ penguin icon (Bootstrap Icons) */
function QQIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.048 3.323c.022.277-.13.523-.338.55-.21.026-.397-.176-.419-.453s.13-.523.338-.55c.21-.026.397.176.42.453Zm2.265-.24c-.603-.146-.894.256-.936.333-.027.048-.008.117.037.15.045.035.092.025.119-.003.361-.39.751-.172.829-.129l.011.007c.053.024.147.028.193-.098.023-.063.017-.11-.006-.142-.016-.023-.089-.08-.247-.118"/>
      <path d="M11.727 6.719c0-.022.01-.375.01-.557 0-3.07-1.45-6.156-5.015-6.156S1.708 3.092 1.708 6.162c0 .182.01.535.01.557l-.72 1.795a26 26 0 0 0-.534 1.508c-.68 2.187-.46 3.093-.292 3.113.36.044 1.401-1.647 1.401-1.647 0 .979.504 2.256 1.594 3.179-.408.126-.907.319-1.228.556-.29.213-.253.43-.201.518.228.386 3.92.246 4.985.126 1.065.12 4.756.26 4.984-.126.052-.088.088-.305-.2-.518-.322-.237-.822-.43-1.23-.557 1.09-.922 1.594-2.2 1.594-3.178 0 0 1.041 1.69 1.401 1.647.168-.02.388-.926-.292-3.113a26 26 0 0 0-.534-1.508l-.72-1.795ZM9.773 5.53a.1.1 0 0 1-.009.096c-.109.159-1.554.943-3.033.943h-.017c-1.48 0-2.925-.784-3.034-.943a.1.1 0 0 1-.018-.055q0-.022.01-.04c.13-.287 1.43-.606 3.042-.606h.017c1.611 0 2.912.319 3.042.605m-4.32-.989c-.483.022-.896-.529-.922-1.229s.344-1.286.828-1.308c.483-.022.896.529.922 1.23.027.7-.344 1.286-.827 1.307Zm2.538 0c-.484-.022-.854-.607-.828-1.308.027-.7.44-1.25.923-1.23.483.023.853.608.827 1.309-.026.7-.439 1.251-.922 1.23ZM2.928 8.99q.32.063.639.117v2.336s1.104.222 2.21.068V9.363q.49.027.937.023h.017c1.117.013 2.474-.136 3.786-.396.097.622.151 1.386.097 2.284-.146 2.45-1.6 3.99-3.846 4.012h-.091c-2.245-.023-3.7-1.562-3.846-4.011-.054-.9 0-1.663.097-2.285"/>
    </svg>
  );
}

const CONTACT_EMAIL = "2210054954lh@gmail.com";
const CONTACT_QQ = "2210054954";

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactType, setContactType] = useState<"email" | "qq">("email");

  const openContact = (type: "email" | "qq") => {
    setContactType(type);
    setContactOpen(true);
  };

  return (
    <footer className="bg-slate-100 text-slate-600">
      <div className="container mx-auto px-4 py-5">
        {/* 三栏布局 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* 左侧：Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-slate-700">
              Copyright &copy; 2026 Diamond Blog
            </p>
            <p className="text-xs text-slate-500 mt-1">All Rights Reserved.</p>
          </div>

          {/* 中间：快速导航 */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 右侧：ICP 备案 + 社交图标 */}
          <div className="flex justify-center md:justify-end items-center gap-4">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              京ICP备2026007336号
            </a>
            <div className="flex items-center gap-3">
              {/* GitHub */}
              <a
                href="https://github.com/J0kerL"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Github size={18} strokeWidth={1.5} />
              </a>
              {/* 邮箱 - 弹窗 */}
              <button
                onClick={() => openContact("email")}
                aria-label="邮箱"
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <Mail size={18} strokeWidth={1.5} />
              </button>
              {/* QQ - 弹窗 */}
              <button
                onClick={() => openContact("qq")}
                aria-label="QQ"
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <QQIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 联系弹窗 */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {contactType === "email" ? (
                <Mail size={20} className="text-primary" />
              ) : (
                <span className="text-primary">
                  <QQIcon size={20} />
                </span>
              )}
              {contactType === "email" ? "联系邮箱" : "联系 QQ"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="pt-2 space-y-3">
                <p>
                  {contactType === "email"
                    ? "如有任何疑问或合作意向，欢迎通过以下邮箱联系我："
                    : "如有任何疑问或合作意向，欢迎通过以下 QQ 联系我："}
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3 border border-slate-200">
                  <span className="text-sm font-mono font-semibold text-slate-800 select-all">
                    {contactType === "email" ? CONTACT_EMAIL : CONTACT_QQ}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        contactType === "email" ? CONTACT_EMAIL : CONTACT_QQ
                      );
                      toast.success("已复制到剪贴板");
                    }}
                    className="ml-auto text-xs text-primary hover:underline shrink-0"
                  >
                    复制
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  感谢您的关注，我会尽快回复！
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
