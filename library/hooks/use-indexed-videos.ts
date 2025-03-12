import { useCallback, useEffect, useState, useMemo } from "react";
import { useAccount } from "wagmi";

import { useVISENetwork } from "@/hooks/use-vise-network";
import useStore from "@/store";
import { IndexedVideo } from "@/store/index-store-slice";

export const useIndexedVideos = () => {
  const { address } = useAccount();
  const viseNetwork = useVISENetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get functions from the index store
  const indexedVideos = useStore((state) => state.indexedVideos);
  const addVideo = useStore((state) => state.addVideo);
  const updateVideo = useStore((state) => state.updateVideo);
  const removeVideo = useStore((state) => state.removeVideo);
  const getVideo = useStore((state) => state.getVideo);

  const getAllVideos = useCallback(() => {
    return Object.values(indexedVideos || {});
  }, [indexedVideos]);

  // Memoize the videos array to prevent creating a new reference on every render
  const videos = useMemo(() => getAllVideos(), [getAllVideos]);

  // Fetch all user videos from the blockchain
  const fetchUserVideos = useCallback(async () => {
    if (!address) return [];

    setIsLoading(true);
    setError(null);

    try {
      return await viseNetwork.getUserVideos(address);
    } catch (err) {
      setError("Failed to fetch user videos");
      console.error("Error fetching user videos:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [address, viseNetwork]);

  // Update video status from blockchain
  const updateVideoStatus = useCallback(
    async (videoCID: string) => {
      if (!address) return;

      try {
        const status = await viseNetwork.getVideoStatus(videoCID);

        if (status.exists) {
          let videoStatus: IndexedVideo["status"] = "pending";

          if (status.isIndexed) {
            videoStatus = "completed";
          } else if (status.canReassign) {
            videoStatus = "reassignable";
          }

          // Get additional data if available
          let indexCID: string | undefined = undefined;

          if (status.isIndexed) {
            try {
              const indexingData = await viseNetwork.getVideoIndexing(videoCID);
              // Handle different possible return types safely
              if (typeof indexingData === "string") {
                indexCID = indexingData;
              } else if (indexingData && typeof indexingData === "object") {
                // Try to access indexCID property safely
                const indexCIDValue = (indexingData as any).indexCID;
                if (typeof indexCIDValue === "string") {
                  indexCID = indexCIDValue;
                }
              }
            } catch (err) {
              console.error(`Error fetching index CID for ${videoCID}:`, err);
            }
          }

          updateVideo(videoCID, {
            status: videoStatus,
            nodeAddress: status.nodeAddress,
            requestTimestamp: status.requestTime,
            deadline: status.deadline,
            indexCID,
            lastChecked: Date.now(),
          });
        }
      } catch (err) {
        console.error(`Error updating status for video ${videoCID}:`, err);
      }
    },
    [address, viseNetwork, updateVideo]
  );

  // Reassign a video to a new node
  const reassignVideo = useCallback(
    async (videoCID: string) => {
      if (!address) return false;

      try {
        await viseNetwork.reassignTask(videoCID);

        // Update local status after reassignment
        updateVideo(videoCID, {
          status: "pending",
        });

        // Fetch updated status after a short delay
        setTimeout(() => updateVideoStatus(videoCID), 2000);

        return true;
      } catch (err) {
        console.error(`Error reassigning video ${videoCID}:`, err);
        return false;
      }
    },
    [address, viseNetwork, updateVideo, updateVideoStatus]
  );

  // Sync all videos with blockchain
  const syncAllVideos = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);

    try {
      // Get all videos from blockchain
      const blockchainVideos = await fetchUserVideos();

      // Get all videos from local store - access directly from indexedVideos instead of getAllVideos
      const localVideoCIDs = new Set(Object.keys(indexedVideos || {}));

      // Add new videos from blockchain to local store
      for (const videoCID of blockchainVideos) {
        if (!localVideoCIDs.has(videoCID)) {
          // If this is a new video from the blockchain, add it to our local store
          addVideo(videoCID, {
            status: "pending",
            requestTimestamp: Math.floor(Date.now() / 1000), // Temporary timestamp until we get the real one
          });
        }

        // Update status for all videos
        await updateVideoStatus(videoCID);
      }
    } catch (err) {
      setError("Failed to sync videos");
      console.error("Error syncing videos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [address, fetchUserVideos, indexedVideos, addVideo, updateVideoStatus]);

  // Initial sync on component mount
  useEffect(() => {
    if (address) {
      syncAllVideos();
    }
  }, []);

  return {
    videos,
    getVideo,
    addVideo,
    updateVideo,
    removeVideo,
    reassignVideo,
    updateVideoStatus,
    syncAllVideos,
    isLoading,
    error,
  };
};
