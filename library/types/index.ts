export interface ViseNetwork {
  // Node operations
  joinPool(): Promise<any>;
  claimRewards(): Promise<any>;

  // Video operations
  indexVideo(videoCID: string, videoLengthSeconds: number): Promise<any>;
  completeIndexingVideo(videoCID: string, indexCID: string): Promise<any>;
  reassignTask(videoCID: string): Promise<any>;

  // View functions
  getActiveNodesCount(): Promise<number>;
  getVideoIndexing(videoCID: string): Promise<string>;
  isVideoIndexed(videoCID: string): Promise<boolean>;
  getVideoStatus(videoCID: string): Promise<{
    exists: boolean;
    isIndexed: boolean;
    nodeAddress: string;
    requestTime: number;
    deadline: number;
    canReassign: boolean;
  }>;
  getUserVideos(userAddress: `0x${string}`): Promise<string[]>;
  
  // Node status
  getNodeStatus(nodeAddress: `0x${string}`): Promise<{
    exists: boolean;
    busy: boolean;
    pendingVideoCID: string;
    operationProofs: number;
  }>;
}