import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/api/comments";
import type { CommentCreateDTO } from "@/types";

export function usePostComments(postId: number | undefined) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentsApi.listByPost(postId!),
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CommentCreateDTO) => commentsApi.create(dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}

export function useAdminComments(params: {
  pageNum?: number;
  pageSize?: number;
  postId?: number;
  status?: number;
  keyword?: string;
}) {
  return useQuery({
    queryKey: ["admin-comments", params],
    queryFn: () => commentsApi.adminList(params),
  });
}

export function useApproveComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => commentsApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-comments"] }),
  });
}

export function useRejectComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => commentsApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-comments"] }),
  });
}

export function useAiReviewComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => commentsApi.aiReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-comments"] }),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => commentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-comments"] }),
  });
}
