import type React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logo.svg";

type MenuItem = {
  to: string;
  label: string;
  icon: string;
};

type MenuSection = {
  section?: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    items: [
      { to: "/", label: "홈", icon: "home" },
    ],
  },
  {
    section: "점주",
    items: [
      { to: "/owner/dashboard", label: "점주 홈", icon: "storefront" },
      { to: "/owner/stock-take", label: "재고 실사", icon: "inventory_2" },
      { to: "/owner/labor", label: "인력 최적화", icon: "groups" },
    ],
  },
  {
    section: "마케팅",
    items: [
      { to: "/marketing/campaigns", label: "캠페인 설계", icon: "campaign" },
      { to: "/marketing/rfm", label: "고객 세그먼트", icon: "group" },
      { to: "/marketing/performance", label: "캠페인 성과", icon: "bar_chart" },
    ],
  },
  {
    section: "분석",
    items: [
      { to: "/analysis/roi", label: "프로모션 ROI", icon: "trending_up" },
      { to: "/analysis/benchmark", label: "매장 벤치마크", icon: "leaderboard" },
    ],
  },
  {
    section: "SV",
    items: [
      { to: "/supervisor/dashboard", label: "SV 홈", icon: "analytics" },
      { to: "/supervisor/analysis", label: "SV 분석", icon: "compare" },
      { to: "/supervisor/actions", label: "액션 관리", icon: "task_alt" },
      { to: "/supervisor/visit-log", label: "방문 기록", icon: "map" },
    ],
  },
  {
    section: "본사",
    items: [
      { to: "/hq/control-tower", label: "본사 관제", icon: "monitoring" },
      { to: "/hq/notices", label: "공지 OCR", icon: "scan" },
      { to: "/hq/alerts/detail", label: "이상 경보", icon: "notification_important" },
    ],
  },
  {
    section: "리포트 / 설정",
    items: [
      { to: "/reports", label: "리포트", icon: "description" },
      { to: "/settings/users", label: "사용자 관리", icon: "manage_accounts" },
      { to: "/settings/stores", label: "매장 설정", icon: "store" },
    ],
  },
  {
    section: "데이터",
    items: [
      { to: "/data/upload", label: "데이터 업로드", icon: "upload_file" },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-border bg-white lg:flex">
      <div className="flex w-full flex-col p-5">
        <NavLink to="/" className="inline-flex items-center px-1">
          <img src={Logo} alt="AgentGo" className="h-7 w-auto" />
        </NavLink>

        <nav className="mt-6 flex-1 space-y-5 overflow-y-auto pb-6 scrollbar-hide">
          {menuSections.map((section, sIdx) => {
            const hasActive = section.items.some((item) => 
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)
            );

            return (
              <div key={sIdx} className="space-y-1">
                {section.section && (
                  <div className="px-3 py-1">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.12em]",
                      hasActive ? "text-primary" : "text-slate-400"
                    )}>
                      {section.section}
                    </span>
                  </div>
                )}

                <div className={cn(
                  "space-y-0.5",
                  section.section && "relative ml-1 border-l border-slate-100 pl-2"
                )}>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all",
                          isActive
                            ? "bg-[#EDF3FF] text-[#2454C8]"
                            : "text-slate-500 hover:bg-[#F7FAFF] hover:text-slate-900"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Indicator Bar */}
                          {isActive && (
                            <div className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-[#2454C8]" />
                          )}
                          
                          <span className={cn(
                            "material-symbols-outlined text-[20px] transition-colors",
                            isActive ? "text-[#2454C8] font-variation-fill" : "text-slate-400 group-hover:text-slate-600"
                          )}>
                            {item.icon}
                          </span>
                          <span className={isActive ? "font-bold" : "font-medium"}>
                            {item.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border/60 pt-4 text-center">
          <p className="text-[10px] leading-relaxed text-slate-400">
            © 2026 ITCEN CLOIT<br />All rights reserved
          </p>
        </div>
      </div>
    </aside>
  );
};
