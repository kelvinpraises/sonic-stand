"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

import { ConnectButton } from "@/components/molecules/connect-button";
import { ThemeSwitcher } from "@/components/molecules/theme-switcher";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, systemTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <div className="relative flex w-full flex-col items-center gap-8 h-screen dark:bg-dot-white/[0.2] bg-dot-black/[0.2] overflow-scroll">
      <div className="fixed pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-10 flex flex-col items-center gap-8 flex-1 w-full">
        <header className="flex items-center p-4 gap-4 w-full">
          <Image
            alt="sonic-stand logo"
            src={currentTheme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
            width={40}
            height={40}
            className="relative z-10"
          />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeSwitcher />
            <ConnectButton />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
