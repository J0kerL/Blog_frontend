import { useState } from "react";
import {
  useAdminCategories,
  useAdminCategorySearch,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { CategoryVO, CategoryDTO } from "@/types";

export default function AdminCategoryList() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { data: categories } = useAdminCategories();
  const { data: searchResults } = useAdminCategorySearch(searchKeyword);
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryVO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryDTO>({ name: "", slug: "", description: "", sortOrder: 0 });

  // 根据搜索关键词决定显示哪些数据
  const displayCategories = searchKeyword.trim() ? searchResults : categories;
  const deletingCat = categories?.find((c) => c.id === deleteId);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", sortOrder: 0 });
    setDialogOpen(true);
  };

  const openEdit = (cat: CategoryVO) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, sortOrder: cat.sortOrder });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("名称不能为空");
      return;
    }
    if (editing) {
      updateCat.mutate(
        { id: editing.id, dto: form },
        { onSuccess: () => { toast.success("更新成功"); setDialogOpen(false); } }
      );
    } else {
      createCat.mutate(form, {
        onSuccess: () => { toast.success("创建成功"); setDialogOpen(false); },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCat.mutate(deleteId, {
      onSuccess: () => { toast.success("删除成功"); setDeleteId(null); },
    });
  };

  return (
    <>
      <Helmet>
        <title>分类管理 - Blog Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">分类管理</h1>
          <div className="flex items-center gap-2">
            <Input
              placeholder="搜索分类..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-64"
            />
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              新建分类
            </Button>
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="w-20">文章数</TableHead>
                <TableHead className="w-20">排序</TableHead>
                <TableHead className="w-28 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayCategories?.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {cat.description}
                  </TableCell>
                  <TableCell>{cat.postCount}</TableCell>
                  <TableCell>{cat.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!displayCategories || displayCategories.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchKeyword.trim() ? "没有找到匹配的分类" : "暂无分类"}
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
              <DialogTitle>{editing ? "编辑分类" : "新建分类"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>名称 *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="分类名称"
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
              <div>
                <Label>描述</Label>
                <Textarea
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="分类描述（可选）"
                  rows={2}
                />
              </div>
              <div>
                <Label>排序</Label>
                <Input
                  type="number"
                  value={form.sortOrder || 0}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button onClick={handleSave} disabled={createCat.isPending || updateCat.isPending}>
                {createCat.isPending || updateCat.isPending ? "保存中..." : "保存"}
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
                {deletingCat && deletingCat.postCount > 0
                  ? `该分类下仍有 ${deletingCat.postCount} 篇文章引用，无法删除。请先移除相关文章的分类关联。`
                  : "删除分类后无法恢复，确定吗？"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteCat.isPending || (deletingCat?.postCount ?? 0) > 0}
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
