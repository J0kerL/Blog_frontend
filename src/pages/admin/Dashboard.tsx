import { useAdminPosts } from "@/hooks/usePosts";
import { useAdminCategories } from "@/hooks/useCategories";
import { useAdminTags } from "@/hooks/useTags";
import { useAdminComments } from "@/hooks/useComments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, Tags, MessageSquare, Eye } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Dashboard() {
  const { data: postData } = useAdminPosts({ pageNum: 1, pageSize: 1 });
  const { data: categories } = useAdminCategories();
  const { data: tags } = useAdminTags();
  const { data: commentData } = useAdminComments({ pageNum: 1, pageSize: 1 });

  const stats = [
    {
      label: "文章总数",
      value: postData?.total || 0,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "分类数量",
      value: categories?.length || 0,
      icon: FolderOpen,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "标签数量",
      value: tags?.length || 0,
      icon: Tags,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "评论总数",
      value: commentData?.total || 0,
      icon: MessageSquare,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <>
      <Helmet>
        <title>仪表盘 - Blog Admin</title>
      </Helmet>

      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-foreground">仪表盘</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">最近文章</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {postData?.list?.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate">{post.title}</span>
                    <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-2">
                      <Eye className="w-3 h-3" />
                      {post.viewCount}
                    </div>
                  </div>
                ))}
                {(!postData?.list || postData.list.length === 0) && (
                  <p className="text-sm text-muted-foreground">暂无文章</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">分类概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories?.slice(0, 5).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{cat.name}</span>
                    <span className="text-muted-foreground">{cat.postCount} 篇</span>
                  </div>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-sm text-muted-foreground">暂无分类</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
