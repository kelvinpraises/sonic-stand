import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import AudioVideoMiner from "@/components/molecules/audio-video-miner";
import { useVISENetwork } from "@/hooks/use-vise-network";

const POLLING_INTERVAL = 2000; // 2 seconds

const VideoQueueManager = () => {
  const [currentVideoTask, setCurrentVideoTask] = useState<{
    videoCID: string;
    exists: boolean;
  } | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const { completeIndexingVideo, getVideoStatus, getNodeStatus } =
    useVISENetwork();

  // Check if this node has been assigned a video to index
  const checkNodeTask = useCallback(async () => {
    try {
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

  useEffect(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    const pollForTasks = async () => {
      await checkNodeTask();
      // Only set up the next interval if we still don't have a task
      if (!currentVideoTask) {
        pollingInterval.current = setInterval(checkNodeTask, POLLING_INTERVAL);
      }
    };

    pollForTasks();

    // Cleanup
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [currentVideoTask, checkNodeTask]);

  const handleMiningComplete = async (
    capturedImages: string[],
    extractedAudio: Blob
  ) => {
    if (currentVideoTask?.videoCID) {
      try {
        const formData = new FormData();
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

        // Complete the indexing process with the indexCID (result from the indexing service)
        await completeIndexingVideo(currentVideoTask.videoCID, result.indexCID);

        toast.success("Video Indexing Successful");
        setCurrentVideoTask(null);
      } catch (error) {
        console.error("Error completing video indexing:", error);
        setCurrentVideoTask(null);
      }
    }
  };

  return (
    <div>
      {currentVideoTask?.videoCID && (
        <AudioVideoMiner
          ipfsHash={currentVideoTask.videoCID}
          onComplete={handleMiningComplete}
        />
      )}
    </div>
  );
};

export default VideoQueueManager;
