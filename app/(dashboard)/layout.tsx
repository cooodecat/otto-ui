"use client";

import React from "react";
import { usePathname } from "next/navigation";
import GlobalSidebar from "@/components/layout/GlobalSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const isCanvasLayoutPath = (pathname: string): boolean => {
  if (pathname === "/pipelines") return true;
  const pipelineDetailPattern = /^\/projects\/[^/]+\/pipelines\/[^/]+$/;
  return pipelineDetailPattern.test(pathname);
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const isCanvasLayout = isCanvasLayoutPath(pathname);

  if (isCanvasLayout) {
    return (
      <div className="min-h-screen relative">
        <GlobalSidebar />
        <main className="min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-0 h-screen p-4">
          <GlobalSidebar />
        </div>
      </div>
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}
