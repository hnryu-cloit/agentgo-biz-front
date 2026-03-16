import type React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { GlobalFilterBar } from "./GlobalFilterBar";
import { Sidebar } from "./Sidebar";
import { FloatingAiChat } from "./FloatingAiChat";

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen text-foreground selection:bg-primary/10 selection:text-primary">
      <Sidebar />
      <Header />
      <GlobalFilterBar />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <main className="flex-1 pt-[132px]">
          <div className="ds-main-container">
            <Outlet />
          </div>
        </main>
      </div>

      <FloatingAiChat />
    </div>
  );
};

