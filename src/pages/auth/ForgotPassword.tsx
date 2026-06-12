import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/api/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CaptchaInput from "@/components/CaptchaInput";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("请输入正确的邮箱地址"),
  newPassword: z.string().min(6, "密码至少 6 个字符").max(50, "密码最多 50 个字符"),
  confirmPassword: z.string().min(1, "请确认新密码"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaRefresh, setCaptchaRefresh] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!captchaKey || !captchaCode) {
      toast.error("请完成验证码");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword({
        email: data.email,
        captchaKey,
        captchaCode,
        newPassword: data.newPassword,
      });
      toast.success("密码重置成功，请使用新密码登录");
      navigate("/login");
    } catch {
      setCaptchaRefresh((v) => v + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>忘记密码 - Blog</title>
      </Helmet>
      <div className="h-full flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">忘记密码</CardTitle>
            <CardDescription>输入注册邮箱和新密码来重置您的密码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">注册邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="请输入注册时使用的邮箱"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register("newPassword")}
                  placeholder="请输入新密码"
                />
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="请再次输入新密码"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>验证码</Label>
                <CaptchaInput
                  captchaKey={captchaKey}
                  onCaptchaKeyChange={setCaptchaKey}
                  captchaCode={captchaCode}
                  onCaptchaCodeChange={setCaptchaCode}
                  refreshTrigger={captchaRefresh}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                重置密码
              </Button>
            </form>
            <div className="mt-3 text-center text-sm text-muted-foreground">
              想起密码了？{" "}
              <Link to="/login" className="text-primary hover:underline">
                返回登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
