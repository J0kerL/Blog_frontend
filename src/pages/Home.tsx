import { Link } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FolderOpen, Tags } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useRef } from "react";
import ScrollToTop from "@/components/ScrollToTop";

const TITLE_TEXT = "Welcome to Blog";
const SUBTITLE_TEXT = "分享技术见解，记录编程旅程。探索最新的前端、后端和 AI 技术文章。";

function useHeroAnimation() {
  const [title, setTitle] = useState("");
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const typeTitle = (i: number) => {
    if (i <= TITLE_TEXT.length) {
      setTitle(TITLE_TEXT.slice(0, i));
      timerRef.current = setTimeout(() => typeTitle(i + 1), 90);
    } else {
      // 打字完成，显示副标题
      timerRef.current = setTimeout(() => {
        setSubtitleVisible(true);
        // 副标题展示后停留，然后开始擦除
        timerRef.current = setTimeout(() => {
          setSubtitleVisible(false);
          // 副标题消失后开始擦除标题
          timerRef.current = setTimeout(() => eraseTitle(TITLE_TEXT.length), 300);
        }, 2500);
      }, 300);
    }
  };

  const eraseTitle = (i: number) => {
    if (i > 0) {
      setTitle(TITLE_TEXT.slice(0, i - 1));
      timerRef.current = setTimeout(() => eraseTitle(i - 1), 45);
    } else {
      // 擦除完成，短暂停顿后重新开始
      timerRef.current = setTimeout(() => typeTitle(0), 500);
    }
  };

  useEffect(() => {
    typeTitle(0);
    return clearTimer;
  }, []);

  return { title, subtitleVisible };
}

export default function Home() {
  const { data: postData } = usePosts({ pageNum: 1, pageSize: 6 });
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const { title, subtitleVisible } = useHeroAnimation();

  const posts = postData?.list || [];

  return (
    <>
      <Helmet>
        <title>Blog - 首页</title>
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight min-h-[1.2em]">
            {title}
            <span className="inline-block w-[2px] h-[0.85em] bg-foreground align-middle ml-0.5 animate-pulse" />
          </h1>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed transition-all duration-700 ease-out ${
              subtitleVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
          >
            {SUBTITLE_TEXT}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/posts">
                浏览文章 <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/categories">探索分类</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Latest Posts */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">最新文章</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/posts">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {posts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              暂无文章
            </div>
          )}
        </section>

        {/* Sidebar info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <FolderOpen className="w-5 h-5 text-primary" />
                分类
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories?.map((cat) => (
                  <Link key={cat.id} to={`/posts?categoryId=${cat.id}`}>
                    <Badge variant="secondary" className="hover:bg-primary/10 transition-colors cursor-pointer">
                      {cat.name}
                      <span className="ml-1 text-muted-foreground">({cat.postCount})</span>
                    </Badge>
                  </Link>
                ))}
                {(!categories || categories.length === 0) && (
                  <span className="text-sm text-muted-foreground">暂无分类</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Tags className="w-5 h-5 text-primary" />
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <Link key={tag.id} to={`/posts?tagId=${tag.id}`}>
                    <Badge variant="outline" className="hover:bg-primary/10 transition-colors cursor-pointer">
                      {tag.name}
                      <span className="ml-1 text-muted-foreground">({tag.postCount})</span>
                    </Badge>
                  </Link>
                ))}
                {(!tags || tags.length === 0) && (
                  <span className="text-sm text-muted-foreground">暂无标签</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ScrollToTop />
    </>
  );
}
