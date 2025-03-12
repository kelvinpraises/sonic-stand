"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Info,
} from "lucide-react";

import { Button } from "@/components/atoms/button";
import { useIndexedVideos } from "@/hooks/use-indexed-videos";
import { cn } from "@/utils";
import { IndexedVideo } from "@/store/index-store-slice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { useVISENetwork } from "@/hooks/use-vise-network";
import { Badge } from "@/components/atoms/badge";
import { Skeleton } from "@/components/atoms/skeleton";

const statusIcons = {
  pending: <Clock className="h-5 w-5 text-yellow-500" />,
  completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  failed: <AlertTriangle className="h-5 w-5 text-red-500" />,
  reassignable: <RefreshCw className="h-5 w-5 text-blue-500" />,
};

const statusText = {
  pending: "Processing",
  completed: "Completed",
  failed: "Failed",
  reassignable: "Needs Reassignment",
};

interface VideoCardProps {
  video: IndexedVideo;
  onReassign: (videoCID: string) => Promise<boolean>;
  onRefresh: (videoCID: string) => Promise<void>;
  onRetryIndex: (videoCID: string) => Promise<void>;
}

const VideoCard = ({
  video,
  onReassign,
  onRefresh,
  onRetryIndex,
}: VideoCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleReassign = async () => {
    setIsLoading(true);
    try {
      await onReassign(video.videoCID);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh(video.videoCID);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryIndex = async () => {
    setIsRetrying(true);
    try {
      await onRetryIndex(video.videoCID);
    } finally {
      setIsRetrying(false);
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return formatDistanceToNow(timestamp * 1000, { addSuffix: true });
  };

  const getTimeRemaining = (deadline?: number) => {
    if (!deadline) return null;
    const now = Math.floor(Date.now() / 1000);
    if (now > deadline) return "Expired";
    return (
      formatDistanceToNow(deadline * 1000, { addSuffix: false }) + " remaining"
    );
  };

  const isExpired = video.deadline
    ? Math.floor(Date.now() / 1000) > video.deadline
    : false;
  const timeRemaining = getTimeRemaining(video.deadline);
  const requestTime = formatTimestamp(video.requestTimestamp);
  const lastCheckedTime = video.lastChecked
    ? formatDistanceToNow(video.lastChecked, { addSuffix: true })
    : "Never";

  const displayName =
    video.title || video.fileName || video.videoCID.substring(0, 16) + "...";

  return (
    <motion.div
      layout
      className={cn(
        "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start p-4 mt-4 w-full mx-auto rounded-md",
        "shadow-sm border border-neutral-200 dark:border-neutral-800",
        video.status === "completed" && "border-l-4 border-l-green-500",
        video.status === "pending" && "border-l-4 border-l-yellow-500",
        video.status === "failed" && "border-l-4 border-l-red-500",
        video.status === "reassignable" && "border-l-4 border-l-blue-500"
      )}
    >
      <div className="flex justify-between w-full items-center gap-4">
        <div className="flex items-center gap-2">
          {statusIcons[video.status]}
          <motion.p
            layout
            className="text-base font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
          >
            {displayName}
          </motion.p>

          {isExpired && video.status === "pending" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Timeout
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    The assigned node has timed out. You can reassign this
                    video.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {statusText[video.status]}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="p-1"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {video.description && !expanded && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-1">
          {video.description}
        </p>
      )}

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full mt-4 space-y-2"
        >
          {video.title && (
            <div className="mb-2">
              <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {video.description}
                </p>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-neutral-500 dark:text-neutral-400">
              Video CID:
            </div>
            <div className="text-neutral-700 dark:text-neutral-300 truncate">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">{video.videoCID}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs break-all">{video.videoCID}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {video.indexCID && (
              <>
                <div className="text-neutral-500 dark:text-neutral-400">
                  Index CID:
                </div>
                <div className="text-neutral-700 dark:text-neutral-300 truncate">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">{video.indexCID}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs break-all">{video.indexCID}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}

            <div className="text-neutral-500 dark:text-neutral-400">
              Node Address:
            </div>
            <div className="text-neutral-700 dark:text-neutral-300 truncate">
              {video.nodeAddress ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{video.nodeAddress}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs break-all">{video.nodeAddress}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                "Not assigned"
              )}
            </div>

            <div className="text-neutral-500 dark:text-neutral-400">
              Requested:
            </div>
            <div className="text-neutral-700 dark:text-neutral-300">
              {requestTime}
            </div>

            {timeRemaining && (
              <>
                <div className="text-neutral-500 dark:text-neutral-400">
                  Time Remaining:
                </div>
                <div
                  className={cn(
                    "text-neutral-700 dark:text-neutral-300",
                    isExpired && "text-red-500 dark:text-red-400"
                  )}
                >
                  {timeRemaining}
                </div>
              </>
            )}

            <div className="text-neutral-500 dark:text-neutral-400">
              Last Checked:
            </div>
            <div className="text-neutral-700 dark:text-neutral-300">
              {lastCheckedTime}
            </div>

            {video.fileSize && (
              <>
                <div className="text-neutral-500 dark:text-neutral-400">
                  File Size:
                </div>
                <div className="text-neutral-700 dark:text-neutral-300">
                  {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            {(video.status === "reassignable" ||
              (video.status === "pending" && isExpired)) && (
              <Button
                variant="default"
                size="sm"
                onClick={handleReassign}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reassign
                  </>
                )}
              </Button>
            )}

            {video.status === "failed" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRetryIndex}
                disabled={isRetrying}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Indexing
                  </>
                )}
              </Button>
            )}

            {video.status === "completed" && video.indexCID && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://ipfs.io/ipfs/${video.indexCID}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Index
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh Status
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export const UserIndexedVideos = () => {
  const {
    videos,
    reassignVideo,
    updateVideoStatus,
    syncAllVideos,
    isLoading,
    addVideo,
  } = useIndexedVideos();

  const { indexVideo } = useVISENetwork();

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      // First by status priority
      const statusPriority = {
        pending: 1,
        reassignable: 2,
        failed: 3,
        completed: 4,
      };

      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Then by timestamp (newest first)
      const aTime = a.requestTimestamp || 0;
      const bTime = b.requestTimestamp || 0;
      return bTime - aTime;
    });
  }, [videos]);


  const handleReassign = async (videoCID: string) => {
    return await reassignVideo(videoCID);
  };

  const handleRefresh = async (videoCID: string) => {
    await updateVideoStatus(videoCID);
  };

  const handleRetryIndex = async (videoCID: string) => {
    const video = videos.find((v) => v.videoCID === videoCID);
    if (!video) return;

    try {
      // Default to 1 hour if we don't know the length
      const videoLengthSeconds = 3600;

      // Update status to pending
      addVideo(videoCID, {
        ...video,
        status: "pending",
        requestTimestamp: Math.floor(Date.now() / 1000),
      });

      // Attempt to index the video
      await indexVideo(videoCID, videoLengthSeconds);

      // Update the video status after a short delay
      setTimeout(() => updateVideoStatus(videoCID), 2000);
    } catch (error) {
      console.error("Error retrying indexing:", error);

      // Update status back to failed
      addVideo(videoCID, {
        ...video,
        status: "failed",
        lastChecked: Date.now(),
      });
    }
  };

  if (isLoading && videos.length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
            Your Indexed Videos
          </h2>
          <Skeleton className="h-9 w-28" />
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg">
        <div className="flex flex-col items-center justify-center gap-2">
          <Info className="h-12 w-12 text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
            No indexed videos found
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Upload and index a video to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          Your Indexed Videos
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncAllVideos()}
          disabled={isLoading}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
          />
          {isLoading ? "Refreshing..." : "Refresh All"}
        </Button>
      </div>

      <div className="space-y-2">
        {sortedVideos.map((video: IndexedVideo) => (
          <VideoCard
            key={video.videoCID}
            video={video}
            onReassign={handleReassign}
            onRefresh={handleRefresh}
            onRetryIndex={handleRetryIndex}
          />
        ))}
      </div>
    </div>
  );
};
