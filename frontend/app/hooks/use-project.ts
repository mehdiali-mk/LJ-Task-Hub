import type { CreateProjectFormData } from "@/components/project/create-project";
import { fetchData, postData, patchData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};

export const UseProjectQuery = (projectId: string | null | undefined) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
    enabled: !!projectId,
  });
};

export const UseUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { projectId: string; status: string }) =>
            patchData(`/projects/${data.projectId}`, { status: data.status }),
        onSuccess: (data: any, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["project", variables.projectId],
            });
            queryClient.invalidateQueries({
                queryKey: ["workspace", data.workspace],
            });
        },
    });
};
