"use client";

const StandbyButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className="
      w-[136px] min-h-[136px] flex items-center justify-center rounded-full border-[6px] border-solid border-[#138FA8] dark:border-[#0D4B58] hover:bg-[#F1FDFF] dark:hover:bg-transparent shadow-[0_0px_10px_#AEF2FF,0_1px_5px_#AEF2FF] dark:shadow-[0_0px_10px_#0B282F,0_1px_8px_#0B282F] hover:shadow-[0_0px_10px_#AEF2FF,0_1px_20px_#AEF2FF] dark:hover:shadow-[0_0px_10px_#0B282F,0_1px_20px_#0B282F] active:shadow-[0_0px_1px_#AEF2FF] dark:active:shadow-[0_0px_1px_#0B282F] active:translate-y-[1px] active:bg-[#] animate-shimmer bg-[linear-gradient(110deg,#fafeff,30%,#ddf9ff,50%,#fafeff)] bg-[length:200%_100%] dark:bg-[linear-gradient(110deg,#1A1F20,30%,#0B282F,50%,#1A1F20)] transition-colors"
      onClick={onClick}
    >
      <img src="/Standby.svg" className="dark:invert" alt="standby image" />
    </button>
  );
};

export default StandbyButton;
