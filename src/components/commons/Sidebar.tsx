import type React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logo.svg";

const menuItems = [
  { to: "/", label: "홈", icon: "home" },
  { to: "/owner/dashboard", label: "점주 홈", icon: "storefront" },
  { to: "/supervisor/dashboard", label: "SV 홈", icon: "analytics" },
  { to: "/hq/control-tower", label: "본사 관제", icon: "monitoring" },
  { to: "/hq/notices", label: "공지 OCR", icon: "scan" },
  { to: "/marketing/campaigns", label: "캠페인 설계", icon: "campaign" },
  { to: "/hq/alerts/detail", label: "이상 경보", icon: "notification_important" },
  { to: "/data/upload", label: "데이터 업로드", icon: "upload_file" },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-border/75 bg-white/92 backdrop-blur-sm lg:flex">
      <div className="flex w-full flex-col p-6">
        <NavLink to="/" className="inline-flex items-center">
          <img src={Logo} alt="AgentGo" className="h-7 w-auto" />
        </NavLink>

        <nav className="mt-7 flex-1 space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                  isActive
                    ? "border border-[#CFE0FF] bg-[#EDF3FF] text-[#2454C8]"
                    : "border border-transparent text-slate-600 hover:border-[#E4EBF8] hover:bg-[#F7FAFF] hover:text-slate-900",
                )
              }
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border/60 pt-4 text-center">
          <p className="text-xs text-slate-400">
            © 2026 ITCEN CLOIT<br/>All rights reserved
          </p>
        </div>
      </div>
    </aside>
  );
};
