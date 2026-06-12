import { useState } from "react";
import { usePostComments, useCreateComment } from "@/hooks/useComments";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Reply, ChevronDown, ChevronUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { CommentVO } from "@/types";

/** 递归统计评论下所有子孙回复总数 */
function countAllDescendants(c: CommentVO): number {
  const directReplies = c.replies || [];
  return directReplies.reduce((sum, reply) => sum + 1 + countAllDescendants(reply), 0);
}

interface Props {
  postId: number;
  allowComment?: number;
}

function CommentItem({ comment, postId, depth = 0 }: { comment: CommentVO; postId: number; depth?: number }) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showAllReplies, setShowAllReplies] = useState(false);
  const { user } = useAuthStore();
  const createComment = useCreateComment();

  const MAX_VISIBLE_REPLIES = 3;
  const replies = comment.replies || [];
  const totalDescendants = countAllDescendants(comment);
  // 子孙总数超过阈值时触发折叠：折叠状态下仅显示直接回复（隐藏嵌套），展开后显示完整子树
  const shouldCollapse = totalDescendants > MAX_VISIBLE_REPLIES;
  const visibleDirectReplies = shouldCollapse && !showAllReplies
    ? replies.slice(0, MAX_VISIBLE_REPLIES).map(r => ({ ...r, replies: [] }))  // 折叠时清空子回复
    : replies;
  const hiddenCount = shouldCollapse && !showAllReplies ? totalDescendants : 0;

  const handleReply = () => {
    if (!replyContent.trim()) return;
    createComment.mutate(
      {
        postId,
        parentId: comment.id,
        content: replyContent,
        ...(user ? {} : { nickname: "匿名用户" }),
      },
      {
        onSuccess: () => {
          setReplyContent("");
          setShowReply(false);
          toast.success("回复成功");
        },
      }
    );
  };

  return (
    <div className={depth > 0 ? "ml-10 mt-3" : ""}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={comment.avatar} />
          <AvatarFallback className="text-xs">
            {(comment.nickname || "A")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{comment.nickname || "匿名"}</span>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          {depth < 4 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="w-3 h-3" />
              回复
            </button>
          )}
          {showReply && (
            <div className="mt-2 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }
                }}
                placeholder="写下你的回复... (Enter 发送，Shift+Enter 换行)"
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={createComment.isPending}>
                  发送
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReply(false)}>
                  取消
                </Button>
              </div>
            </div>
          )}
          {visibleDirectReplies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
          ))}
          {!showAllReplies && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllReplies(true)}
              className="flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ChevronDown className="w-3 h-3" />
              {depth === 0 ? `展开全部 ${hiddenCount} 条回复` : `展开其余 ${hiddenCount} 条回复`}
            </button>
          )}
          {showAllReplies && shouldCollapse && (
            <button
              onClick={() => setShowAllReplies(false)}
              className="flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ChevronUp className="w-3 h-3" />
              收起回复
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId, allowComment = 1 }: Props) {
  const { data: comments } = usePostComments(postId);
  const createComment = useCreateComment();
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    createComment.mutate(
      {
        postId,
        content,
        ...(user ? {} : { nickname: nickname || "匿名用户" }),
      },
      {
        onSuccess: () => {
          setContent("");
          toast.success("评论成功，等待审核");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        评论 ({comments?.length || 0})
      </h3>

      {/* New comment */}
      <div className="space-y-3 p-4 rounded-xl bg-muted/50">
        {!user && allowComment !== 0 && (
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="你的昵称"
            className="max-w-xs"
          />
        )}
        <Textarea
          value={allowComment === 0 ? "" : content}
          onChange={(e) => allowComment !== 0 && setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && allowComment !== 0) { e.preventDefault(); handleSubmit(); }
          }}
          placeholder={allowComment === 0 ? "作者已关闭评论功能" : (user ? "写下你的评论... (Enter 发送，Shift+Enter 换行)" : "登录后评论，或填写昵称后匿名评论...")}
          rows={3}
          disabled={allowComment === 0}
          className={allowComment === 0 ? "cursor-not-allowed opacity-70" : ""}
        />
        <Button onClick={handleSubmit} disabled={allowComment === 0 || createComment.isPending || !content.trim()}>
          {createComment.isPending ? "发送中..." : "发表评论"}
        </Button>
      </div>

      {/* Comment list */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
        {comments?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            暂无评论，来抢沙发吧~
          </p>
        )}
      </div>
    </div>
  );
}
