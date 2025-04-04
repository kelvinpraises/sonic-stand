"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { GlobeMethods } from "react-globe.gl";
import { toast } from "sonner";
import { erc20Abi } from "viem";
import { useAccount, useReadContracts } from "wagmi";

import { Card } from "@/components/atoms/card";
import StandbyButton from "@/components/molecules/standby-button";
import VideoQueueManager from "@/components/organisms/video-queue-manager";
import { useVISENetwork } from "@/hooks/use-vise-network";
import useStore from "@/store";
import TOKEN_DATA from "@/types/contracts/token";

const Globe = dynamic(() => import("@/components/organisms/wrapped-globe"), {
  ssr: false,
});

const GLOBE_POINTS = 250;
const CRYSTAL_TYPES = ["DePIN", "Video", "Indexes", "Network"] as const;
const POINT_COLORS = ["red", "white", "blue", "green"] as const;

const ConsolePage = () => {
  const [currentView, setCurrentView] = useState<"standby" | "dashboard">(
    "standby"
  );
  const globeRef = useRef<GlobeMethods>(null);
  const [loaded, setLoaded] = useState(false);
  const [showComponent, setShowComponent] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [sessionRewards, setSessionRewards] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);

  const { completedIndexes, scenesProcessed } = useStore();
  const { address, isConnected } = useAccount();
  const viseNetwork = useVISENetwork();

  // Get token balance and metadata
  const { data: tokenData } = useReadContracts({
    allowFailure: false,
    contracts: address
      ? [
          {
            address: TOKEN_DATA.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: TOKEN_DATA.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "decimals",
          },
          {
            address: TOKEN_DATA.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "symbol",
          },
        ]
      : [],
  });

  // Format balance with proper decimals
  const formattedBalance = useMemo(() => {
    if (!tokenData || !address) return "0";
    const [balance, decimals] = tokenData;
    return (Number(balance) / 10 ** Number(decimals)).toFixed(2);
  }, [tokenData, address]);

  // Get session rewards
  useEffect(() => {
    const fetchNodeStatus = async () => {
      if (address) {
        try {
          const status = await viseNetwork.getNodeStatus();
          setSessionRewards(Number(status.operationProofs || 0));
        } catch (error) {
          console.error("Error fetching node status:", error);
        }
      }
    };

    fetchNodeStatus();
  }, [address, viseNetwork]);

  // Handle rewards claim
  const handleClaimRewards = async () => {
    if (sessionRewards === 0) {
      toast.error("No rewards available to claim");
      return;
    }

    setIsClaiming(true);
    try {
      await viseNetwork.claimRewards();
      toast.success("Successfully claimed rewards!");
      setSessionRewards(0);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Failed to claim rewards: ${errorMessage}`);
    } finally {
      setIsClaiming(false);
    }
  };

  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const gData = useMemo(
    () =>
      Array.from({ length: GLOBE_POINTS }, () => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() / 3,
        color: POINT_COLORS[Math.floor(Math.random() * POINT_COLORS.length)],
        crystal:
          CRYSTAL_TYPES[Math.floor(Math.random() * CRYSTAL_TYPES.length)],
      })),
    []
  );

  useLayoutEffect(() => {
    if (globeRef.current && typeof window !== "undefined") {
      const controls = globeRef.current.controls();
      controls.autoRotate = false;
      controls.maxDistance = 320;
      controls.minDistance = 320;
      controls.enableZoom = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2.0;
    }
  }, [loaded]);

  const handleStandbyClick = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to continue");
      return;
    }

    // Start loading animation
    setIsJoining(true);

    try {
      // Ensure animation has time to run (minimum 1.5 seconds)
      const joinPromise = viseNetwork.joinPool();
      const animationPromise = new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      // Wait for both the animation and the network request to complete
      await Promise.all([joinPromise, animationPromise]);

      toast.success("Successfully joined the node pool!");

      // Proceed to dashboard view
      setCurrentView("dashboard");
      // Show globe after animation completes
      setTimeout(() => {
        setShowComponent(true);
      }, 1000);
    } catch (error) {
      // Check if error is because user is already in the pool
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Ensure animation has time to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (errorMessage.includes("NodeAlreadyActive")) {
        // If already active, still proceed to dashboard
        toast.info("You're already an active node in the pool");
        setCurrentView("dashboard");
        setTimeout(() => {
          setShowComponent(true);
        }, 1000);
      } else {
        // Show other errors
        toast.error(`Failed to join pool: ${errorMessage}`);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const standbyVariants = {
    enter: {
      scale: 1,
      opacity: 1,
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const dashboardVariants = {
    enter: {
      scale: 2.5,
      opacity: 0,
      y: 500,
    },
    center: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
    },
  };

  return (
    <div className="flex flex-col justify-between items-center flex-1 overflow-hidden w-full">
      <AnimatePresence mode="wait" initial={false}>
        {currentView !== "dashboard" && (
          <motion.div
            key="setup"
            initial="enter"
            animate="enter"
            exit="exit"
            variants={standbyVariants}
            className="flex flex-col justify-start items-center gap-8 md:gap-16 w-full px-4 transform-gpu"
          >
            <div className="flex flex-col justify-center gap-2 p-0">
              <p className="font-atyp text-4xl md:text-5xl max-w-[30ch] text-balance leading-tight text-center">
                Decentralize each story. Unleash it's insights.
              </p>
              <p className="text-sm md:text-base font-medium leading-[17px] text-[#484E62] text-center">
                Join the network, earn VI tokens, and{" "}
                <Link
                  href={"/explore"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#138FA8]"
                >
                  explore
                </Link>{" "}
                indexed videos or add your own.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {currentView === "standby" && (
                <motion.div
                  key="standby"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StandbyButton
                    onClick={handleStandbyClick}
                    isLoading={isJoining}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {currentView === "dashboard" && (
          <motion.div
            key="dashboard"
            initial="enter"
            animate="center"
            exit="exit"
            variants={dashboardVariants}
            className="w-full flex-1 transform-gpu"
          >
            <div className="flex justify-center flex-1 w-full px-2 md:px-4">
              <div className="flex flex-col w-full max-w-4xl">
                <div className="flex flex-col p-2 md:p-4 gap-2 md:gap-4">
                  <h1 className="font-outfit font-semibold text-lg md:text-xl">
                    Node Analytics
                  </h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="flex flex-row justify-between p-4 bg-card text-card-foreground min-w-full md:min-w-80">
                      <div className="flex flex-col gap-3 md:gap-6">
                        <p className="font-outfit font-semibold text-sm md:text-base text-[#484E62] dark:text-[#B7BDD5]">
                          Completed Indexes
                        </p>
                        <p className="text-3xl md:text-4xl font-outfit font-bold">
                          {completedIndexes}
                        </p>
                      </div>
                    </Card>

                    <Card className="flex flex-row justify-between p-4 bg-card text-card-foreground min-w-full md:min-w-80">
                      <div className="flex flex-col gap-3 md:gap-6">
                        <p className="font-outfit font-semibold text-sm md:text-base text-[#484E62] dark:text-[#B7BDD5]">
                          Scenes Processed
                        </p>
                        <p className="text-3xl md:text-4xl font-outfit font-bold">
                          {scenesProcessed}
                        </p>
                      </div>
                    </Card>

                    <Card className="flex flex-row justify-between p-4 bg-card text-card-foreground min-w-full md:min-w-80">
                      <div className="flex flex-col gap-3 md:gap-6">
                        <p className="font-outfit font-semibold text-sm md:text-base text-[#484E62] dark:text-[#B7BDD5]">
                          Total VI Earned
                        </p>
                        <p className="text-3xl md:text-4xl font-outfit font-bold">
                          {formattedBalance}
                        </p>
                      </div>
                    </Card>

                    <Card
                      onClick={handleClaimRewards}
                      className="flex flex-wrap justify-between p-4 cursor-pointer bg-card text-card-foreground gap-2 hover:bg-accent transition-colors"
                    >
                      <div className="flex flex-col gap-3 md:gap-6">
                        <p className="font-outfit font-semibold text-sm md:text-base text-[#484E62] dark:text-[#B7BDD5]">
                          Session Rewards
                        </p>
                        <p className="text-3xl md:text-4xl font-outfit font-bold">
                          {sessionRewards}
                        </p>
                      </div>
                      <p className="font-atyp text-sm text-[#34C759] font-bold self-end">
                        {isClaiming ? "Claiming..." : "Claim ↗"}
                      </p>
                    </Card>
                  </div>
                </div>
                <div className="flex flex-col p-2 md:p-4 gap-2 md:gap-4">
                  <h1 className="font-outfit font-semibold text-lg md:text-xl">
                    Video Queue
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                    {showComponent && <VideoQueueManager />}
                  </div>
                </div>
                <AnimatePresence>
                  {showComponent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center overflow-hidden mb-4 h-[275px]"
                    >
                      <div className="-mt-4">
                        <Globe
                          onGlobeReady={() => setLoaded(true)}
                          globeRef={globeRef}
                          width={600}
                          height={500}
                          globeImageUrl={
                            currentTheme == "dark"
                              ? "/earth-night.jpg"
                              : "/earth-day.jpeg"
                          }
                          backgroundColor="rgba(0, 0, 0, 0)"
                          atmosphereColor="rgba(0, 234, 255, 0.665)"
                          atmosphereAltitude={0.3}
                          pointsData={gData}
                          arcsData={gData}
                          pointAltitude="size"
                          pointColor="color"
                          pointLabel="crystal"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="font-outfit p-4 text-sm">SonicStand powered by VISE</p>
    </div>
  );
};

export default ConsolePage;
