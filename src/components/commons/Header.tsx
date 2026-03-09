import type React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, X } from "lucide-react";
import { sessionUser } from "@/data/sessionUser";

type Crumb = { label: string };

const breadcrumbMap: Record<string, Crumb[]> = {
  "/":                        [{ label: "대시보드" }],
  "/overview":                [{ label: "대시보드" }],
  "/owner/dashboard":         [{ label: "점주" }, { label: "점주 홈" }],
  "/owner/qna":               [{ label: "점주" }, { label: "AI QnA" }],
  "/supervisor/dashboard":    [{ label: "SV" }, { label: "SV 홈" }],
  "/supervisor/analysis":     [{ label: "SV" }, { label: "SV 분석" }],
  "/supervisor/actions":      [{ label: "SV" }, { label: "액션 관리" }],
  "/supervisor/visit-log":    [{ label: "SV" }, { label: "방문 기록" }],
  "/hq/control-tower":        [{ label: "본사" }, { label: "컨트롤 타워" }],
  "/hq/notices":              [{ label: "본사" }, { label: "공지 OCR" }],
  "/hq/alerts/detail":        [{ label: "본사" }, { label: "이상 경보 상세" }],
  "/marketing/campaigns":     [{ label: "마케팅" }, { label: "캠페인 설계" }],
  "/marketing/rfm":           [{ label: "마케팅" }, { label: "고객 세그먼트" }],
  "/marketing/performance":   [{ label: "마케팅" }, { label: "캠페인 성과" }],
  "/analysis/roi":            [{ label: "분석" }, { label: "프로모션 ROI" }],
  "/analysis/benchmark":      [{ label: "분석" }, { label: "매장 벤치마크" }],
  "/reports":                 [{ label: "리포트 / 설정" }, { label: "리포트" }],
  "/settings/users":          [{ label: "리포트 / 설정" }, { label: "사용자 관리" }],
  "/settings/stores":         [{ label: "리포트 / 설정" }, { label: "매장 설정" }],
  "/data/upload":             [{ label: "데이터" }, { label: "데이터 업로드" }],
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
  { id: 3, type: "notice", title: "공지 OCR 완료", desc: "3월 운영 공지 처리 완료", time: "14분 전", read: true },
  { id: 4, type: "upload", title: "데이터 업로드 완료", desc: "매출 데이터 248개 매장 반영", time: "1시간 전", read: true },
];

const notifIcon: Record<Notification["type"], string> = {
  alert: "notification_important",
  workflow: "account_tree",
  notice: "scan",
  upload: "upload_file",
};

export const Header: React.FC = () => {
  const location = useLocation();
  const crumbs = breadcrumbMap[location.pathname] ?? [{ label: "대시보드" }];
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[68px] border-b border-border/75 bg-white/90 backdrop-blur-sm lg:left-64">
      <div className="flex h-full items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">AgentGo Biz</span>
          {crumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
              <span className={i === crumbs.length - 1 ? "text-base font-semibold text-slate-800" : "text-sm font-medium text-slate-500"}>
                {crumb.label}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] text-slate-500 transition-colors hover:border-[#BFD1ED] hover:text-slate-700"
              aria-label="알림"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">알림 인박스</p>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-primary hover:underline"
                        >
                          전체 읽음
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)}>
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 border-b border-border/40 px-4 py-3 last:border-0 ${
                          n.read ? "bg-white" : "bg-[#F7FAFF]"
                        }`}
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          n.type === "alert" ? "bg-red-50" : "bg-[#EEF4FF]"
                        }`}>
                          <span className={`material-symbols-outlined text-[14px] ${
                            n.type === "alert" ? "text-red-500" : "text-primary"
                          }`}>
                            {notifIcon[n.type]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${n.read ? "text-slate-600" : "text-slate-900"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400">{n.desc}</p>
                        </div>
                        <span className="shrink-0 text-[10px] text-slate-400">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Info */}
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
