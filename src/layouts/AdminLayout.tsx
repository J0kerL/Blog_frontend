import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { userApi } from "@/api/user";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  MessageSquare,
  Users,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "仪表盘", end: true },
  { to: "/admin/posts", icon: FileText, label: "文章管理" },
  { to: "/admin/categories", icon: FolderOpen, label: "分类管理" },
  { to: "/admin/tags", icon: Tags, label: "标签管理" },
  { to: "/admin/comments", icon: MessageSquare, label: "评论管理" },
  { to: "/admin/users", icon: Users, label: "用户管理" },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

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

  const displayName = user?.nickname || user?.username || "Admin";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col fixed h-screen">
        <div className="h-16 px-6 border-b flex items-center">
          <NavLink
            to="/admin"
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Diamond
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Admin
            </span>
          </NavLink>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {theme === "light" ? "暗黑模式" : "明亮模式"}
          </button>
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            返回前台
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Top bar */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-foreground">后台管理</h2>
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                {displayName[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {displayName}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
