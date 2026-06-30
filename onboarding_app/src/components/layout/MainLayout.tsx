"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { toggleSidebar } from "@/rtk/slices/uiSlice";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => dispatch(toggleSidebar())}
      />

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} />

        {/* Content Area */}
        <main className="flex-1 overflow-auto pt-20">{children}</main>
      </div>
    </div>
  );
}
