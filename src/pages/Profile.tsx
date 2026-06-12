import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userApi } from "@/api/user";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Loader2, Camera, User } from "lucide-react";
import type { UserVO } from "@/types";

// ========== 基本信息 Schema ==========
const profileSchema = z.object({
  nickname: z.string().min(1, "昵称不能为空").max(50, "昵称最长 50 个字符"),
  email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
  bio: z.string().max(500, "简介最长 500 个字符").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ========== 修改密码 Schema ==========
const passwordSchema = z.object({
  oldPassword: z.string().min(1, "请输入旧密码"),
  newPassword: z.string().min(6, "密码至少 6 个字符").max(50, "密码最多 50 个字符"),
  confirmPassword: z.string().min(1, "请确认新密码"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<UserVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 基本信息表单
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // 密码表单
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // 加载个人信息
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await userApi.getProfile();
        setProfile(data);
        profileForm.reset({
          nickname: data.nickname,
          email: data.email || "",
          bio: data.bio || "",
        });
      } catch {
        toast.error("加载个人信息失败");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 上传头像
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过 5MB");
      return;
    }
    setUploadingAvatar(true);
    try {
      const avatarUrl = await userApi.uploadAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatar: avatarUrl } : prev);
      updateUser({ avatar: avatarUrl });
      toast.success("头像更新成功");
    } catch {
      toast.error("头像上传失败");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // 保存基本信息
  const onProfileSubmit = async (data: ProfileFormData) => {
    setSavingProfile(true);
    try {
      const updated = await userApi.updateProfile({
        nickname: data.nickname,
        email: data.email || undefined,
        bio: data.bio || undefined,
      });
      setProfile(updated);
      updateUser({ nickname: updated.nickname, email: updated.email, bio: updated.bio });
      toast.success("信息更新成功");
    } catch {
      // handled by interceptor
    } finally {
      setSavingProfile(false);
    }
  };

  // 修改密码
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setSavingPassword(true);
    try {
      await userApi.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("密码修改成功");
      passwordForm.reset();
    } catch {
      // handled by interceptor
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet><title>个人中心 - Blog</title></Helmet>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!profile) return null;

  const displayName = profile.nickname || profile.username;
  const initial = displayName[0]?.toUpperCase() || "?";

  return (
    <>
      <Helmet><title>个人中心 - Blog</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">个人中心</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-1.5" />
              基本信息
            </TabsTrigger>
            <TabsTrigger value="password">修改密码</TabsTrigger>
          </TabsList>

          {/* ========== 基本信息 ========== */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">个人信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 头像区域 */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    {profile.avatar ? (
                      <AvatarImage src={profile.avatar} alt={displayName} />
                    ) : (
                      <AvatarFallback className="text-xl">{initial}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 mr-1.5" />
                      )}
                      {uploadingAvatar ? "上传中..." : "更换头像"}
                    </Button>
                    <span className="text-xs text-muted-foreground">支持 JPG、PNG，最大 5MB</span>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <Separator />

                {/* 基本信息表单 */}
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>用户名</Label>
                    <Input value={profile.username} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">用户名不可修改</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nickname">昵称</Label>
                    <Input
                      id="nickname"
                      {...profileForm.register("nickname")}
                      placeholder="请输入昵称"
                    />
                    {profileForm.formState.errors.nickname && (
                      <p className="text-xs text-destructive">
                        {profileForm.formState.errors.nickname.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register("email")}
                      placeholder="请输入邮箱"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">个人简介</Label>
                    <Textarea
                      id="bio"
                      {...profileForm.register("bio")}
                      placeholder="介绍一下自己吧"
                      rows={3}
                    />
                    {profileForm.formState.errors.bio && (
                      <p className="text-xs text-destructive">
                        {profileForm.formState.errors.bio.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    保存修改
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== 修改密码 ========== */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">修改密码</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">当前密码</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      {...passwordForm.register("oldPassword")}
                      placeholder="请输入当前密码"
                    />
                    {passwordForm.formState.errors.oldPassword && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.oldPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密码</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register("newPassword")}
                      placeholder="请输入新密码"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                      placeholder="请再次输入新密码"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={savingPassword}>
                    {savingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    确认修改
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
