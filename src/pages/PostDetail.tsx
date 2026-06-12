import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePost, usePostBySlug } from "@/hooks/usePosts";
import { useAuthStore } from "@/store/authStore";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import CommentSection from "@/components/CommentSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Calendar, Clock, ArrowLeft } from "lucide-react";
import { formatDate, readingTime } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function PostDetail() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const fromAdmin = (location.state as any)?.from === "admin";

  const { data: post, isLoading } = slug ? usePostBySlug(slug) : usePost(Number(id));

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

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Admin back button */}
        {isAdmin && fromAdmin && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/posts")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        )}

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

              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                {post.title}
              </h1>

              {post.summary && (
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
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
                    {post.author?.nickname || "匿名"}
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
    </>
  );
}
