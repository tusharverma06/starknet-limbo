import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LeaderboardEntry {
  rank: number;
  fid: string;
  username: string;
  pfp: string | null;
  points: number;
  referrals: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  total: number;
}

/**
 * Hook to manage leaderboard data and user rank
 */
export function useLeaderboard(userFid: string | null) {
  const queryClient = useQueryClient();

  // Fetch leaderboard with user rank
  const { data, isLoading, error } = useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", userFid],
    queryFn: async () => {
      const url = userFid
        ? `/api/leaderboard?fid=${userFid}&limit=100`
        : `/api/leaderboard?limit=100`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      return response.json();
    },
    enabled: !!userFid,
    staleTime: 30000, // 30 seconds
  });

  // Process referral mutation
  const processReferralMutation = useMutation({
    mutationFn: async ({
      fid,
      referrerFid,
    }: {
      fid: string;
      referrerFid: string;
    }) => {
      const response = await fetch("/api/referral/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid, referrerFid }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process referral");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate leaderboard and tasks to refresh data
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    leaderboard: data?.leaderboard || [],
    userRank: data?.userRank,
    totalPlayers: data?.total || 0,
    isLoading,
    error: error as Error | null,
    processReferral: processReferralMutation.mutateAsync,
  };
}
