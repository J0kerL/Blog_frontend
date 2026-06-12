import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/auth";
import { RefreshCw } from "lucide-react";
import type { CaptchaVO } from "@/types";

interface Props {
  captchaKey: string;
  onCaptchaKeyChange: (key: string) => void;
  captchaCode: string;
  onCaptchaCodeChange: (code: string) => void;
  /** 外部递增此值可触发验证码自动刷新 */
  refreshTrigger?: number;
}

export default function CaptchaInput({
  captchaKey,
  onCaptchaKeyChange,
  captchaCode,
  onCaptchaCodeChange,
  refreshTrigger,
}: Props) {
  const [captcha, setCaptcha] = useState<CaptchaVO | null>(null);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  const fetchCaptcha = async () => {
    setLoading(true);
    try {
      const data = await authApi.getCaptcha();
      setCaptcha(data);
      onCaptchaKeyChange(data.captchaKey);
      onCaptchaCodeChange("");
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (refreshTrigger !== undefined) {
      fetchCaptcha();
    }
  }, [refreshTrigger]);

  return (
    <div className="flex gap-2">
      <Input
        value={captchaCode}
        onChange={(e) => onCaptchaCodeChange(e.target.value)}
        placeholder="验证码"
        className="flex-1"
        maxLength={6}
      />
      <div
        className="shrink-0 h-9 w-24 rounded-xl border overflow-hidden cursor-pointer bg-muted flex items-center justify-center"
        onClick={fetchCaptcha}
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : captcha?.captchaImage ? (
          <img
            src={captcha.captchaImage}
            alt="captcha"
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-xs text-muted-foreground">获取验证码</span>
        )}
      </div>
    </div>
  );
}
