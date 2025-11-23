"use client";

import { useTasks } from "@/hooks/useTasks";
import sdk from "@farcaster/miniapp-sdk";
import Image from "next/image";
import { useState } from "react";

export default function WaitlistPage() {
  const {
    tasks,
    totalPoints,
    isLoading,
    error,
    refetch,
    completeTask,
    completeMiniapp,
    isCompletingTask,
  } = useTasks();

  const [processingTask, setProcessingTask] = useState<string | null>(null);

  const handleAddToFarcaster = async () => {
    setProcessingTask("add_miniapp");

    try {
      const result = await sdk.actions.addMiniApp();

      if (result === null) {
        return;
      }

      await completeMiniapp({
        url: result.notificationDetails?.url || "",
        token: result.notificationDetails?.token || "",
      });
    } finally {
      setProcessingTask(null);
    }
  };

  const handleTaskClick = async (task: (typeof tasks)[0]) => {
    if (task.completed || isCompletingTask) return;

    setProcessingTask(task.id);

    try {
      if (task.id === "add_miniapp") {
        await handleAddToFarcaster();
        return;
      }

      if (task.action.startsWith("http")) {
        window.open(task.action, "_blank");
      }

      await completeTask({ taskId: task.id });
    } finally {
      setProcessingTask(null);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

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
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-[#2574ff] text-white rounded-lg hover:bg-[#1e5dd1]"
                style={{ fontFamily: "var(--font-lilita-one)" }}
              >
                Try Again
              </button>
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
                        <span
                          className="text-[14px] text-[#2574ff] leading-[1.2]"
                          style={{ fontFamily: "var(--font-lilita-one)" }}
                        >
                          +{task.points}
                        </span>
                      </div>
                      <p className="text-[14px] text-gray-600 leading-[1.2]">
                        {task.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleTaskClick(task)}
                      disabled={task.completed || processingTask !== null}
                      className={`border-2 border-black rounded-lg px-4 py-2 transition-all ${
                        task.completed
                          ? "bg-[#1ec460] text-white cursor-default"
                          : "bg-[#2574ff] text-white hover:bg-[#1e5dd1] active:translate-y-0.5"
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_2px_0px_0px_#000000] active:shadow-none`}
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      {task.completed ? (
                        <span className="text-[16px]">✓</span>
                      ) : processingTask === task.id ? (
                        <span className="text-[14px]">...</span>
                      ) : (
                        <span className="text-[14px]">Go</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
