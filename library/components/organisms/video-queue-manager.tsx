import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import AudioVideoMiner from "@/components/molecules/audio-video-miner";
import { useVISENetwork } from "@/hooks/use-vise-network";

const POLLING_INTERVAL = 2000; // 2 seconds

const VideoQueueManager = () => {
  const [currentIpfsHash, setCurrentCID] = useState<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const { completeCaptionVideo, getIncompleteVideoCaptionTasks } =
    useVISENetwork();

  const fetchIncompleteVideoCaptionTasks = useCallback(async () => {
    try {
      const tasks = await getIncompleteVideoCaptionTasks();
      if (tasks.length > 0) {
        setCurrentCID(tasks[0].ipfs_hash);
      }
    } catch (error) {
      console.error("Error fetching incomplete video caption tasks:", error);
    }
  }, [getIncompleteVideoCaptionTasks]);

  useEffect(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    const pollForTasks = async () => {
      await fetchIncompleteVideoCaptionTasks();
      // Only set up the next interval if we still don't have a IpfsHash
      if (!currentIpfsHash) {
        pollingInterval.current = setInterval(
          fetchIncompleteVideoCaptionTasks,
          POLLING_INTERVAL
        );
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
  }, [currentIpfsHash, fetchIncompleteVideoCaptionTasks]);

  const handleMiningComplete = async (
    capturedImages: string[],
    extractedAudio: Blob
  ) => {
    if (currentIpfsHash) {
      try {
        const formData = new FormData();
        capturedImages.forEach((image) =>
          formData.append("capturedImages", image)
        );
        formData.append("extractedAudio", extractedAudio, "audio.wav");

        const response = await fetch("/api/vision", {
          method: "POST",
          body: formData,
        });
        const message = await response.json();
        await completeCaptionVideo(message.ipfsHash);

        toast.success("Caption Job Successful");
        setCurrentCID(null);
      } catch (error) {
        console.error("Error completing video caption:", error);
        setCurrentCID(null);
      }
    }
  };

  return (
    <div>
      {currentIpfsHash && (
        <AudioVideoMiner
          ipfsHash={currentIpfsHash}
          onComplete={handleMiningComplete}
        />
      )}
    </div>
  );
};

export default VideoQueueManager;
