import type React from "react";
import { useState } from "react";
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
      { to: "/owner/qna", label: "AI QnA", icon: "chat_bubble" },
      { to: "/owner/pos-simulation", label: "POS 시뮬레이션", icon: "terminal" },
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

function getInitialOpen(pathname: string): Set<string> {
  const open = new Set<string>();
  for (const s of menuSections) {
    if (s.section && s.items.some((item) => pathname.startsWith(item.to))) {
      open.add(s.section);
    }
  }
  return open;
}

export const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const [openSections, setOpenSections] = useState<Set<string>>(() => getInitialOpen(pathname));

  const toggle = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-border/75 bg-white/92 backdrop-blur-sm lg:flex">
      <div className="flex w-full flex-col p-5">
        <NavLink to="/" className="inline-flex items-center px-1">
          <img src={Logo} alt="AgentGo" className="h-7 w-auto" />
        </NavLink>

        <nav className="mt-5 flex-1 space-y-0.5 overflow-y-auto pb-4">
          {menuSections.map((section, sIdx) => {
            if (!section.section) {
              return (
                <div key={sIdx}>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end
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
                </div>
              );
            }

            const isOpen = openSections.has(section.section);
            const hasActive = section.items.some((item) => pathname.startsWith(item.to));

            return (
              <div key={sIdx} className="mt-3">
                <button
                  onClick={() => toggle(section.section!)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-1.5 transition-colors",
                    hasActive ? "text-[#2454C8]" : "text-slate-400 hover:text-slate-600",
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {section.section}
                  </span>
                  <span className="material-symbols-outlined text-[14px]">
                    {isOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-0.5 space-y-0.5">
                    {section.items.map((item) => (
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
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border/60 pt-4 text-center">
          <p className="text-xs text-slate-400">
            © 2026 ITCEN CLOIT<br />All rights reserved
          </p>
        </div>
      </div>
    </aside>
  );
};
