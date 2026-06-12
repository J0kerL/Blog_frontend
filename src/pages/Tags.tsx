import { Link } from "react-router-dom";
import { useTags } from "@/hooks/useTags";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

export default function TagsPage() {
  const { data: tags } = useTags();

  return (
    <>
      <Helmet>
        <title>标签 - Blog</title>
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">所有标签</h1>
        <div className="flex flex-wrap gap-3">
          {tags?.map((tag) => (
            <Link key={tag.id} to={`/posts?tagId=${tag.id}`}>
              <Badge
                variant="outline"
                className="text-base py-2 px-4 hover:bg-primary/10 transition-colors cursor-pointer"
              >
                {tag.name}
                <span className="ml-2 text-muted-foreground">({tag.postCount})</span>
              </Badge>
            </Link>
          ))}
          {(!tags || tags.length === 0) && (
            <div className="text-center py-16 text-muted-foreground w-full">暂无标签</div>
          )}
        </div>
      </div>
    </>
  );
}
