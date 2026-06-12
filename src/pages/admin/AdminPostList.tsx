import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminPosts, useDeletePost, useUpdatePostStatus } from "@/hooks/usePosts";
import { useAdminCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Pencil, Trash2, Eye, Search, ArrowDownFromLine, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  0: { label: "草稿", variant: "secondary" },
  1: { label: "已发布", variant: "default" },
  2: { label: "已下架", variant: "destructive" },
};

export default function AdminPostList() {
  const navigate = useNavigate();
  const [pageNum, setPageNum] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: categories } = useAdminCategories();
  const { data, isLoading } = useAdminPosts({
    pageNum,
    pageSize: 10,
    keyword: keyword || undefined,
    status: status !== "all" ? Number(status) : undefined,
    categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
  });

  const deletePost = useDeletePost();
  const updatePostStatus = useUpdatePostStatus();

  const handleDelete = () => {
    if (!deleteId) return;
    deletePost.mutate(deleteId, {
      onSuccess: () => {
        toast.success("删除成功");
        setDeleteId(null);
      },
    });
  };

  const handleUnpublish = (postId: number) => {
    updatePostStatus.mutate(
      { id: postId, status: 2 },
      {
        onSuccess: () => toast.success("已下架"),
      }
    );
  };

  const handlePublish = (postId: number) => {
    updatePostStatus.mutate(
      { id: postId, status: 1 },
      {
        onSuccess: () => toast.success("已发布"),
      }
    );
  };

  const posts = data?.list || [];
  const pages = data?.pages || 0;

  return (
    <>
      <Helmet>
        <title>文章管理 - Blog Admin</title>
      </Helmet>

      <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">文章管理</h1>
          <Button onClick={() => navigate("/admin/posts/new")}>
            <Plus className="w-4 h-4 mr-2" />
            新建文章
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPageNum(1); }}
              placeholder="搜索标题..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPageNum(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="0">草稿</SelectItem>
              <SelectItem value="1">已发布</SelectItem>
              <SelectItem value="2">已下架</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPageNum(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-20">浏览</TableHead>
                <TableHead className="w-36">发布时间</TableHead>
                <TableHead className="w-36 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {post.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[post.status]?.variant || "secondary"}>
                      {statusMap[post.status]?.label || "未知"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{post.viewCount}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {post.publishedAt ? formatDate(post.publishedAt) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/post/${post.id}`, { state: { from: 'admin' } })}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>预览</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/posts/edit/${post.id}`)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>编辑</TooltipContent>
                      </Tooltip>
                      {post.status === 1 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnpublish(post.id)}
                              disabled={updatePostStatus.isPending}
                            >
                              <ArrowDownFromLine className="w-4 h-4 text-orange-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>下架</TooltipContent>
                        </Tooltip>
                      )}
                      {(post.status === 0 || post.status === 2) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePublish(post.id)}
                              disabled={updatePostStatus.isPending}
                            >
                              <Send className="w-4 h-4 text-green-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>发布</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(post.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>删除</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {isLoading ? "加载中..." : "暂无文章"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={pageNum <= 1} onClick={() => setPageNum(pageNum - 1)}>
              上一页
            </Button>
            <span className="text-sm text-muted-foreground">
              {pageNum} / {pages}
            </span>
            <Button variant="outline" size="sm" disabled={pageNum >= pages} onClick={() => setPageNum(pageNum + 1)}>
              下一页
            </Button>
          </div>
        )}

        {/* Delete dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
              <DialogDescription>删除后无法恢复，确定要删除这篇文章吗？</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deletePost.isPending}>
                {deletePost.isPending ? "删除中..." : "确认删除"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </TooltipProvider>
    </>
  );
}
