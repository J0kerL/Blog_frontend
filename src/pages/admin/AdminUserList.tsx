import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ShieldCheck, ShieldOff, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import type { AdminUserVO } from "@/types";

export default function AdminUserList() {
  const queryClient = useQueryClient();
  const [pageNum, setPageNum] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  // 确认对话框状态
  const [confirmAction, setConfirmAction] = useState<{
    user: AdminUserVO;
    type: "status" | "role";
    value: number | string;
    label: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", { pageNum, keyword, role, status }],
    queryFn: () =>
      userApi.adminList({
        pageNum,
        pageSize: 10,
        keyword: keyword || undefined,
        role: role !== "all" ? role : undefined,
        status: status !== "all" ? Number(status) : undefined,
      }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      userApi.adminUpdateStatus(id, status),
    onSuccess: () => {
      toast.success("状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setConfirmAction(null);
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      userApi.adminUpdateRole(id, role),
    onSuccess: () => {
      toast.success("角色更新成功");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setConfirmAction(null);
    },
  });

  const users = data?.list || [];
  const pages = data?.pages || 0;

  const hasFilters = keyword !== "" || role !== "all" || status !== "all";

  const handleReset = () => {
    setKeyword("");
    setRole("all");
    setStatus("all");
    setPageNum(1);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "status") {
      updateStatus.mutate({ id: confirmAction.user.id, status: confirmAction.value as number });
    } else {
      updateRole.mutate({ id: confirmAction.user.id, role: confirmAction.value as string });
    }
  };

  return (
    <>
      <Helmet>
        <title>用户管理 - Blog Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPageNum(1); }}
              placeholder="搜索用户名或昵称..."
              className="pl-9"
            />
          </div>
          <Select value={role} onValueChange={(v) => { setRole(v); setPageNum(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部角色</SelectItem>
              <SelectItem value="ROLE_USER">普通用户</SelectItem>
              <SelectItem value="ROLE_ADMIN">管理员</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPageNum(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="1">正常</SelectItem>
              <SelectItem value="0">禁用</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1.5" />
              重置
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">头像</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>昵称</TableHead>
                <TableHead className="hidden md:table-cell">邮箱</TableHead>
                <TableHead className="w-24">角色</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-36 hidden md:table-cell">注册时间</TableHead>
                <TableHead className="w-36 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Avatar className="w-8 h-8">
                      {u.avatar ? (
                        <AvatarImage src={u.avatar} alt={u.nickname || u.username} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {(u.nickname || u.username)[0].toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell className="text-muted-foreground">{u.nickname || "-"}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{u.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ROLE_ADMIN" ? "default" : "secondary"}>
                      {u.role === "ROLE_ADMIN" ? "管理员" : "用户"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === 1 ? "default" : "destructive"}>
                      {u.status === 1 ? "正常" : "禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {u.status === 1 ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="禁用用户"
                          onClick={() =>
                            setConfirmAction({
                              user: u,
                              type: "status",
                              value: 0,
                              label: `确定要禁用用户「${u.nickname || u.username}」吗？`,
                            })
                          }
                        >
                          <ShieldOff className="w-4 h-4 text-destructive" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="启用用户"
                          onClick={() =>
                            setConfirmAction({
                              user: u,
                              type: "status",
                              value: 1,
                              label: `确定要启用用户「${u.nickname || u.username}」吗？`,
                            })
                          }
                        >
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Select
                        value={u.role}
                        onValueChange={(v) => {
                          if (v !== u.role) {
                            setConfirmAction({
                              user: u,
                              type: "role",
                              value: v,
                              label: `确定要将「${u.nickname || u.username}」的角色改为「${v === "ROLE_ADMIN" ? "管理员" : "普通用户"}」吗？`,
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ROLE_USER">用户</SelectItem>
                          <SelectItem value="ROLE_ADMIN">管理员</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {isLoading ? "加载中..." : "暂无用户"}
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

        {/* Confirm dialog */}
        <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认操作</DialogTitle>
              <DialogDescription>{confirmAction?.label}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>取消</Button>
              <Button
                onClick={handleConfirm}
                disabled={updateStatus.isPending || updateRole.isPending}
              >
                {(updateStatus.isPending || updateRole.isPending) ? "处理中..." : "确认"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
