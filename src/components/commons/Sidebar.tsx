import type React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logo.svg";
import { ChevronDown, User, ShieldCheck, Building2 } from "lucide-react";

type Persona = "owner" | "sv" | "hq";

const personaInfo = {
  owner: { label: "가맹점주", icon: User, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  sv: { label: "슈퍼바이저", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
  hq: { label: "본사 관리자", icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
};

type MenuItem = {
  to: string;
  label: string;
  icon: string;
};

type MenuSection = {
  section?: string;
  items: MenuItem[];
  persona?: Persona;
};

const menuSections: MenuSection[] = [
  {
    items: [{ to: "/", label: "홈", icon: "home" }],
  },
  {
    section: "운영 관리",
    persona: "owner",
    items: [
      { to: "/owner/dashboard", label: "매장 대시보드", icon: "dashboard" },
      { to: "/owner/stock-take", label: "재고 실사", icon: "inventory_2" },
      { to: "/owner/labor", label: "인력 최적화", icon: "groups" },
    ],
  },
  {
    section: "구역 관리",
    persona: "sv",
    items: [
      { to: "/supervisor/dashboard", label: "구역 통합 허브", icon: "analytics" },
      { to: "/supervisor/analysis", label: "리스크 분석", icon: "compare" },
      { to: "/supervisor/actions", label: "액션 센터", icon: "task_alt" },
      { to: "/supervisor/visit-log", label: "방문 일지", icon: "map" },
    ],
  },
  {
    section: "전략 관제",
    persona: "hq",
    items: [
      { to: "/hq/control-tower", label: "본사 컨트롤타워", icon: "monitoring" },
      { to: "/marketing/campaigns", label: "캠페인 관리", icon: "campaign" },
      { to: "/analysis/roi", label: "프로모션 ROI", icon: "trending_up" },
      { to: "/hq/notices", label: "비전 AI 공지", icon: "document_scanner" },
    ],
  },
  {
    section: "시스템",
    items: [
      { to: "/reports", label: "통합 리포트", icon: "description" },
      { to: "/settings/users", label: "사용자 관리", icon: "manage_accounts" },
      { to: "/data/upload", label: "데이터 파이프라인", icon: "upload_file" },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const [activePersona, setActivePersona] = useState<Persona>("owner");
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const filteredSections = menuSections.filter(
    (s) => !s.persona || s.persona === activePersona
  );

  const CurrentPersonaIcon = personaInfo[activePersona].icon;

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-border bg-white lg:flex flex-col">
      <div className="flex w-full flex-col p-5 flex-1 overflow-hidden">
        <NavLink to="/" className="inline-flex items-center px-1 mb-8">
          <img src={Logo} alt="AgentGo" className="h-7 w-auto" />
        </NavLink>

        {/* Persona Selector */}
        <div className="relative mb-6">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-[#F7FAFF] p-3 transition-all hover:border-primary/30 active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-1.5", personaInfo[activePersona].bg)}>
                <CurrentPersonaIcon className={cn("h-4 w-4", personaInfo[activePersona].color)} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 leading-none">접근 권한</p>
                <p className="text-sm font-bold text-slate-800 leading-none">{personaInfo[activePersona].label}</p>
              </div>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", showPersonaMenu && "rotate-180")} />
          </button>

          {showPersonaMenu && (
            <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-white p-1 shadow-lg animate-in fade-in slide-in-from-top-1">
              {(Object.keys(personaInfo) as Persona[]).map((p) => {
                const PIcon = personaInfo[p].icon;
                return (
                  <button
                    key={p}
                    onClick={() => { setActivePersona(p); setShowPersonaMenu(false); }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      activePersona === p ? "bg-[#EEF4FF] text-primary" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <PIcon className="h-4 w-4" />
                    <span>{personaInfo[p].label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto pb-6 scrollbar-hide">
          {filteredSections.map((section, sIdx) => {
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
