import type React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/useAuth";
import Logo from "@/assets/logo.svg";

type Role = "hq_admin" | "supervisor" | "store_owner" | "marketer";

type MenuItem = {
  to: string;
  label: string;
  icon: string;
};

type MenuSection = {
  section?: string;
  items: MenuItem[];
  roles?: Role[]; // undefined = 모든 역할에 표시
};

const menuSections: MenuSection[] = [
  {
    items: [
      { to: "/", label: "홈", icon: "home" },
    ],
  },
  {
    section: "점주",
    roles: ["store_owner", "supervisor", "hq_admin"],
    items: [
      { to: "/owner/dashboard", label: "점주 홈", icon: "storefront" },
      { to: "/owner/labor", label: "인력 최적화", icon: "group" },
      { to: "/owner/stock-take", label: "재고 실사 관리", icon: "inventory_2" },
    ],
  },
  {
    section: "마케팅",
    roles: ["marketer", "hq_admin"],
    items: [
      { to: "/marketing/campaigns", label: "캠페인 설계", icon: "campaign" },
      { to: "/marketing/rfm", label: "고객 세그먼트", icon: "group" },
      { to: "/marketing/performance", label: "캠페인 성과", icon: "bar_chart" },
    ],
  },
  {
    section: "분석",
    roles: ["store_owner", "supervisor", "hq_admin", "marketer"],
    items: [
      { to: "/analysis/roi", label: "프로모션 ROI", icon: "trending_up" },
      { to: "/analysis/benchmark", label: "매장 벤치마크", icon: "leaderboard" },
    ],
  },
  {
    section: "SV",
    roles: ["supervisor", "hq_admin"],
    items: [
      { to: "/supervisor/dashboard", label: "SV 홈", icon: "analytics" },
      { to: "/supervisor/analysis", label: "SV 분석", icon: "compare" },
      { to: "/supervisor/actions", label: "액션 관리", icon: "task_alt" },
      { to: "/supervisor/visit-log", label: "방문 기록", icon: "map" },
    ],
  },
  {
    section: "본사",
    roles: ["hq_admin"],
    items: [
      { to: "/hq/control-tower", label: "본사 관제", icon: "monitoring" },
      { to: "/hq/notices", label: "공지 OCR", icon: "scan" },
      { to: "/hq/alerts/detail", label: "이상 경보", icon: "notification_important" },
    ],
  },
  {
    section: "리포트 / 설정",
    roles: ["hq_admin", "supervisor"],
    items: [
      { to: "/reports", label: "리포트", icon: "description" },
      { to: "/settings/users", label: "사용자 관리", icon: "manage_accounts" },
      { to: "/settings/stores", label: "매장 설정", icon: "store" },
    ],
  },
  {
    section: "데이터",
    roles: ["hq_admin"],
    items: [
      { to: "/data/upload", label: "데이터 업로드", icon: "upload_file" },
      { to: "/admin/settings", label: "시스템 설정", icon: "settings" },
    ],
  },
];

const roleConfig: Record<string, { label: string; icon: string }> = {
  hq_admin: { label: "본사 관리자", icon: "corporate_fare" },
  marketer: { label: "본사 마케터", icon: "campaign" },
  supervisor: { label: "수퍼바이저", icon: "shield_person" },
  store_owner: { label: "가맹점주", icon: "storefront" },
};

export const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { user, setUser } = useAuth();
  
  // 유저 역할이 정의되지 않은 경우 기본값으로 가맹점주 설정
  const currentRole = (user?.role as Role) || "store_owner";

  const handleRoleChange = (newRole: Role) => {
    if (!user) return;
    
    // 1. AuthContext 업데이트 (App.tsx 라우팅 및 Sidebar 메뉴 즉시 반영)
    setUser({
      ...user,
      role: newRole,
      // 점주일 때만 데모 매장 ID 할당, 나머지는 null (본사/SV는 전역 관점)
      store_id: newRole === "store_owner" ? "demo-store" : null,
    });
    
    // 2. LocalStorage 업데이트 (새로고침 시 유지용 - auth.ts의 BYPASS_ROLE_KEY와 일치)
    localStorage.setItem("bypassUserRole", newRole);
  };

  const visibleSections = menuSections.filter(
    (s) => !s.roles || s.roles.includes(currentRole)
  );

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-border bg-white lg:flex shadow-sm z-50">
      <div className="flex w-full flex-col p-5">
        {/* 로고 */}
        <NavLink to="/" className="inline-flex items-center px-1 mb-6">
          <img src={Logo} alt="AgentGo" className="h-7 w-auto" />
        </NavLink>

        {/* 역할 선택 셀렉트박스 (데모/테스트용 스위처) */}
        <div className="mb-6 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="material-symbols-outlined text-[18px] text-primary">
              {roleConfig[currentRole]?.icon || "person"}
            </span>
          </div>
          <select
            value={currentRole}
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            className="w-full appearance-none rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] py-3 pl-10 pr-10 text-[13px] font-bold text-slate-700 focus:outline-none focus:border-primary cursor-pointer transition-all hover:bg-[#EEF4FF]"
          >
            {(Object.keys(roleConfig) as Role[]).map((r) => (
              <option key={r} value={r}>{roleConfig[r].label}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="material-symbols-outlined text-[18px] text-slate-400">
              expand_more
            </span>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 space-y-6 overflow-y-auto pb-6 scrollbar-hide">
          {visibleSections.map((section, sIdx) => {
            const hasActive = section.items.some((item) =>
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)
            );

            return (
              <div key={sIdx} className="space-y-1.5">
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
                          {isActive && (
                            <div className="absolute left-[-9px] top-1/4 h-1/2 w-1 rounded-r-full bg-[#2454C8]" />
                          )}
                          <span className={cn(
                            "material-symbols-outlined text-[20px] transition-colors",
                            isActive ? "text-[#2454C8]" : "text-slate-400 group-hover:text-slate-600"
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
