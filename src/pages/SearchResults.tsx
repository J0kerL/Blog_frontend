import { useSearchParams } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "";
  const pageNum = Number(searchParams.get("page")) || 1;

  const { data } = usePosts({ pageNum, pageSize: 9, keyword });
  const posts = data?.list || [];
  const pages = data?.pages || 0;

  return (
    <>
      <Helmet>
        <title>搜索: {keyword} - Blog</title>
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-8">
          <Search className="w-6 h-6 text-primary shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            搜索结果: {keyword}
          </h1>
          <span className="text-muted-foreground">({data?.total || 0} 篇)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            未找到相关文章
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNum <= 1}
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                p.set("page", String(pageNum - 1));
                setSearchParams(p);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", String(p));
                  setSearchParams(params);
                }}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={pageNum >= pages}
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                p.set("page", String(pageNum + 1));
                setSearchParams(p);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
