import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePost, usePostBySlug } from "@/hooks/usePosts";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import CommentSection from "@/components/CommentSection";
import ScrollToTop from "@/components/ScrollToTop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Calendar, Clock, ArrowLeft } from "lucide-react";
import { formatDate, readingTime } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface LocationState {
  from?: string;
}

export default function PostDetail() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const fromAdmin = (location.state as LocationState)?.from === "admin";

  // 离开详情页时使文章列表缓存失效，确保浏览量等数据更新
  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    };
  }, [queryClient]);

  // 始终调用两个Hook以避免条件Hook调用
  const { data: postBySlug, isLoading: isLoadingBySlug } = usePostBySlug(slug);
  const { data: postById, isLoading: isLoadingById } = usePost(Number(id));

  // 根据参数选择数据
  const post = slug ? postBySlug : postById;
  const isLoading = slug ? isLoadingBySlug : isLoadingById;

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">文章不存在</h1>
        <p className="text-muted-foreground">你访问的文章可能已被删除或不存在。</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Blog</title>
        <meta name="description" content={post.summary} />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8">
        {/* Back button - sticky when scrolled */}
        <div className={`mb-4 z-40 transition-all duration-300 ${
          scrolled ? "fixed top-20 left-4 mb-0" : "relative"
        }`}>
          <Button
            variant="ghost"
            size="sm"
            className={scrolled ? "shadow-md bg-background/90 backdrop-blur-sm" : ""}
            onClick={() => {
              if (isAdmin && fromAdmin) {
                navigate("/admin/posts");
              } else {
                navigate(-1);
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {isAdmin && fromAdmin ? "返回管理" : "返回"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          {/* Main content */}
          <article className="min-w-0 max-w-4xl">
            {/* Header */}
            <header className="mb-8">
              {/* Categories & Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories?.map((cat) => (
                  <Link key={cat.id} to={`/posts?categoryId=${cat.id}`}>
                    <Badge variant="secondary" className="hover:bg-primary/10 transition-colors">
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
                {post.tags?.map((tag) => (
                  <Link key={tag.id} to={`/posts?tagId=${tag.id}`}>
                    <Badge variant="outline">{tag.name}</Badge>
                  </Link>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                {post.title}
              </h1>

              {post.summary && (
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                  {post.summary}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.author?.avatar} />
                    <AvatarFallback className="text-xs">
                      {(post.author?.nickname || "A")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {user && post.author && user.id === post.author.id ? "我" : (post.author?.nickname || "匿名")}
                  </span>
                </div>
                {post.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.publishedAt)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.viewCount || 0} 阅读
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readingTime(post.content)} 阅读
                </span>
              </div>
            </header>

            {/* Content */}
            <div className="mb-12">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Comments */}
            <div className="border-t pt-8">
              <CommentSection postId={post.id} allowComment={post.allowComment} />
            </div>
          </article>

          {/* TOC sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents content={post.content} />
            </div>
          </aside>
        </div>
      </div>

      <ScrollToTop />
    </>
  );
}
