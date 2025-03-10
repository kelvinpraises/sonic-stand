import { config } from "@/providers/wagmi/config";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { readContract } from "wagmi/actions";

import { ViseNetwork } from "@/types";
import viseProtocol from "@/types/contracts/vise-protocol";

const VISE_PROTOCOL_ABI = viseProtocol.abi;
const VISE_PROTOCOL_ADDRESS = viseProtocol.address;

export class EVMViseNetwork implements ViseNetwork {
  async joinPool() {
    try {
      const { request } = await simulateContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "joinPool",
      });
      const hash = await writeContract(config, request);
      return waitForTransactionReceipt(config, { confirmations: 1, hash });
    } catch (err) {
      console.error("Error joining pool:", err);
      throw err;
    }
  }

  async claimRewards() {
    try {
      const { request } = await simulateContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "claimRewards",
      });
      const hash = await writeContract(config, request);
      return waitForTransactionReceipt(config, { confirmations: 1, hash });
    } catch (err) {
      console.error("Error claiming rewards:", err);
      throw err;
    }
  }

  async indexVideo(videoCID: string, videoLengthSeconds: number) {
    try {
      const { request } = await simulateContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "indexVideo",
        args: [videoCID, BigInt(videoLengthSeconds)],
      });
      const hash = await writeContract(config, request);
      return waitForTransactionReceipt(config, { confirmations: 1, hash });
    } catch (err) {
      console.error("Error indexing video:", err);
      throw err;
    }
  }

  async completeIndexingVideo(videoCID: string, indexCID: string) {
    try {
      const { request } = await simulateContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "completeIndexingVideo",
        args: [videoCID, indexCID],
      });
      const hash = await writeContract(config, request);
      return waitForTransactionReceipt(config, { confirmations: 1, hash });
    } catch (err) {
      console.error("Error completing video indexing:", err);
      throw err;
    }
  }

  async reassignTask(videoCID: string) {
    try {
      const { request } = await simulateContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "reassignTask",
        args: [videoCID],
      });
      const hash = await writeContract(config, request);
      return waitForTransactionReceipt(config, { confirmations: 1, hash });
    } catch (err) {
      console.error("Error reassigning task:", err);
      throw err;
    }
  }

  async getActiveNodesCount(): Promise<number> {
    try {
      const count = await readContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "getActiveNodesCount",
      });
      return Number(count);
    } catch (err) {
      console.error("Error getting active nodes count:", err);
      throw err;
    }
  }

  async getVideoIndexing(videoCID: string): Promise<string> {
    try {
      return await readContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "getVideoIndexing",
        args: [videoCID],
      });
    } catch (err) {
      console.error("Error getting video indexing:", err);
      throw err;
    }
  }

  async isVideoIndexed(videoCID: string): Promise<boolean> {
    try {
      return await readContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "isVideoIndexed",
        args: [videoCID],
      });
    } catch (err) {
      console.error("Error checking if video is indexed:", err);
      throw err;
    }
  }

  async getVideoStatus(videoCID: string) {
    try {
      const result = await readContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "getVideoStatus",
        args: [videoCID],
      });

      return {
        exists: result[0],
        isIndexed: result[1],
        nodeAddress: result[2],
        requestTime: Number(result[3]),
        deadline: Number(result[4]),
        canReassign: result[5],
      };
    } catch (err) {
      console.error("Error getting video status:", err);
      throw err;
    }
  }

  async getUserVideos(userAddress: `0x${string}`): Promise<string[]> {
    try {
      const videos = await readContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "getUserVideos",
        args: [userAddress],
      });

      // Convert readonly array to mutable array
      return [...videos];
    } catch (err) {
      console.error("Error getting user videos:", err);
      throw err;
    }
  }

  async getNodeStatus(nodeAddress: `0x${string}`) {
    try {
      const node = await readContract(config, {
        abi: VISE_PROTOCOL_ABI,
        address: VISE_PROTOCOL_ADDRESS,
        functionName: "nodes",
        args: [nodeAddress],
      });

      return {
        operationProofs: Number(node[0]),
        pendingVideoCID: node[1],
        exists: node[3],
        busy: node[4],
      };
    } catch (err) {
      console.error("Error getting node status:", err);
      throw err;
    }
  }
}
