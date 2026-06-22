import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { userApi } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Sun, Moon, Menu, X, LogOut, LayoutDashboard, User, PenLine, FileText } from "lucide-react";
import { useState, useEffect } from "react";


export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const hasCategoryId = !!searchParams.get("categoryId");
  const hasTagId = !!searchParams.get("tagId");
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // 路由变化时关闭移动菜单
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // 从 URL 同步搜索关键词
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== keyword) {
      setKeyword(q);
    }
  }, [searchParams]);

  // 移动菜单打开时锁定 body 滚动
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/posts?q=${encodeURIComponent(keyword.trim())}`);
      setMobileOpen(false);
    }
  };

  // 实时搜索：输入立即跳转，清空时回到全部文章
  useEffect(() => {
    const trimmed = keyword.trim();
    const currentQ = searchParams.get("q") || "";
    if (trimmed) {
      if (pathname !== "/posts" || currentQ !== trimmed) {
        navigate(`/posts?q=${encodeURIComponent(trimmed)}`);
      }
    } else if (currentQ) {
      // 清空搜索框时移除 q 参数，回到全部文章
      navigate("/posts");
    }
  }, [keyword]);

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch {
      // 即使后端调用失败也清除本地状态
    } finally {
      logout();
      navigate("/");
    }
  };

  const navLinks = [
    { to: "/", label: "首页" },
    { to: "/posts", label: "文章" },
    { to: "/categories", label: "分类" },
    { to: "/tags", label: "标签" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            Diamond
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            let isActive: boolean;
            if (link.to === "/") {
              isActive = pathname === "/";
            } else if (link.to === "/categories") {
              isActive = pathname === "/categories" || (pathname === "/posts" && hasCategoryId);
            } else if (link.to === "/tags") {
              isActive = pathname === "/tags" || (pathname === "/posts" && hasTagId);
            } else if (link.to === "/posts") {
              isActive = pathname.startsWith("/posts") && !hasCategoryId && !hasTagId;
            } else {
              isActive = pathname.startsWith(link.to);
            }
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                  isActive
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索文章..."
              className="pl-9 bg-muted/50"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {user && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-1.5"
              onClick={() => navigate("/write")}
            >
              <PenLine className="w-4 h-4" />
              写文章
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-10">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nickname || user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {(user.nickname || user.username)[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm">{user.nickname || user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/my-posts")}>
                  <FileText className="w-4 h-4 mr-2" />
                  我的文章
                </DropdownMenuItem>
                {user.role === "ROLE_ADMIN" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    后台管理
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  个人中心
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="h-10 px-4">
              <Link to="/login">登录</Link>
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu with slide-down animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t bg-background p-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索文章..."
                className="pl-9 h-11"
              />
            </div>
            <Button type="submit" size="sm" className="h-11 px-5">搜索</Button>
          </form>
          <nav className="space-y-1">
            {navLinks.map((link) => {
              let isActive: boolean;
              if (link.to === "/") {
                isActive = pathname === "/";
              } else if (link.to === "/categories") {
                isActive = pathname === "/categories" || (pathname === "/posts" && hasCategoryId);
              } else if (link.to === "/tags") {
                isActive = pathname === "/tags" || (pathname === "/posts" && hasTagId);
              } else if (link.to === "/posts") {
                isActive = pathname.startsWith("/posts") && !hasCategoryId && !hasTagId;
              } else {
                isActive = pathname.startsWith(link.to);
              }
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {user && (
            <div className="border-t pt-2 space-y-1">
              <Link
                to="/write"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-base font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <PenLine className="w-4 h-4" />
                写文章
              </Link>
              <Link
                to="/my-posts"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-base font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <FileText className="w-4 h-4" />
                我的文章
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
