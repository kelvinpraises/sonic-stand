// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VIToken} from "./Token.sol";

contract VISENetwork is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // Structs
    struct Video {
        string videoCID;
        address userAddress;
        address nodeAddress;
        string indexCID;
        bool exists;
        uint256 requestTimestamp;
        uint256 deadline;
    }

    struct Node {
        uint256 operationProofs;
        string pendingVideoCID;
        address taskAddress;
        bool exists;
        bool busy;
    }

    // Constants
    uint256 public constant BASE_REWARD = 100 * 10 ** 8; // 100 VISE tokens with 8 decimals
    uint256 public constant MAX_OP_PROOFS = 1000; // Limit for operation proofs
    uint256 public constant MIN_TASK_TIMEOUT = 10 minutes; // Minimum task timeout
    uint256 public constant MAX_TASK_TIMEOUT = 7 days; // Maximum task timeout
    uint256 public constant PROCESSING_RATIO = 5; // 5 seconds of processing time per second of video
    uint256 public constant BUFFER_TIME = 5 minutes; // Additional buffer time for all tasks

    // State variables
    VIToken public viToken;
    EnumerableSet.AddressSet private activeNodes;
    mapping(address => Node) public nodes;
    mapping(bytes32 => Video) private videos;
    mapping(address => EnumerableSet.Bytes32Set) private userVideoCIDs;

    // Events
    event VideoIndexingRequested(
        address indexed userAddress,
        string videoCID,
        address indexed nodeAddress,
        uint256 deadline
    );
    event VideoIndexingCompleted(
        address indexed userAddress,
        string videoCID,
        address indexed nodeAddress,
        string indexCID
    );
    event NodeJoinedPool(address indexed nodeAddress);
    event NodeLeftPool(address indexed nodeAddress);
    event RewardsClaimed(address indexed nodeAddress, uint256 amount);
    event TaskReassigned(
        string videoCID,
        address oldNode,
        address newNode,
        uint256 newDeadline
    );

    // Errors
    error NodeNotRegistered();
    error InvalidVideoCID();
    error InvalidVideoLength();
    error NodeNotActive();
    error NodeAlreadyActive();
    error NodeUnavailable();
    error VideoNotFound();
    error NoRewardsAvailable();
    error VideoCIDMismatch();
    error DuplicateVideoCID();
    error InvalidIndexCID();
    error UnauthorizedNode();
    error TaskNotTimedOut();

    // ============ Constructor & Internal Helpers ============

    constructor(address _viToken) {
        viToken = VIToken(_viToken);
    }

    /**
     * @dev Compute hash of a videoCID string - internal helper
     */
    function _hashVideoCID(
        string memory videoCID
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(videoCID));
    }

    /**
     * @dev Calculate task deadline based on video length
     */
    function _calculateDeadline(
        uint256 videoLengthSeconds
    ) internal view returns (uint256) {
        // Calculate processing time based on video length
        uint256 processingTime = videoLengthSeconds *
            PROCESSING_RATIO +
            BUFFER_TIME;

        // Ensure deadline is within allowed range
        if (processingTime < MIN_TASK_TIMEOUT) {
            processingTime = MIN_TASK_TIMEOUT;
        } else if (processingTime > MAX_TASK_TIMEOUT) {
            processingTime = MAX_TASK_TIMEOUT;
        }

        return block.timestamp + processingTime;
    }

    /**
     * @dev Pick a random node from the active nodes pool
     */
    function _randomlyPickNode() internal returns (address) {
        uint256 totalNodes = activeNodes.length();
        if (totalNodes == 0) revert NodeUnavailable();

        // Using pseudo-random source for simplicity
        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)
            )
        ) % totalNodes;

        // Simple random selection - each node has equal probability
        address selectedNode = activeNodes.at(randomIndex);
        activeNodes.remove(selectedNode);

        return selectedNode;
    }

    // ============ Node Operations ============

    /**
     * @dev Allows nodes to join the active node pool
     */
    function joinPool() external {
        if (!nodes[msg.sender].exists) {
            nodes[msg.sender] = Node({
                operationProofs: 0,
                pendingVideoCID: "",
                taskAddress: address(0),
                exists: true,
                busy: false
            });
        }

        if (nodes[msg.sender].busy) revert NodeAlreadyActive();

        activeNodes.add(msg.sender);
        emit NodeJoinedPool(msg.sender);
    }

    /**
     * @dev Allows nodes to claim rewards based on completed operations
     */
    function claimRewards() external nonReentrant {
        Node storage node = nodes[msg.sender];
        if (!node.exists) revert NodeNotRegistered();

        uint256 rewardMultiplier = node.operationProofs;
        if (rewardMultiplier == 0) revert NoRewardsAvailable();

        // Calculate reward amount based on operation proofs
        uint256 rewardAmount = rewardMultiplier * BASE_REWARD;

        // Reset operation proofs before transfer to prevent reentrancy issues
        node.operationProofs = 0;

        // Mint and transfer tokens to the node
        viToken.mint(msg.sender, rewardAmount);

        emit RewardsClaimed(msg.sender, rewardAmount);
    }

    // ============ Video Operations ============

    /**
     * @dev Request video indexing
     */
    function indexVideo(
        string calldata videoCID,
        uint256 videoLengthSeconds
    ) external nonReentrant {
        // Input validation
        if (bytes(videoCID).length == 0) revert InvalidVideoCID();
        if (videoLengthSeconds == 0) revert InvalidVideoLength();

        // Calculate videoCID hash internally
        bytes32 videoCIDHash = _hashVideoCID(videoCID);

        // Check if this video exists already
        if (videos[videoCIDHash].exists) revert DuplicateVideoCID();

        address selectedNode = _randomlyPickNode();

        // Calculate deadline based on video length
        uint256 deadline = _calculateDeadline(videoLengthSeconds);

        // Mark the node as busy
        Node storage node = nodes[selectedNode];
        node.pendingVideoCID = videoCID;
        node.taskAddress = msg.sender;
        node.busy = true;

        // Store video information using videoCIDHash as key
        videos[videoCIDHash] = Video({
            videoCID: videoCID,
            userAddress: msg.sender,
            nodeAddress: selectedNode,
            indexCID: "",
            exists: true,
            requestTimestamp: block.timestamp,
            deadline: deadline
        });

        // Add video to user's videos
        userVideoCIDs[msg.sender].add(videoCIDHash);

        emit VideoIndexingRequested(
            msg.sender,
            videoCID,
            selectedNode,
            deadline
        );
    }

    /**
     * @dev Complete video indexing process
     */
    function completeIndexingVideo(
        string calldata videoCID,
        string calldata indexCID
    ) external nonReentrant {
        // Input validation
        if (bytes(indexCID).length == 0) revert InvalidIndexCID();

        Node storage node = nodes[msg.sender];
        if (!node.exists || !node.busy) revert NodeNotActive();

        bytes32 videoCIDHash = _hashVideoCID(videoCID);
        Video storage video = videos[videoCIDHash];
        if (!video.exists) revert VideoNotFound();

        // Verify this node is assigned to this task
        if (video.nodeAddress != msg.sender) revert UnauthorizedNode();

        // Check that the videoCID matches what was assigned
        if (
            keccak256(abi.encodePacked(video.videoCID)) !=
            keccak256(abi.encodePacked(node.pendingVideoCID))
        ) revert VideoCIDMismatch();

        // Update video with index data
        video.indexCID = indexCID;

        emit VideoIndexingCompleted(
            video.userAddress,
            video.videoCID,
            msg.sender,
            indexCID
        );

        // Update node stats and status
        if (node.operationProofs < MAX_OP_PROOFS) {
            node.operationProofs++;
        }

        // Reset node state
        node.pendingVideoCID = "";
        node.taskAddress = address(0);
        node.busy = false;

        // Make node available for more tasks
        activeNodes.add(msg.sender);
    }

    /**
     * @dev Reassign a timed-out task to a new node
     */
    function reassignTask(string calldata videoCID) external nonReentrant {
        bytes32 videoCIDHash = _hashVideoCID(videoCID);
        Video storage video = videos[videoCIDHash];
        if (!video.exists) revert VideoNotFound();

        // Check if the task has timed out
        if (block.timestamp < video.deadline) revert TaskNotTimedOut();

        address oldNode = video.nodeAddress;
        Node storage node = nodes[oldNode];

        // Simply reset the old node's state if it exists
        if (node.exists) {
            node.busy = false;
            node.pendingVideoCID = "";
            node.taskAddress = address(0);
        }

        // Find a new node to handle the task
        address newNode = _randomlyPickNode();

        // Calculate new deadline using the original video length
        uint256 originalProcessingTime = video.deadline -
            video.requestTimestamp;
        uint256 newDeadline = _calculateDeadline(
            (originalProcessingTime - BUFFER_TIME) / PROCESSING_RATIO
        );

        // Mark the new node as busy
        Node storage newNodeData = nodes[newNode];
        newNodeData.pendingVideoCID = videoCID;
        newNodeData.taskAddress = video.userAddress;
        newNodeData.busy = true;

        // Update video with new node and deadline
        video.nodeAddress = newNode;
        video.requestTimestamp = block.timestamp;
        video.deadline = newDeadline;

        emit TaskReassigned(videoCID, oldNode, newNode, newDeadline);
    }

    // ============ View Functions ============

    /**
     * @dev Get number of active nodes
     */
    function getActiveNodesCount() public view returns (uint256) {
        return activeNodes.length();
    }

    /**
     * @dev Get index data for a specific video
     */
    function getVideoIndexing(
        string calldata videoCID
    ) public view returns (string memory) {
        bytes32 videoCIDHash = _hashVideoCID(videoCID);
        if (!videos[videoCIDHash].exists) revert VideoNotFound();
        return videos[videoCIDHash].indexCID;
    }

    /**
     * @dev Check if a video has been indexed
     */
    function isVideoIndexed(
        string calldata videoCID
    ) public view returns (bool) {
        bytes32 videoCIDHash = _hashVideoCID(videoCID);
        return
            videos[videoCIDHash].exists &&
            bytes(videos[videoCIDHash].indexCID).length > 0;
    }

    /**
     * @dev Get video status - more detailed than isVideoIndexed
     */
    function getVideoStatus(
        string calldata videoCID
    )
        public
        view
        returns (
            bool exists,
            bool isIndexed,
            address nodeAddress,
            uint256 requestTime,
            uint256 deadline,
            bool canReassign
        )
    {
        bytes32 videoCIDHash = _hashVideoCID(videoCID);
        if (!videos[videoCIDHash].exists) {
            return (false, false, address(0), 0, 0, false);
        }

        Video storage video = videos[videoCIDHash];
        bool videoIndexed = bytes(video.indexCID).length > 0;
        bool reassignable = block.timestamp >= video.deadline;

        return (
            true,
            videoIndexed,
            video.nodeAddress,
            video.requestTimestamp,
            video.deadline,
            !videoIndexed && reassignable
        );
    }

    /**
     * @dev Get all video CIDs for a user
     */
    function getUserVideos(
        address userAddress
    ) public view returns (string[] memory) {
        uint256 length = userVideoCIDs[userAddress].length();
        string[] memory userCIDs = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            bytes32 hash = userVideoCIDs[userAddress].at(i);
            userCIDs[i] = videos[hash].videoCID;
        }

        return userCIDs;
    }
}
