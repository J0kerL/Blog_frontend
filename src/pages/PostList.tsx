import { useSearchParams } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import PostCard from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function PostList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNum = Number(searchParams.get("page")) || 1;
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const tagId = searchParams.get("tagId") ? Number(searchParams.get("tagId")) : undefined;
  const keyword = searchParams.get("q") || undefined;

  const { data } = usePosts({ pageNum, pageSize: 9, keyword, categoryId, tagId });
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const posts = data?.list || [];
  const total = data?.total || 0;
  const pages = data?.pages || 0;

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  };

  const activeCategory = categories?.find((c) => c.id === categoryId);
  const activeTag = tags?.find((t) => t.id === tagId);

  return (
    <>
      <Helmet>
        <title>
          {activeCategory
            ? `${activeCategory.name} - 分类`
            : activeTag
            ? `${activeTag.name} - 标签`
            : keyword
            ? `搜索: ${keyword}`
            : "文章列表"}
        </title>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {activeCategory
              ? `分类: ${activeCategory.name}`
              : activeTag
              ? `标签: ${activeTag.name}`
              : keyword
              ? `搜索: ${keyword}`
              : "所有文章"}
          </h1>
          <p className="text-muted-foreground">
            共 {total} 篇文章
          </p>
        </div>

        {/* Category filters */}
        {!categoryId && !tagId && categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={!categoryId ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                p.delete("categoryId");
                p.set("page", "1");
                setSearchParams(p);
              }}
            >
              全部
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={categoryId === cat.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set("categoryId", String(cat.id));
                  p.set("page", "1");
                  setSearchParams(p);
                }}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">暂无文章</div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNum <= 1}
              onClick={() => setPage(pageNum - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              let p: number;
              if (pages <= 7) {
                p = i + 1;
              } else if (pageNum <= 4) {
                p = i + 1;
              } else if (pageNum >= pages - 3) {
                p = pages - 6 + i;
              } else {
                p = pageNum - 3 + i;
              }
              return (
                <Button
                  key={p}
                  variant={p === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={pageNum >= pages}
              onClick={() => setPage(pageNum + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

    </>
  );
}
