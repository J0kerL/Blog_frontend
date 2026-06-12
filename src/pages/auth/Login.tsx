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
import CaptchaInput from "@/components/CaptchaInput";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

const schema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
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
      const res = await authApi.login({
        ...data,
        captchaKey,
        captchaCode,
      });
      setAuth(res.token, res.user);
      toast.success("登录成功");
      if (res.user.role === "ROLE_ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
      setCaptchaRefresh((v) => v + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>登录 - Blog</title>
      </Helmet>
      <div className="h-full flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" {...register("username")} placeholder="请输入用户名" />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" {...register("password")} placeholder="请输入密码" />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
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
                登录
              </Button>
            </form>
            <div className="mt-3 text-sm text-muted-foreground flex items-center justify-between">
              <Link to="/forgot-password" className="text-primary hover:underline">
                忘记密码？
              </Link>
              <span>
                还没有账号？{" "}
                <Link to="/register" className="text-primary hover:underline">
                  注册
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
