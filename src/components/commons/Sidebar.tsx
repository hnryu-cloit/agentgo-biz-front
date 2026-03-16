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
  hq: { label: "본사 관제", icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
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
    items: [{ to: "/", label: "Home", icon: "home" }],
  },
  {
    section: "Operation",
    persona: "owner",
    items: [
      { to: "/owner/dashboard", label: "Store Dashboard", icon: "dashboard" },
      { to: "/owner/stock-take", label: "Inventory Audit", icon: "inventory_2" },
      { to: "/owner/labor", label: "Labor Force", icon: "groups" },
    ],
  },
  {
    section: "District",
    persona: "sv",
    items: [
      { to: "/supervisor/dashboard", label: "District Hub", icon: "analytics" },
      { to: "/supervisor/analysis", label: "Risk Analysis", icon: "compare" },
      { to: "/supervisor/actions", label: "Action Center", icon: "task_alt" },
      { to: "/supervisor/visit-log", label: "Visit Logs", icon: "map" },
    ],
  },
  {
    section: "Strategic",
    persona: "hq",
    items: [
      { to: "/hq/control-tower", label: "Control Tower", icon: "monitoring" },
      { to: "/marketing/campaigns", label: "Campaigns", icon: "campaign" },
      { to: "/analysis/roi", label: "Promo ROI", icon: "trending_up" },
      { to: "/hq/notices", label: "Vision AI", icon: "document_scanner" },
    ],
  },
  {
    section: "System",
    items: [
      { to: "/reports", label: "Reports", icon: "description" },
      { to: "/settings/users", label: "User Accounts", icon: "manage_accounts" },
      { to: "/data/upload", label: "Data Pipeline", icon: "upload_file" },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const [activePersona, setActivePersona] = useState<Persona>("owner");
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const filteredSections = menuSections.filter(
    (s) => !s.persona || s.persona === activePersona
  );

  const CurrentPersonaIcon = personaInfo[activePersona].icon;

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-border/50 bg-white lg:flex flex-col">
      <div className="p-8 pb-4">
        <NavLink to="/" className="inline-flex items-center gap-3 mb-10">
          <img src={Logo} alt="AgentGo" className="h-8 w-auto" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic opacity-40">Biz Platform</span>
        </NavLink>

        {/* Persona Selector */}
        <div className="relative mb-8">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-panel-soft/50 p-4 transition-all hover:border-primary/20 active:scale-95 group"
          >
            <div className="flex items-center gap-4">
              <div className={cn("rounded-xl p-2.5 shadow-sm transition-transform group-hover:rotate-3", personaInfo[activePersona].bg)}>
                <CurrentPersonaIcon className={cn("h-4 w-4", personaInfo[activePersona].color)} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-subtle-foreground uppercase tracking-widest leading-none mb-1">Access Role</p>
                <p className="text-sm font-black text-foreground italic leading-none">{personaInfo[activePersona].label}</p>
              </div>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-subtle-foreground transition-transform duration-300", showPersonaMenu && "rotate-180")} />
          </button>

          {showPersonaMenu && (
            <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden ds-card !p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
              {(Object.keys(personaInfo) as Persona[]).map((p) => {
                const PIcon = personaInfo[p].icon;
                return (
                  <button
                    key={p}
                    onClick={() => { setActivePersona(p); setShowPersonaMenu(false); }}
                    className={cn(
                      "flex w-full items-center gap-4 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all italic",
                      activePersona === p ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-panel-soft hover:text-foreground"
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

        <nav className="space-y-10 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-hide">
          {filteredSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              {section.section && (
                <div className="px-2">
                  <span className="ds-eyebrow !text-[9px] !text-muted-foreground/40 italic">
                    {section.section}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-4 rounded-xl px-4 py-3 transition-all",
                        isActive
                          ? "bg-primary shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:bg-panel-soft/50 hover:text-foreground"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={cn(
                          "material-symbols-outlined text-[20px] transition-colors",
                          isActive ? "text-white" : "text-subtle-foreground/60 group-hover:text-primary"
                        )}>
                          {item.icon}
                        </span>
                        <span className={cn(
                          "text-[13px] font-black uppercase tracking-tight italic",
                          isActive ? "text-white" : ""
                        )}>
                          {item.label}
                        </span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-border/50">
        <div className="p-5 ds-glass rounded-[2rem] border-primary/5 flex items-center gap-4 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-ai-gradient flex items-center justify-center text-white text-xs font-black italic shadow-lg shadow-primary/20">JD</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-foreground truncate italic">Hong Gil-dong</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="live-point" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60">Session Active</span>
            </div>
          </div>
        </div>
        <p className="text-[9px] font-black text-subtle-foreground/30 uppercase tracking-[0.3em] text-center leading-relaxed italic">
          Control Tower v1.0<br />© 2026 ITCEN CLOIT
        </p>
      </div>
    </aside>
  );
};
