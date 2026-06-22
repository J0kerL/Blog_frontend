import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>页面不存在 - Blog</title>
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-6xl sm:text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
          页面不存在
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          抱歉，您访问的页面可能已被删除、重命名或暂时不可用。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" onClick={() => window.history.back()}>
            <span>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回上一页
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
