import { useCallback } from "react";
import { useAccount } from "wagmi";

import { EVMViseNetwork } from "@/services/vise";
import { ViseNetwork } from "@/types";

export const useVISENetwork = () => {
  const account = useAccount();
  const service = new EVMViseNetwork();
  const nodeAddress = account.address;

  const withService = useCallback(
    <T>(
      operation: (
        service: ViseNetwork,
        nodeAddress: `0x${string}`
      ) => Promise<T>
    ) => {
      if (!service) throw new Error("No blockchain service available");
      if (!nodeAddress) throw new Error("No node address not available");
      return operation(service, nodeAddress);
    },
    [service, nodeAddress]
  );

  const methods = {
    joinPool: useCallback(
      () => withService((service) => service.joinPool()),
      [withService]
    ),

    claimRewards: useCallback(
      () => withService((service) => service.claimRewards()),
      [withService]
    ),

    indexVideo: useCallback(
      (videoCID: string, videoLengthSeconds: number) =>
        withService((service) => service.indexVideo(videoCID, videoLengthSeconds)),
      [withService]
    ),

    completeIndexingVideo: useCallback(
      (videoCID: string, indexCID: string) =>
        withService((service) => service.completeIndexingVideo(videoCID, indexCID)),
      [withService]
    ),

    reassignTask: useCallback(
      (videoCID: string) =>
        withService((service) => service.reassignTask(videoCID)),
      [withService]
    ),

    getActiveNodesCount: useCallback(
      () => withService((service) => service.getActiveNodesCount()),
      [withService]
    ),

    getVideoIndexing: useCallback(
      (videoCID: string) =>
        withService((service) => service.getVideoIndexing(videoCID)),
      [withService]
    ),

    isVideoIndexed: useCallback(
      (videoCID: string) =>
        withService((service) => service.isVideoIndexed(videoCID)),
      [withService]
    ),

    getVideoStatus: useCallback(
      (videoCID: string) =>
        withService((service) => service.getVideoStatus(videoCID)),
      [withService]
    ),

    getUserVideos: useCallback(
      (userAddress: `0x${string}`) =>
        withService((service) => service.getUserVideos(userAddress)),
      [withService]
    ),
    
    getNodeStatus: useCallback(
      () => 
        withService((service, nodeAddress) => service.getNodeStatus(nodeAddress)),
      [withService]
    ),
  };

  return {
    isInitialized: !!service,
    ...methods,
  };
};
