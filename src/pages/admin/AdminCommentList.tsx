import { useState } from "react";
import {
  useAdminComments,
  useApproveComment,
  useRejectComment,
  useAiReviewComment,
  useDeleteComment,
} from "@/hooks/useComments";
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
import { Check, X, Trash2, MessageSquare, Bot } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  0: { label: "待审核", variant: "secondary" },
  1: { label: "已通过", variant: "default" },
  2: { label: "已拒绝", variant: "destructive" },
};

export default function AdminCommentList() {
  const [pageNum, setPageNum] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [keyword, setKeyword] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data } = useAdminComments({
    pageNum,
    pageSize: 20,
    status: status !== "all" ? Number(status) : undefined,
    keyword: keyword.trim() || undefined,
  });

  const approveComment = useApproveComment();
  const rejectComment = useRejectComment();
  const aiReviewComment = useAiReviewComment();
  const deleteComment = useDeleteComment();

  const comments = data?.list || [];
  const pages = data?.pages || 0;

  const handleDelete = () => {
    if (!deleteId) return;
    deleteComment.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  return (
    <>
      <Helmet>
        <title>评论管理 - Blog Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">评论管理</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="搜索评论..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPageNum(1); }}
              className="w-full sm:w-64"
            />
            <span className="text-sm text-muted-foreground shrink-0">共 {data?.total || 0} 条</span>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["all", "0", "1", "2"].map((s) => (
            <Button
              key={s}
              variant={status === s ? "default" : "outline"}
              size="sm"
              onClick={() => { setStatus(s); setPageNum(1); }}
            >
              {s === "all" ? "全部" : statusMap[Number(s)]?.label}
            </Button>
          ))}
        </div>

        <div className="table-scroll">
        <div className="border rounded-xl overflow-hidden min-w-[720px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>评论者</TableHead>
                <TableHead>内容</TableHead>
                <TableHead className="w-28">所属文章</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-36">时间</TableHead>
                <TableHead className="w-52 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="font-medium">{comment.nickname || "匿名"}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{comment.content}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate" title={comment.postTitle}>
                    {comment.postTitle || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[comment.status || 0]?.variant || "secondary"}>
                      {statusMap[comment.status || 0]?.label || "未知"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString("zh-CN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {comment.status === 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveComment.mutate(comment.id)}
                            title="人工审核：通过"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rejectComment.mutate(comment.id)}
                            title="人工审核：拒绝"
                          >
                            <X className="w-4 h-4 text-orange-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => aiReviewComment.mutate(comment.id, {
                              onSuccess: () => toast.success("AI 审核完成"),
                              onError: () => toast.error("AI 审核失败"),
                            })}
                            title="AI 审核"
                          >
                            <Bot className="w-4 h-4 text-blue-500" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(comment.id)} title="删除">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {comments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {keyword.trim() ? "没有找到匹配的评论" : "暂无评论"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={pageNum <= 1} onClick={() => setPageNum(pageNum - 1)}>
              上一页
            </Button>
            <span className="text-sm text-muted-foreground">{pageNum} / {pages}</span>
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
              <DialogDescription>删除评论后无法恢复，确定吗？</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteComment.isPending}>
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
