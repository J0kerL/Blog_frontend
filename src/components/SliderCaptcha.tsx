import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Check, RefreshCw } from "lucide-react";
import { authApi } from "@/api/auth";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (token: string, captchaKey: string) => void;
  onVerified?: (token: string, captchaKey: string) => void;
  disabled?: boolean;
}

const DEFAULT_TRACK_WIDTH = 320;
const DEFAULT_SLIDER_WIDTH = 46;

export default function SliderCaptcha({ value, onChange, onVerified, disabled }: Props) {
  const [captchaKey, setCaptchaKey] = useState("");
  const [trackWidth, setTrackWidth] = useState(DEFAULT_TRACK_WIDTH);
  const [sliderWidth, setSliderWidth] = useState(DEFAULT_SLIDER_WIDTH);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);

  const maxOffset = Math.max(trackWidth - sliderWidth, 0);

  const resetCaptcha = async () => {
    setLoading(true);
    setVerified(false);
    setError("");
    setOffset(0);
    currentOffsetRef.current = 0;
    onChange("", "");
    try {
      const data = await authApi.getSliderCaptcha();
      setCaptchaKey(data.captchaKey);
      setTrackWidth(data.trackWidth || DEFAULT_TRACK_WIDTH);
      setSliderWidth(data.sliderWidth || DEFAULT_SLIDER_WIDTH);
    } catch {
      setCaptchaKey("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    resetCaptcha();
  }, []);

  const verify = async (sliderX: number) => {
    if (!captchaKey || verified || loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await authApi.verifySliderCaptcha({ captchaKey, sliderX });
      setVerified(true);
      setOffset(maxOffset);
      currentOffsetRef.current = maxOffset;
      const token = data.captchaToken || "";
      onChange(token, captchaKey);
      onVerified?.(token, captchaKey);
    } catch {
      setError("滑块验证失败，请重试");
      window.setTimeout(resetCaptcha, 500);
    } finally {
      setLoading(false);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || loading || verified) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startXRef.current = event.clientX;
    startOffsetRef.current = offset;
    setDragging(true);
    setError("");
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const next = Math.min(
      Math.max(event.clientX - startXRef.current + startOffsetRef.current, 0),
      maxOffset
    );
    setOffset(next);
    currentOffsetRef.current = next;
  };

  const handlePointerEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (currentOffsetRef.current >= maxOffset - 4) {
      verify(maxOffset);
    } else {
      setOffset(0);
      currentOffsetRef.current = 0;
      setError("请拖动滑块到最右侧");
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "relative h-10 w-full select-none overflow-hidden rounded-xl border bg-muted",
          verified && "border-green-500/60 bg-green-50 dark:bg-green-950/20",
          error && !verified && "border-destructive/60"
        )}
        style={{ maxWidth: trackWidth }}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 bg-primary/15 transition-[width]",
            dragging && "transition-none",
            verified && "bg-green-500/20"
          )}
          style={{ width: `${offset + sliderWidth / 2}px` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {verified ? "验证通过" : loading ? "验证中..." : "拖动滑块完成验证"}
        </div>
        <button
          type="button"
          aria-label="拖动滑块完成验证"
          className={cn(
            "absolute left-0 top-0 z-10 flex h-10 touch-none items-center justify-center rounded-xl border bg-background text-foreground shadow-sm transition-transform",
            dragging && "transition-none",
            verified && "border-green-500 bg-green-500 text-white",
            (disabled || loading) && "cursor-not-allowed opacity-80"
          )}
          style={{ width: sliderWidth, transform: `translateX(${offset}px)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          disabled={disabled || loading || verified}
        >
          {verified ? <Check className="h-4 w-4" /> : loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : ">>"}
        </button>
      </div>
      <div className="flex min-h-4 items-center justify-between text-xs">
        <span className={cn("text-muted-foreground", error && "text-destructive")}>
          {error || (value ? "已完成滑块验证" : "注册前需要先完成验证")}
        </span>
        <button
          type="button"
          className="text-primary hover:underline disabled:pointer-events-none disabled:opacity-60"
          onClick={resetCaptcha}
          disabled={disabled || loading}
        >
          刷新
        </button>
      </div>
    </div>
  );
}
