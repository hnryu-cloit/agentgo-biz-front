import type React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, X, Settings, LogOut, ChevronRight } from "lucide-react";
import { sessionUser } from "@/data/sessionUser";
import { cn } from "@/lib/utils";

type Crumb = { label: string };

const breadcrumbMap: Record<string, Crumb[]> = {
  "/":                        [{ label: "Dashboard" }],
  "/overview":                [{ label: "Dashboard" }],
  "/owner/dashboard":         [{ label: "Owner" }, { label: "Home" }],
  "/supervisor/dashboard":    [{ label: "SV" }, { label: "Home" }],
  "/supervisor/analysis":     [{ label: "SV" }, { label: "Risk Analysis" }],
  "/supervisor/actions":      [{ label: "SV" }, { label: "Action Management" }],
  "/supervisor/visit-log":    [{ label: "SV" }, { label: "Visit Logs" }],
  "/hq/control-tower":        [{ label: "HQ" }, { label: "Control Tower" }],
  "/hq/notices":              [{ label: "HQ" }, { label: "Vision Automation" }],
  "/hq/alerts/detail":        [{ label: "HQ" }, { label: "Alert Detail" }],
  "/marketing/campaigns":     [{ label: "Marketing" }, { label: "Campaign Designer" }],
  "/marketing/rfm":           [{ label: "Marketing" }, { label: "RFM Matrix" }],
  "/analysis/roi":            [{ label: "Analysis" }, { label: "Promo ROI" }],
  "/owner/stock-take":        [{ label: "Owner" }, { label: "Inventory Audit" }],
  "/owner/labor":             [{ label: "Owner" }, { label: "Labor Force" }],
};

type Notification = {
  id: number;
  type: "alert" | "workflow" | "notice" | "upload";
  title: string;
  desc: string;
  time: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  { id: 1, type: "alert", title: "이상 결제 탐지", desc: "A매장 취소율 급증 (P0)", time: "방금 전", read: false },
  { id: 2, type: "workflow", title: "AI 분석 완료", desc: "전략 에이전트 실행 완료", time: "3분 전", read: false },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const crumbs = breadcrumbMap[location.pathname] ?? [{ label: "Dashboard" }];
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[68px] border-b border-border/50 bg-white/80 backdrop-blur-xl lg:left-64">
      <div className="flex h-full items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="ds-eyebrow !text-subtle-foreground/40">AgentGo Biz</span>
          <div className="flex items-center gap-2">
            {crumbs.map((crumb, i) => (
              <div key={crumb.label} className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-border-strong" />
                <span className={cn(
                  "text-[13px] font-black tracking-tight transition-colors uppercase",
                  i === crumbs.length - 1 ? "text-foreground" : "text-muted-foreground/60"
                )}>
                  {crumb.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition-all hover:border-primary/30 hover:text-primary active:scale-90"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden ds-card !p-0 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-border/50 px-5 py-4 bg-panel-soft/30">
                    <p className="text-xs font-black uppercase tracking-widest text-foreground">Inbox</p>
                    <button onClick={() => setNotifOpen(false)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/40 scrollbar-hide">
                    {notifications.map((n) => (
                      <div key={n.id} className={cn("px-5 py-4 transition-colors hover:bg-panel-soft/30", !n.read && "bg-primary/[0.02]")}>
                        <div className="flex items-start gap-3">
                          <div className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", n.type === "alert" ? "bg-destructive" : "bg-primary")} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-foreground italic leading-tight">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground font-medium mt-1">{n.desc}</p>
                            <p className="text-[9px] text-subtle-foreground font-black uppercase mt-2 tracking-tighter italic">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex h-10 items-center gap-3 rounded-xl border border-border bg-white pl-2.5 pr-3 transition-all hover:border-primary/30 active:scale-95"
            >
              <div className="h-7 w-7 overflow-hidden rounded-lg bg-primary flex items-center justify-center text-white text-[10px] font-black uppercase italic shadow-lg shadow-primary/20">
                {sessionUser.initials}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[11px] font-black text-foreground leading-none">{sessionUser.name}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{sessionUser.roleLabel}</p>
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden ds-card !p-0 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="border-b border-border/50 px-5 py-4 bg-panel-soft/30">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Authenticated</p>
                    <p className="text-xs font-black text-foreground">{sessionUser.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate("/admin/settings"); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:bg-panel-soft hover:text-foreground italic"
                    >
                      <Settings className="h-3.5 w-3.5" /> Account Settings
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate("/login"); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-destructive transition-colors hover:bg-destructive-soft italic"
                    >
                      <LogOut className="h-3.5 w-3.5" /> System Signout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
