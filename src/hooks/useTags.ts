import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "@/api/tags";
import type { TagDTO } from "@/types";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsApi.list(),
  });
}

export function useAdminTags() {
  return useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => tagsApi.adminList(),
  });
}

export function useAdminTagSearch(keyword: string) {
  return useQuery({
    queryKey: ["admin-tags", "search", keyword],
    queryFn: () => tagsApi.adminSearch(keyword),
    enabled: keyword.length > 0,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: TagDTO) => tagsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tags"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: TagDTO }) =>
      tagsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tags"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tagsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tags"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
