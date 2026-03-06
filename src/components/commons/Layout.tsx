import type React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { GlobalFilterBar } from "./GlobalFilterBar";
import { Sidebar } from "./Sidebar";

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <Header />
      <GlobalFilterBar />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <main className="mx-auto w-full flex-1 px-5 pb-14 pt-[132px] md:px-8 lg:max-w-none lg:px-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

