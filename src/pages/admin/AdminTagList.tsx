import { useState } from "react";
import { useAdminTags, useAdminTagSearch, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import type { TagVO, TagDTO } from "@/types";

export default function AdminTagList() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { data: tags } = useAdminTags();
  const { data: searchResults } = useAdminTagSearch(searchKeyword);
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TagVO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<TagDTO>({ name: "", slug: "" });

  // 根据搜索关键词决定显示哪些数据
  const displayTags = searchKeyword.trim() ? searchResults : tags;
  const deletingTag = tags?.find((t) => t.id === deleteId);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "" });
    setDialogOpen(true);
  };

  const openEdit = (tag: TagVO) => {
    setEditing(tag);
    setForm({ name: tag.name, slug: tag.slug });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("名称不能为空");
      return;
    }
    if (editing) {
      updateTag.mutate(
        { id: editing.id, dto: form },
        { onSuccess: () => { toast.success("更新成功"); setDialogOpen(false); } }
      );
    } else {
      createTag.mutate(form, {
        onSuccess: () => { toast.success("创建成功"); setDialogOpen(false); },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteTag.mutate(deleteId, {
      onSuccess: () => { toast.success("删除成功"); setDeleteId(null); },
    });
  };

  return (
    <>
      <Helmet>
        <title>标签管理 - Blog Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">标签管理</h1>
          <div className="flex items-center gap-2">
            <Input
              placeholder="搜索标签..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-64"
            />
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              新建标签
            </Button>
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-20">文章数</TableHead>
                <TableHead className="w-28 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTags?.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                  <TableCell>{tag.postCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(tag)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(tag.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!displayTags || displayTags.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {searchKeyword.trim() ? "没有找到匹配的标签" : "暂无标签"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create/Edit dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "编辑标签" : "新建标签"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>名称 *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="标签名称"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug || ""}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="URL 别名（可选）"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button onClick={handleSave} disabled={createTag.isPending || updateTag.isPending}>
                {createTag.isPending || updateTag.isPending ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
              <DialogDescription>
                {deletingTag && deletingTag.postCount > 0
                  ? `该标签下仍有 ${deletingTag.postCount} 篇文章引用，无法删除。请先移除相关文章的标签关联。`
                  : "删除标签后无法恢复，确定吗？"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTag.isPending || (deletingTag?.postCount ?? 0) > 0}
              >
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
