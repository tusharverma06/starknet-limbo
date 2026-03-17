import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStarknet } from "@/components/providers/StarknetProvider";

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
  referralCount: number;
  user: {
    address: string;
  };
}

/**
 * Fetch tasks for the current user
 */
const fetchTasks = async (
  address: string
): Promise<TasksResponse> => {
  const response = await fetch(
    `/api/tasks?address=${address}`,
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
const completeTask = async (address: string, taskId: string) => {
  const response = await fetch("/api/tasks/complete", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, taskId }),
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
  const { address } = useStarknet();
  const queryClient = useQueryClient();

  // Fetch tasks query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tasks", address],
    queryFn: () => fetchTasks(address!),
    enabled: !!address,
    staleTime: 30000, // 30 seconds
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) =>
      completeTask(address!, taskId),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks", address] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<TasksResponse>(["tasks", address]);

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<TasksResponse>(["tasks", address], {
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
      queryClient.setQueryData<TasksResponse>(["tasks", address], (old) =>
        old ? { ...old, totalPoints: data.totalPoints } : old
      );
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["tasks", address], context.previous);
      }
    },
  });

  return {
    tasks: data?.tasks || [],
    totalPoints: data?.totalPoints || 0,
    referralCount: data?.referralCount || 0,
    user: data?.user,
    isLoading,
    error: error as Error | null,
    refetch,
    completeTask: completeTaskMutation.mutateAsync,
    isCompletingTask: completeTaskMutation.isPending,
  };
}
