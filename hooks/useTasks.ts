import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFarcaster } from "./useFarcaster";

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  action: string;
  completed: boolean;
  completedAt: string | null;
}

interface TasksResponse {
  tasks: Task[];
  totalPoints: number;
  user: {
    fid: string;
    username: string;
    pfp: string | null;
  };
}

/**
 * Fetch tasks for the current user
 */
const fetchTasks = async (
  fid: string,
  username: string,
  pfp: string
): Promise<TasksResponse> => {
  const response = await fetch(
    `/api/tasks?fid=${fid}&username=${username}&pfp=${pfp}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to fetch tasks",
    }));
    throw new Error(error.error || "Failed to fetch tasks");
  }

  return response.json();
};

/**
 * Complete a task
 */
const completeTask = async (fid: string, taskId: string) => {
  const response = await fetch("/api/tasks/complete", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fid, taskId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to complete task");
  }

  return response.json();
};

/**
 * Complete add miniapp task
 */
const completeAddMiniapp = async (
  fid: string,
  url: string,
  token: string
) => {
  const response = await fetch("/api/tasks/add-miniapp", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fid, url, token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to complete task");
  }

  return response.json();
};

/**
 * Hook to manage tasks
 */
export function useTasks() {
  const { user } = useFarcaster();
  const queryClient = useQueryClient();

  const fid = user?.fid?.toString();
  const username = user?.username || "anonymous";
  const pfp = user?.pfpUrl || "";

  // Fetch tasks query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tasks", fid],
    queryFn: () => fetchTasks(fid!, username, pfp),
    enabled: !!fid,
    staleTime: 30000, // 30 seconds
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      completeTask(fid!, taskId),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks", fid] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<TasksResponse>(["tasks", fid]);

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<TasksResponse>(["tasks", fid], {
          ...previous,
          tasks: previous.tasks.map((t) =>
            t.id === variables.taskId
              ? { ...t, completed: true, completedAt: new Date().toISOString() }
              : t
          ),
        });
      }

      return { previous };
    },
    onSuccess: (data) => {
      // Update with server data
      queryClient.setQueryData<TasksResponse>(["tasks", fid], (old) =>
        old ? { ...old, totalPoints: data.totalPoints } : old
      );
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["tasks", fid], context.previous);
      }
    },
  });

  // Complete add miniapp mutation
  const completeMiniappMutation = useMutation({
    mutationFn: ({ url, token }: { url: string; token: string }) =>
      completeAddMiniapp(fid!, url, token),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["tasks", fid] });
      const previous = queryClient.getQueryData<TasksResponse>(["tasks", fid]);

      if (previous) {
        queryClient.setQueryData<TasksResponse>(["tasks", fid], {
          ...previous,
          tasks: previous.tasks.map((t) =>
            t.id === "add_miniapp"
              ? { ...t, completed: true, completedAt: new Date().toISOString() }
              : t
          ),
        });
      }

      return { previous };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<TasksResponse>(["tasks", fid], (old) =>
        old ? { ...old, totalPoints: data.totalPoints } : old
      );
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks", fid], context.previous);
      }
    },
  });

  return {
    tasks: data?.tasks || [],
    totalPoints: data?.totalPoints || 0,
    user: data?.user,
    isLoading,
    error: error as Error | null,
    refetch,
    completeTask: completeTaskMutation.mutateAsync,
    completeMiniapp: completeMiniappMutation.mutateAsync,
    isCompletingTask:
      completeTaskMutation.isPending || completeMiniappMutation.isPending,
  };
}
