import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

const schema = z.object({
  username: z.string().min(3, "用户名至少 3 个字符").max(30),
  password: z.string().min(6, "密码至少 6 个字符").max(50),
  confirmPassword: z.string().min(1, "请确认密码"),
  nickname: z.string().max(50).optional(),
  email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        ...data,
        email: data.email || undefined,
      });
      setAuth(res.token, res.user);
      toast.success("注册成功");
      navigate("/");
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>注册 - Blog</title>
      </Helmet>
      <div className="h-full flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">创建账号</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="username">用户名 *</Label>
                <Input id="username" {...register("username")} placeholder="请输入用户名" />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码 *</Label>
                <Input id="password" type="password" {...register("password")} placeholder="请输入密码" />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码 *</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} placeholder="请再次输入密码" />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input id="nickname" {...register("nickname")} placeholder="请输入昵称（可选）" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" {...register("email")} placeholder="请输入邮箱（可选）" />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                注册
              </Button>
            </form>
            <div className="mt-3 text-center text-sm text-muted-foreground">
              已有账号？{" "}
              <Link to="/login" className="text-primary hover:underline">
                登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
