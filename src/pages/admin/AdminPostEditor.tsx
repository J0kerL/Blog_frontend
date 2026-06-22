import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Send, X, Plus } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAdminCategories } from "@/hooks/useCategories";
import { useAdminPost, useCreatePost, useUpdatePost } from "@/hooks/usePosts";
import { useAdminTags } from "@/hooks/useTags";

const schema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  slug: z.string().max(200).optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(1, "内容不能为空"),
  coverImage: z.string().optional(),
  status: z.number(),
  isTop: z.number(),
  allowComment: z.number(),
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
  newCategoryNames: z.array(z.string()).optional(),
  newTagNames: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existingPost } = useAdminPost(isEdit ? Number(id) : undefined);
  const { data: categories } = useAdminCategories();
  const { data: tags } = useAdminTags();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      content: "",
      coverImage: "",
      status: 0,
      isTop: 0,
      allowComment: 1,
      categoryIds: [],
      tagIds: [],
    },
  });

  const coverImage = watch("coverImage");
  const selectedCategoryIds = watch("categoryIds") || [];
  const selectedTagIds = watch("tagIds") || [];

  const [newCategoryNames, setNewCategoryNames] = useState<string[]>([]);
  const [newTagNames, setNewTagNames] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  const addNewCategory = () => {
    const name = newCatInput.trim();
    if (name && !newCategoryNames.includes(name)) {
      setNewCategoryNames([...newCategoryNames, name]);
      setNewCatInput("");
    }
  };

  const addNewTag = () => {
    const name = newTagInput.trim();
    if (name && !newTagNames.includes(name)) {
      setNewTagNames([...newTagNames, name]);
      setNewTagInput("");
    }
  };

  const removeNewCategory = (name: string) => {
    setNewCategoryNames(newCategoryNames.filter((n) => n !== name));
  };

  const removeNewTag = (name: string) => {
    setNewTagNames(newTagNames.filter((n) => n !== name));
  };

  useEffect(() => {
    if (!existingPost) return;

    reset({
      title: existingPost.title,
      slug: existingPost.slug,
      summary: existingPost.summary,
      content: existingPost.content,
      coverImage: existingPost.coverImage,
      status: existingPost.status,
      isTop: existingPost.isTop,
      allowComment: existingPost.allowComment,
      categoryIds: existingPost.categories?.map((category) => category.id) || [],
      tagIds: existingPost.tags?.map((tag) => tag.id) || [],
    });
  }, [existingPost, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      newCategoryNames: newCategoryNames.length > 0 ? newCategoryNames : undefined,
      newTagNames: newTagNames.length > 0 ? newTagNames : undefined,
    };
    if (isEdit) {
      updatePost.mutate(
        { id: Number(id), dto: payload },
        {
          onSuccess: () => {
            toast.success("更新成功");
            navigate("/admin/posts");
          },
        }
      );
      return;
    }

    createPost.mutate(payload, {
      onSuccess: () => {
        toast.success("创建成功");
        navigate("/admin/posts");
      },
    });
  };

  const submitWithStatus = (status?: number) => {
    handleSubmit((data) => onSubmit(status === undefined ? data : { ...data, status }))();
  };

  const handleSave = () => {
    submitWithStatus(isEdit ? undefined : 0);
  };

  const handlePublish = () => {
    submitWithStatus(1);
  };

  const handleOptionChange = (fieldName: "isTop" | "allowComment", value: number) => {
    setValue(fieldName, value, { shouldDirty: true });
  };

  const toggleCategory = (categoryId: number) => {
    const current = selectedCategoryIds;
    setValue(
      "categoryIds",
      current.includes(categoryId) ? current.filter((item) => item !== categoryId) : [...current, categoryId],
      { shouldDirty: true }
    );
  };

  const toggleTag = (tagId: number) => {
    const current = selectedTagIds;
    setValue(
      "tagIds",
      current.includes(tagId) ? current.filter((item) => item !== tagId) : [...current, tagId],
      { shouldDirty: true }
    );
  };

  const saving = createPost.isPending || updatePost.isPending;

  return (
    <>
      <Helmet>
        <title>{isEdit ? "编辑文章" : "新建文章"} - Blog Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/posts")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{isEdit ? "编辑文章" : "新建文章"}</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
              <Save className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{isEdit ? "保存修改" : "存为草稿"}</span>
              <span className="sm:hidden">保存</span>
            </Button>
            <Button onClick={handlePublish} disabled={saving} className="flex-1 sm:flex-none">
              <Send className="w-4 h-4 sm:mr-2" />
              <span>{saving ? "保存中..." : "发布"}</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6 min-w-0">
            <div>
              <Input
                {...register("title")}
                placeholder="文章标题"
                className="text-xl font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0"
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground shrink-0">Slug:</Label>
              <Input {...register("slug")} placeholder="自动生成" className="h-8 text-sm" />
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">摘要</Label>
              <Textarea
                {...register("summary")}
                placeholder="文章摘要（可选，用于列表展示和 SEO）"
                rows={2}
                className="text-sm"
              />
            </div>

            <div>
              <Controller
                name="content"
                control={control}
                render={({ field }) => <MarkdownEditor value={field.value} onChange={field.onChange} height={600} />}
              />
              {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
            </div>
          </div>

          <div className="w-full lg:w-80 lg:shrink-0 space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">封面图片</Label>
              <ImageUploader value={coverImage} onChange={(url) => setValue("coverImage", url, { shouldDirty: true })} />
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-2 block">分类</Label>
              <div className="flex flex-wrap gap-1.5">
                {categories?.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategoryIds.includes(category.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                    {selectedCategoryIds.includes(category.id) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
                {newCategoryNames.map((name) => (
                  <Badge key={`new-${name}`} variant="default" className="bg-green-600 hover:bg-green-700">
                    {name}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeNewCategory(name)} />
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Input
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNewCategory(); } }}
                  placeholder="新建分类..."
                  className="h-7 text-xs flex-1"
                />
                <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={addNewCategory}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-2 block">标签</Label>
              <div className="flex flex-wrap gap-1.5">
                {tags?.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                    {selectedTagIds.includes(tag.id) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
                {newTagNames.map((name) => (
                  <Badge key={`new-${name}`} variant="default" className="bg-green-600 hover:bg-green-700">
                    {name}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeNewTag(name)} />
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNewTag(); } }}
                  placeholder="新建标签..."
                  className="h-7 text-xs flex-1"
                />
                <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={addNewTag}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium block">选项</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">置顶</span>
                <Controller
                  name="isTop"
                  control={control}
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={(value) => handleOptionChange("isTop", Number(value))}>
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">否</SelectItem>
                        <SelectItem value="1">是</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">允许评论</span>
                <Controller
                  name="allowComment"
                  control={control}
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={(value) => handleOptionChange("allowComment", Number(value))}>
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">是</SelectItem>
                        <SelectItem value="0">否</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
