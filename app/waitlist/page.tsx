"use client";

import { useTasks } from "@/hooks/useTasks";
import { useFarcaster } from "@/hooks/useFarcaster";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useReferralProcessor } from "@/hooks/useReferralProcessor";
import sdk from "@farcaster/miniapp-sdk";
import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { LeaderboardDrawer } from "@/components/ui/LeaderboardDrawer";
import { Trophy } from "lucide-react";

export default function WaitlistPage() {
  const { user } = useFarcaster();
  const userFid = user?.fid?.toString() || null;

  const {
    tasks,
    totalPoints,
    referralCount,
    isLoading,
    error,
    completeTask,
    completeMiniapp,
    isCompletingTask,
  } = useTasks();

  const { userRank, processReferral } = useLeaderboard(userFid);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Auto-process referral from URL
  useReferralProcessor(userFid, processReferral);

  const handleAddToFarcaster = useCallback(async () => {
    const result = await sdk.actions.addMiniApp();
    if (result === null) return;

    await completeMiniapp({
      url: result.notificationDetails?.url || "",
      token: result.notificationDetails?.token || "",
    });
  }, [completeMiniapp]);

  const handleReferral = useCallback(() => {
    if (!userFid) return;

    const referralUrl = `${window.location.origin}/waitlist?ref=${userFid}`;
    const text = `Join me on Based Limbo! 🎲 ${referralUrl}`;
    const composeUrl = `https://farcaster.xyz/~/compose?text=${encodeURIComponent(
      text
    )}`;

    window.open(composeUrl, "_blank");
  }, [userFid]);

  const handleTaskClick = useCallback(
    async (task: { id: string; completed: boolean; action: string }) => {
      if (task.completed || isCompletingTask) return;

      if (task.id === "add_miniapp") {
        await handleAddToFarcaster();
        return;
      }

      if (task.id === "referral") {
        handleReferral();
        return;
      }

      if (task.action.startsWith("http")) {
        window.open(task.action, "_blank");
      }

      await completeTask({ taskId: task.id });
    },
    [completeTask, handleAddToFarcaster, handleReferral, isCompletingTask]
  );

  const completedCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );

  const getTaskButtonState = useCallback(
    (task: { id: string; completed: boolean }) => {
      const isReferralTask = task.id === "referral";
      const isMaxedOut = isReferralTask && referralCount >= 50;
      const isCompleted = isReferralTask ? isMaxedOut : task.completed;

      return {
        isDisabled: isCompleted || isCompletingTask,
        className: isCompleted
          ? "bg-[#1ec460] text-white cursor-default"
          : "bg-[#2574ff] text-white hover:bg-[#1e5dd1] active:translate-y-0.5",
        label: isCompleted
          ? "✓"
          : isReferralTask
          ? "Share"
          : isCompletingTask
          ? "..."
          : "Go",
      };
    },
    [referralCount, isCompletingTask]
  );

  return (
    <div className="min-h-screen bg-[#cfd9ff]">
      <div className="max-w-md mx-auto flex flex-col min-h-screen">
        {/* Header */}
        <div className="mt-2 mx-2 bg-[#2574ff] border-2 border-black rounded-xl h-[53px] flex items-center justify-center px-2 shadow-[0px_2px_0px_0px_#000000]">
          <Image
            src="/logo.png"
            alt="Based Limbo"
            width={32}
            height={32}
            className="mr-2 rounded-full"
          />
          <h1
            className="text-[24px] font-bold text-white leading-[0.9]"
            style={{
              fontFamily: "var(--font-lilita-one)",
              textShadow: "0px 2px 0px #000000",
            }}
          >
            Based Limbo
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-2 p-2 flex-1">
          {/* Rank & Points Button */}
          {userFid && (
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="bg-white border-2 border-black rounded-xl p-4 shadow-[0px_2px_0px_0px_#000000] hover:bg-gray-50 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user?.pfpUrl && (
                    <Image
                      src={user?.pfpUrl}
                      alt="Trophy"
                      width={30}
                      height={30}
                      className="rounded-full"
                      loader={({ src }) => src}
                    />
                  )}
                  <div className="text-left">
                    <p
                      className="text-[18px] text-black leading-none"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      @{user?.username}
                    </p>
                    <p className="text-[12px] text-gray-600">
                      {totalPoints.toLocaleString()} points
                    </p>
                  </div>
                </div>
                <div
                  className="text-sm text-[#2574ff] flex flex-col items-end justify-start gap-2"
                  style={{ fontFamily: "var(--font-lilita-one)" }}
                >
                  <p
                    className="text-sm text-black leading-none"
                    style={{ fontFamily: "var(--font-lilita-one)" }}
                  >
                    Rank #{userRank || "—"}
                  </p>
                  <span>View Leaderboard →</span>
                </div>
              </div>
            </button>
          )}

          {/* Progress Bar */}
          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[0px_2px_0px_0px_#000000]">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-[18px] text-black leading-[1.2]"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Complete Tasks
              </p>
              <p
                className="text-[18px] text-[#2574ff] leading-[1.2]"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                {completedCount}/{tasks.length}
              </p>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
              <div
                className="h-full bg-[#1ec460] transition-all duration-500"
                style={{
                  width: `${
                    tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Tasks List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#2574ff] border-t-transparent"></div>
              <p className="text-gray-600 mt-2">Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6 shadow-[0px_2px_0px_0px_#000000] text-center">
              <p className="text-red-600 font-medium">{error.message}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white border-2 border-black rounded-xl p-4 shadow-[0px_2px_0px_0px_#000000] ${
                    task.completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.icon.startsWith("/") ? (
                      <Image
                        src={task.icon}
                        alt={task.title}
                        width={32}
                        height={32}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="text-3xl">{task.icon}</div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-[18px] text-black leading-[1.2]"
                          style={{ fontFamily: "var(--font-lilita-one)" }}
                        >
                          {task.title}
                        </h3>
                        {task.id === "referral" ? (
                          <span
                            className="text-[14px] text-[#2574ff] leading-[1.2]"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            {referralCount}/50
                          </span>
                        ) : (
                          <span
                            className="text-[14px] text-[#2574ff] leading-[1.2]"
                            style={{ fontFamily: "var(--font-lilita-one)" }}
                          >
                            +{task.points}
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-gray-600 leading-[1.2]">
                        {task.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleTaskClick(task)}
                      disabled={getTaskButtonState(task).isDisabled}
                      className={`border-2 border-black rounded-lg px-4 py-2 transition-all ${
                        getTaskButtonState(task).className
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_2px_0px_0px_#000000] active:shadow-none`}
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      <span className="text-[14px]">
                        {getTaskButtonState(task).label}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Drawer */}
      <LeaderboardDrawer
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        userFid={userFid}
      />
    </div>
  );
}
