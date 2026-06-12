# Blog Frontend

博客平台前端，基于 React 18 + TypeScript + Vite 构建，包含前台展示和后台管理两套界面。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18.3 |
| 语言 | TypeScript 5.6 |
| 构建工具 | Vite 6 |
| 路由 | React Router v6 |
| 状态管理 | Zustand |
| 数据请求 | TanStack React Query v5 |
| 样式 | Tailwind CSS 3 |
| UI 组件 | Radix UI + shadcn/ui |
| 图标 | Lucide React |
| 富文本编辑器 | Tiptap |
| Markdown 渲染 | react-markdown + remark-gfm + rehype-highlight |
| 表单验证 | React Hook Form + Zod |
| SEO | react-helmet-async |
| 通知提示 | Sonner |

## 环境要求

- Node.js 18+
- npm 9+

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API 地址

编辑 `.env` 文件（默认指向本地后端）：

```
VITE_API_BASE_URL=http://localhost:8080
```

### 3. 启动开发服务器

```bash
npm run dev
```

默认运行在 `http://localhost:5173`

### 4. 构建生产包

```bash
npm run build
```

输出目录：`dist/`

## 项目结构

```
src/
├── api/             # Axios 请求封装（按模块拆分）
├── components/
│   └── ui/          # shadcn/ui 基础组件
├── hooks/           # React Query hooks（usePosts、useTags 等）
├── layouts/         # 布局组件（MainLayout、AdminLayout）
├── lib/             # 工具函数（Markdown 处理、clsx 等）
├── pages/
│   ├── admin/       # 后台管理页面
│   └── auth/        # 认证页面（登录、注册、忘记密码）
├── store/           # Zustand 全局状态（auth、theme）
├── types/           # TypeScript 类型定义
├── App.tsx          # 根组件
└── router.tsx       # 路由配置
```

## 主要页面

### 前台

- 首页（文章列表 + 分类/标签筛选）
- 文章详情（Markdown 渲染 + TOC 目录导航 + 评论）
- 分类/标签页
- 搜索结果页

### 后台管理

- 仪表盘（文章/评论/用户统计图表）
- 文章管理（编辑器 + 草稿/发布/下架）
- 分类管理（搜索 + 拖拽排序）
- 标签管理（搜索）
- 评论管理（搜索 + 状态筛选 + 人工/AI 审核）
- 用户管理（角色/状态管理）

## 可用脚本

```bash
npm run dev        # 启动开发服务器（热重载）
npm run build      # TypeScript 编译 + Vite 生产构建
npm run preview    # 预览生产构建结果
npm run lint       # ESLint 代码检查
```
