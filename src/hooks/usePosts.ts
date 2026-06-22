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

// ========== 用户文章 Hooks ==========

export function useUserPosts(params: {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}) {
  return useQuery({
    queryKey: ["user-posts", params],
    queryFn: () => postsApi.userList(params),
  });
}

export function useUserPost(id: number | undefined) {
  return useQuery({
    queryKey: ["user-post", id],
    queryFn: () => postsApi.userGetById(id!),
    enabled: !!id,
  });
}

export function useCreateUserPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PostCreateDTO) => postsApi.userCreate(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-posts"] }),
  });
}

export function useUpdateUserPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: PostCreateDTO }) =>
      postsApi.userUpdate(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-posts"] }),
  });
}

export function useUpdateUserPostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      postsApi.userUpdateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-posts"] }),
  });
}

export function useDeleteUserPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postsApi.userDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-posts"] }),
  });
}
