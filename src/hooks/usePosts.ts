import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import type { PostCreateDTO } from "@/types";

export function usePosts(params: {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  tagId?: number;
}) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => postsApi.list(params),
  });
}

export function usePost(id: number | undefined) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.getById(id!),
    enabled: !!id,
  });
}

export function usePostBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => postsApi.getBySlug(slug!),
    enabled: !!slug,
  });
}

export function useAdminPosts(params: {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
  categoryId?: number;
}) {
  return useQuery({
    queryKey: ["admin-posts", params],
    queryFn: () => postsApi.adminList(params),
  });
}

export function useAdminPost(id: number | undefined) {
  return useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => postsApi.adminGetById(id!),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PostCreateDTO) => postsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: PostCreateDTO }) =>
      postsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
  });
}

export function useUpdatePostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      postsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
  });
}
