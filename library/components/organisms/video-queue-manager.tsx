import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import AudioVideoMiner from "@/components/molecules/audio-video-miner";
import usePollingEffect from "@/hooks/use-polling-effect";
import { useVISENetwork } from "@/hooks/use-vise-network";
import useStore from "@/store";

const POLLING_INTERVAL = 5000; // 20 seconds

const VideoQueueManager = () => {
  const [currentVideoTask, setCurrentVideoTask] = useState<{
    videoCID: string;
    exists: boolean;
  } | null>(null);

  const { completeIndexingVideo, getVideoStatus, getNodeStatus } =
    useVISENetwork();
  const { updateStats } = useStore();

  // Check if this node has been assigned a video to index
  const checkNodeTask = useCallback(async () => {
    try {
      console.log("Polling for tasks at:", new Date().toISOString());

      // Get the node's current status from the blockchain
      const nodeStatus = await getNodeStatus();

      // If the node exists, is busy, and has a pending video task
      if (nodeStatus.exists && nodeStatus.busy && nodeStatus.pendingVideoCID) {
        // Double-check the video status to make sure it's not already indexed
        const videoStatus = await getVideoStatus(nodeStatus.pendingVideoCID);

        if (videoStatus.exists && !videoStatus.isIndexed) {
          setCurrentVideoTask({
            videoCID: nodeStatus.pendingVideoCID,
            exists: true,
          });
          return;
        }
      }

      // If we get here, there are no tasks to process
      setCurrentVideoTask(null);
    } catch (error) {
      console.error("Error checking node task:", error);
      setCurrentVideoTask(null);
    }
  }, [getNodeStatus, getVideoStatus]);

  // Set up polling using the polling effect hook
  const [killPolling, revivePolling] = usePollingEffect(
    checkNodeTask,
    [checkNodeTask],
    {
      interval: POLLING_INTERVAL,
      onCleanUp: () => console.log("Polling stopped"),
    }
  );

  // Control polling based on task status and initial delay
  useEffect(() => {
    // If we have a task, stop polling
    if (currentVideoTask) {
      killPolling();
    } else {
      // Otherwise, make sure polling is active
      revivePolling();
    }
  }, [currentVideoTask, killPolling, revivePolling]);

  const handleMiningComplete = async (
    capturedImages: string[],
    extractedAudio: Blob
  ) => {
    if (currentVideoTask?.videoCID) {
      try {
        const formData = new FormData();
        formData.append("videoCID", currentVideoTask.videoCID);
        capturedImages.forEach((image) =>
          formData.append("capturedImages", image)
        );
        formData.append("extractedAudio", extractedAudio, "audio.wav");

        // Upload the extracted data to your indexing service
        const response = await fetch("/api/indexing", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        console.log(result);

        // Complete the indexing process with the indexCID (result from the indexing service)
        await completeIndexingVideo(currentVideoTask.videoCID, result.indexCID);

        // Update analytics:
        // - Completed Captions increases by 1
        // - Scenes Processed increases by the number of captured images
        updateStats(capturedImages.length);

        toast.success("Video Indexing Successful");
        setCurrentVideoTask(null);
      } catch (error) {
        console.error("Error completing video indexing:", error);
        setCurrentVideoTask(null);
      }
    }
  };

  return (
    <motion.div
      className="w-full h-full col-span-full"
      initial={{ opacity: 0.2 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Card className="w-full h-full rounded-xl overflow-hidden bg-white/80 dark:bg-black/80 backdrop-blur-sm border-[1px] border-[#138FA8]/20 dark:border-[#0D4B58]/20 bg-gradient-to-r from-[#138FA8]/10 to-transparent dark:from-[#0D4B58]/10 dark:to-transparent flex flex-col">
        <CardHeader className="pb-0 pt-4 px-4">
          {/* <CardTitle className="text-xl font-outfit font-semibold">
            {currentVideoTask ? "Processing Video" : "Video Queue"}
          </CardTitle> */}
        </CardHeader>
        <CardContent className="p-4 flex-grow flex items-center justify-center">
          {currentVideoTask?.videoCID ? (
            <div className="animate-pulse-slow w-full">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#138FA8]/20 dark:bg-[#0D4B58]/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#138FA8] dark:text-[#0D4B58]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm md:text-base">
                    Processing CID
                  </p>
                  <p className="text-xs text-[#484E62] dark:text-[#B7BDD5] font-mono truncate max-w-[200px]">
                    {currentVideoTask.videoCID}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <AudioVideoMiner
                  videoCID={currentVideoTask.videoCID}
                  onComplete={handleMiningComplete}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center w-full">
              <div className="relative h-32 w-32 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full text-[#138FA8]/20 dark:text-[#0D4B58]/20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-[#138FA8]/10 dark:bg-[#0D4B58]/10 animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-lg font-outfit font-semibold mb-2">
                No Videos in Queue
              </h3>
              <p className="text-sm text-[#484E62] dark:text-[#B7BDD5] max-w-xs">
                Your node is on standby and ready to process videos when they
                become available in the network.
              </p>
              <div className="mt-6 flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse"></div>
                <p className="text-xs text-[#484E62] dark:text-[#B7BDD5]">
                  Listening for new tasks
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VideoQueueManager;
