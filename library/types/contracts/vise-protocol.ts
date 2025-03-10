const data = {
  name: "Vise Protocol",
  address: "0x52b6622fa8057b2180E0E87B0da9E3a30093751d",
  abi: [
    {
      type: "constructor",
      inputs: [
        {
          name: "_viToken",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "BASE_REWARD",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "BUFFER_TIME",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "MAX_OP_PROOFS",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "MAX_TASK_TIMEOUT",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "MIN_TASK_TIMEOUT",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "PROCESSING_RATIO",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "claimRewards",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "completeIndexingVideo",
      inputs: [
        {
          name: "videoCID",
          type: "string",
          internalType: "string",
        },
        {
          name: "indexCID",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getActiveNodesCount",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getUserVideos",
      inputs: [
        {
          name: "userAddress",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "string[]",
          internalType: "string[]",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getVideoIndexing",
      inputs: [
        {
          name: "videoCID",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [
        {
          name: "",
          type: "string",
          internalType: "string",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getVideoStatus",
      inputs: [
        {
          name: "videoCID",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [
        {
          name: "exists",
          type: "bool",
          internalType: "bool",
        },
        {
          name: "isIndexed",
          type: "bool",
          internalType: "bool",
        },
        {
          name: "nodeAddress",
          type: "address",
          internalType: "address",
        },
        {
          name: "requestTime",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "deadline",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "canReassign",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "indexVideo",
      inputs: [
        {
          name: "videoCID",
          type: "string",
          internalType: "string",
        },
        {
          name: "videoLengthSeconds",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "isVideoIndexed",
      inputs: [
        {
          name: "videoCID",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "joinPool",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "nodes",
      inputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "operationProofs",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "pendingVideoCID",
          type: "string",
          internalType: "string",
        },
        {
          name: "taskAddress",
          type: "address",
          internalType: "address",
        },
        {
          name: "exists",
          type: "bool",
          internalType: "bool",
        },
        {
          name: "busy",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "reassignTask",
      inputs: [
        {
          name: "videoCID",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "viToken",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract VISEToken",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "event",
      name: "NodeJoinedPool",
      inputs: [
        {
          name: "nodeAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "NodeLeftPool",
      inputs: [
        {
          name: "nodeAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "RewardsClaimed",
      inputs: [
        {
          name: "nodeAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "TaskReassigned",
      inputs: [
        {
          name: "videoCID",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "oldNode",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "newNode",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "newDeadline",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "VideoIndexingCompleted",
      inputs: [
        {
          name: "userAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "videoCID",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "nodeAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "indexCID",
          type: "string",
          indexed: false,
          internalType: "string",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "VideoIndexingRequested",
      inputs: [
        {
          name: "userAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "videoCID",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        {
          name: "nodeAddress",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "deadline",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "DuplicateVideoCID",
      inputs: [],
    },
    {
      type: "error",
      name: "InvalidIndexCID",
      inputs: [],
    },
    {
      type: "error",
      name: "InvalidVideoCID",
      inputs: [],
    },
    {
      type: "error",
      name: "InvalidVideoLength",
      inputs: [],
    },
    {
      type: "error",
      name: "NoRewardsAvailable",
      inputs: [],
    },
    {
      type: "error",
      name: "NodeAlreadyActive",
      inputs: [],
    },
    {
      type: "error",
      name: "NodeNotActive",
      inputs: [],
    },
    {
      type: "error",
      name: "NodeNotRegistered",
      inputs: [],
    },
    {
      type: "error",
      name: "NodeUnavailable",
      inputs: [],
    },
    {
      type: "error",
      name: "ReentrancyGuardReentrantCall",
      inputs: [],
    },
    {
      type: "error",
      name: "TaskNotTimedOut",
      inputs: [],
    },
    {
      type: "error",
      name: "UnauthorizedNode",
      inputs: [],
    },
    {
      type: "error",
      name: "VideoCIDMismatch",
      inputs: [],
    },
    {
      type: "error",
      name: "VideoNotFound",
      inputs: [],
    },
  ],
} as const;

export default data;
