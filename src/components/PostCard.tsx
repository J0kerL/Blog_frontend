import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, FileText } from "lucide-react";
import { formatDate, truncate, readingTime } from "@/lib/utils";
import type { PostListVO } from "@/types";

interface PostCardProps {
  post: PostListVO;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link to={`/post/slug/${post.slug}`}>
        <div className="aspect-video overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-muted flex items-center justify-center group-hover:from-primary/15 transition-all duration-500">
              <FileText className="w-12 h-12 text-primary/30" />
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-5">
        {/* Categories & Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.categories?.slice(0, 2).map((cat) => (
            <Link key={cat.id} to={`/posts?categoryId=${cat.id}`}>
              <Badge variant="secondary" className="text-xs hover:bg-primary/10 transition-colors">
                {cat.name}
              </Badge>
            </Link>
          ))}
          {post.tags?.slice(0, 3).map((tag) => (
            <Link key={tag.id} to={`/posts?tagId=${tag.id}`}>
              <Badge variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Title */}
        <Link to={`/post/slug/${post.slug}`}>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {post.isTop === 1 && (
              <Badge className="mr-2 text-[10px] px-1.5 py-0">置顶</Badge>
            )}
            {post.title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed min-h-[2.5rem]">
          {truncate(post.summary || "", 120) || "\u00A0"}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-medium">
              {(post.author?.nickname || "A")[0].toUpperCase()}
            </div>
            <span>{post.author?.nickname || "匿名"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.viewCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.publishedAt ? formatDate(post.publishedAt) : ""}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
