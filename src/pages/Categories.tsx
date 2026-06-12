import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, FileText } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function CategoriesPage() {
  const { data: categories } = useCategories();

  return (
    <>
      <Helmet>
        <title>分类 - Blog</title>
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">所有分类</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat) => (
            <Link key={cat.id} to={`/posts?categoryId=${cat.id}`}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {cat.postCount} 篇文章
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {(!categories || categories.length === 0) && (
            <div className="col-span-full text-center py-16 text-muted-foreground">暂无分类</div>
          )}
        </div>
      </div>
    </>
  );
}
