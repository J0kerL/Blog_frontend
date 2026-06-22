import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface Props {
  /** 滚动超过此像素值时显示按钮，默认 400 */
  threshold?: number;
}

export default function ScrollToTop({ threshold = 400 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={scrollToTop}
      aria-label="回到顶部"
      className={`fixed bottom-8 right-8 z-50 rounded-full shadow-lg h-12 w-12 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
}
