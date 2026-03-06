import type React from "react";
import { useLocation } from "react-router-dom";
import { sessionUser } from "@/data/sessionUser";

const pageTitleMap: Record<string, string> = {
  "/": "대시보드",
  "/owner/dashboard": "점주 홈",
  "/supervisor/dashboard": "수퍼바이저 보드",
  "/hq/control-tower": "컨트롤 타워",
  "/hq/notices": "공지 OCR",
  "/marketing/campaigns": "캠페인 설계",
  "/hq/alerts/detail": "이상 경보 상세",
  "/data/upload": "데이터 업로드",
  "/overview": "개요",
};

export const Header: React.FC = () => {
  const location = useLocation();
  const pageTitle = pageTitleMap[location.pathname] ?? "대시보드";

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[68px] border-b border-border/75 bg-white/90 backdrop-blur-sm lg:left-64">
      <div className="flex h-full items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">AgentGo Biz</span>
          <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
          <span className="text-base font-semibold text-slate-800">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden h-[42px] w-[270px] items-center justify-between rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-[10px] md:flex">
            <div className="size-[28px] overflow-hidden rounded-full border border-[#CCDAF0] bg-[linear-gradient(135deg,#316BFF_0%,#4AA2FF_100%)] text-white">
              {sessionUser.avatarUrl ? (
                <img src={sessionUser.avatarUrl} alt={sessionUser.name} className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-[12px] font-bold">{sessionUser.initials}</div>
              )}
            </div>
            <div className="mx-2 flex-1 truncate">
              <p className="truncate text-[13px] font-semibold leading-tight text-slate-800">{sessionUser.name}</p>
              <p className="truncate text-[11px] leading-tight text-slate-500">{sessionUser.email}</p>
            </div>
            <button className="text-slate-400" aria-label="user menu">
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

