import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { useAuthStore } from "@/store/authStore";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "ROLE_ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LoginGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

const Home = lazy(() => import("@/pages/Home"));
const PostList = lazy(() => import("@/pages/PostList"));
const PostDetail = lazy(() => import("@/pages/PostDetail"));
const CategoriesPage = lazy(() => import("@/pages/Categories"));
const TagsPage = lazy(() => import("@/pages/Tags"));
const SearchResults = lazy(() => import("@/pages/SearchResults"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserPostEditor = lazy(() => import("@/pages/UserPostEditor"));
const MyPosts = lazy(() => import("@/pages/MyPosts"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminPostList = lazy(() => import("@/pages/admin/AdminPostList"));
const AdminPostEditor = lazy(() => import("@/pages/admin/AdminPostEditor"));
const AdminCategoryList = lazy(() => import("@/pages/admin/AdminCategoryList"));
const AdminTagList = lazy(() => import("@/pages/admin/AdminTagList"));
const AdminCommentList = lazy(() => import("@/pages/admin/AdminCommentList"));
const AdminUserList = lazy(() => import("@/pages/admin/AdminUserList"));

const wrap = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: wrap(Home) },
      { path: "posts", element: wrap(PostList) },
      { path: "post/:id", element: wrap(PostDetail) },
      { path: "post/slug/:slug", element: wrap(PostDetail) },
      { path: "categories", element: wrap(CategoriesPage) },
      { path: "tags", element: wrap(TagsPage) },
      { path: "search", element: wrap(SearchResults) },
      { path: "login", element: wrap(Login) },
      { path: "register", element: wrap(Register) },
      { path: "forgot-password", element: wrap(ForgotPassword) },
      {
        path: "profile",
        element: (
          <LoginGuard>
            {wrap(Profile)}
          </LoginGuard>
        ),
      },
      {
        path: "write",
        element: (
          <LoginGuard>
            {wrap(UserPostEditor)}
          </LoginGuard>
        ),
      },
      {
        path: "write/:id",
        element: (
          <LoginGuard>
            {wrap(UserPostEditor)}
          </LoginGuard>
        ),
      },
      {
        path: "my-posts",
        element: (
          <LoginGuard>
            {wrap(MyPosts)}
          </LoginGuard>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: wrap(Dashboard) },
      { path: "posts", element: wrap(AdminPostList) },
      { path: "posts/new", element: wrap(AdminPostEditor) },
      { path: "posts/edit/:id", element: wrap(AdminPostEditor) },
      { path: "categories", element: wrap(AdminCategoryList) },
      { path: "tags", element: wrap(AdminTagList) },
      { path: "comments", element: wrap(AdminCommentList) },
      { path: "users", element: wrap(AdminUserList) },
    ],
  },
]);
