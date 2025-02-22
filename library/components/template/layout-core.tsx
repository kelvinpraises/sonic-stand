"use client";

import { Source_Code_Pro } from "next/font/google";

import { Toaster } from "@/components/atoms/sonner";
import RootProvider from "@/providers";
import "@/styles/globals.css";
import { cn } from "@/utils";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], preload: true });

const CoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(sourceCodePro.className)}>
        <main className="flex w-screen h-screen">
          <RootProvider>{children}</RootProvider>
        </main>
        <Toaster />
      </body>
    </html>
  );
};

export default CoreLayout;
