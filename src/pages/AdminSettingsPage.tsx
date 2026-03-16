import { useState } from "react";
import {
  User, Lock, Bell, Settings, Shield, ClipboardList,
  CheckCircle2, ChevronRight, LogOut, Eye, EyeOff,
} from "lucide-react";
import { sessionUser } from "@/data/sessionUser";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// ─── 탭 ───────────────────────────────────────────────────────────────────
type Tab = "account" | "notifications" | "system" | "audit";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "account",       label: "내 계정",    icon: <User className="h-4 w-4" /> },
  { value: "notifications", label: "알림 설정",  icon: <Bell className="h-4 w-4" /> },
  { value: "system",        label: "시스템",     icon: <Settings className="h-4 w-4" /> },
  { value: "audit",         label: "감사 로그",  icon: <ClipboardList className="h-4 w-4" /> },
];

// ─── 목업 감사 로그 ────────────────────────────────────────────────────────
const auditLogs = [
  { id: "a1", action: "로그인",             target: "—",                  ip: "211.234.12.45",  at: "2026-03-15 09:02" },
  { id: "a2", action: "캠페인 승인 요청",   target: "이탈고객 복귀 쿠폰", ip: "211.234.12.45",  at: "2026-03-15 10:18" },
  { id: "a3", action: "데이터 업로드",      target: "매출_강남역점.xlsx",  ip: "211.234.12.45",  at: "2026-03-14 16:34" },
  { id: "a4", action: "사용자 비활성화",    target: "박준혁 (store_owner)",ip: "211.234.12.45",  at: "2026-03-14 11:05" },
  { id: "a5", action: "로그아웃",           target: "—",                  ip: "211.234.12.45",  at: "2026-03-13 18:22" },
  { id: "a6", action: "비밀번호 변경",      target: "—",                  ip: "220.70.88.101",  at: "2026-03-12 09:55" },
  { id: "a7", action: "로그인",             target: "—",                  ip: "220.70.88.101",  at: "2026-03-12 09:53" },
];

// ─── 알림 설정 목업 ────────────────────────────────────────────────────────
type NotifSetting = { id: string; label: string; desc: string; email: boolean; push: boolean; sms: boolean };
const initNotifSettings: NotifSetting[] = [
  { id: "n1", label: "이상 결제 경보",        desc: "취소율·할인 과다·포인트 누수 탐지",   email: true,  push: true,  sms: true  },
  { id: "n2", label: "AI 분석 완료",          desc: "에이전트 분석·전략 생성 완료",        email: false, push: true,  sms: false },
  { id: "n3", label: "데이터 업로드 결과",    desc: "업로드 완료 또는 오류 발생 시",       email: true,  push: true,  sms: false },
  { id: "n4", label: "캠페인 승인 요청",      desc: "발송 승인 대기 시 즉시 알림",         email: true,  push: true,  sms: true  },
  { id: "n5", label: "리포트 생성 완료",      desc: "일간·주간 리포트 생성 시",           email: true,  push: false, sms: false },
  { id: "n6", label: "에이전트 장애",         desc: "에이전트 상태 주의·장애 발생 시",     email: true,  push: true,  sms: true  },
];

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────
export const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("account");

  // 내 계정
  const [name, setName]           = useState(sessionUser.name);
  const [email, setEmail]         = useState(sessionUser.email);
  const [showPw, setShowPw]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [twoFa, setTwoFa]         = useState(false);

  // 알림 설정
  const [notifSettings, setNotifSettings] = useState(initNotifSettings);

  // 시스템
  const [timezone, setTimezone]     = useState("Asia/Seoul");
  const [language, setLanguage]     = useState("ko");
  const [retention, setRetention]   = useState("13");
  const [darkMode, setDarkMode]     = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleNotif = (id: string, channel: "email" | "push" | "sms") => {
    setNotifSettings((prev) =>
      prev.map((n) => n.id === id ? { ...n, [channel]: !n[channel as keyof NotifSetting] } : n)
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* 저장 토스트 */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          변경사항이 저장되었습니다.
        </div>
      )}

      {/* ── 헤더 ── */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div className="h-14 w-14 overflow-hidden rounded-2xl border-2 border-[#c9d8ff] bg-[linear-gradient(135deg,#316BFF_0%,#4AA2FF_100%)]">
              {sessionUser.avatarUrl ? (
                <img src={sessionUser.avatarUrl} alt={sessionUser.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xl font-bold text-white">
                  {sessionUser.initials}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{sessionUser.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full border border-[#c9d8ff] bg-[#eef3ff] px-2.5 py-0.5 text-[11px] font-black text-primary">
                  {sessionUser.roleLabel}
                </span>
                <span className="text-sm text-[var(--subtle-foreground)]">{sessionUser.email}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>

        {/* 탭 */}
        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-all shadow-sm",
                activeTab === tab.value
                  ? "border-[#c9d8ff] bg-[#eef3ff] text-primary"
                  : "border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff]"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 내 계정 탭 ── */}
      {activeTab === "account" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* 프로필 정보 */}
          <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <User className="h-4 w-4 text-[var(--subtle-foreground)]" />
              프로필 정보
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">이름</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">이메일</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">역할</label>
                <div className="flex h-10 items-center rounded-lg border border-[#d5deec] bg-[#f4f7ff] px-3 text-sm text-[var(--subtle-foreground)]">
                  {sessionUser.roleLabel} <span className="ml-2 text-[10px] font-bold text-[#b0bdd4]">(변경 불가 — 관리자 문의)</span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">사용자 ID</label>
                <div className="flex h-10 items-center rounded-lg border border-[#d5deec] bg-[#f4f7ff] px-3 font-mono text-sm text-[var(--subtle-foreground)]">
                  {sessionUser.id}
                </div>
              </div>
            </div>
            <button onClick={handleSave} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
              저장
            </button>
          </section>

          {/* 보안 설정 */}
          <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Lock className="h-4 w-4 text-[var(--subtle-foreground)]" />
              보안 설정
            </h3>

            {/* 비밀번호 변경 */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">비밀번호 변경</p>
              {["현재 비밀번호", "새 비밀번호", "새 비밀번호 확인"].map((label) => (
                <div key={label}>
                  <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 pr-9 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--subtle-foreground)] hover:text-[#4a5568]"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handleSave} className="w-full rounded-lg border border-[#d5deec] bg-card px-4 py-2.5 text-sm font-semibold text-[#34415b] shadow-sm transition-colors hover:bg-[#f4f7ff]">
                비밀번호 변경
              </button>
            </div>

            {/* 2FA */}
            <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[var(--subtle-foreground)]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1a2138]">2단계 인증 (OTP)</p>
                    <p className="text-xs text-[var(--subtle-foreground)]">로그인 시 추가 인증 코드 요구</p>
                  </div>
                </div>
                <button
                  onClick={() => setTwoFa((v) => !v)}
                  className={cn(
                    "relative h-6 w-11 rounded-full border transition-colors",
                    twoFa ? "border-primary bg-primary" : "border-[var(--border)] bg-[var(--muted)]"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform",
                    twoFa ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </div>
              {twoFa && (
                <p className="mt-2 text-xs text-primary font-semibold">
                  ✓ 다음 로그인 시 OTP 설정이 적용됩니다.
                </p>
              )}
            </div>

            {/* 최근 로그인 */}
            <div className="rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">최근 로그인</p>
              <div className="space-y-1.5 text-xs text-[#4a5568]">
                <div className="flex justify-between"><span>2026-03-15 09:02</span><span className="font-mono text-[var(--subtle-foreground)]">211.234.12.45</span></div>
                <div className="flex justify-between"><span>2026-03-12 09:53</span><span className="font-mono text-[var(--subtle-foreground)]">220.70.88.101</span></div>
                <div className="flex justify-between"><span>2026-03-10 08:41</span><span className="font-mono text-[var(--subtle-foreground)]">211.234.12.45</span></div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── 알림 설정 탭 ── */}
      {activeTab === "notifications" && (
        <section className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">알림 채널별 설정</h3>
            <span className="text-[11px] font-black text-[#b0bdd4] uppercase tracking-widest">Email · Push · SMS</span>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[var(--panel-soft)] text-muted-foreground border-b border-border">
                <tr>
                  <th className="pl-8 pr-4 py-4 text-left font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40">알림 유형</th>
                  <th className="px-4 py-4 text-left font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40">설명</th>
                  <th className="px-6 py-4 text-center font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 w-24">이메일</th>
                  <th className="px-6 py-4 text-center font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 w-24">푸시</th>
                  <th className="pl-6 pr-8 py-4 text-center font-bold text-[11px] uppercase tracking-wider w-24">SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {notifSettings.map((n) => (
                  <tr key={n.id} className="hover:bg-[var(--surface-hover)]/70 transition-all font-medium">
                    <td className="pl-8 pr-4 py-4 border-r border-[var(--border)]/40 font-bold text-[#1a2138]">{n.label}</td>
                    <td className="px-4 py-4 border-r border-[var(--border)]/40 text-xs text-muted-foreground">{n.desc}</td>
                    {(["email", "push", "sms"] as const).map((channel) => (
                      <td key={channel} className="px-6 py-4 text-center border-r last:border-r-0 border-[var(--border)]/40 last:pr-8">
                        <button
                          onClick={() => toggleNotif(n.id, channel)}
                          className={cn(
                            "relative h-6 w-11 rounded-full border transition-colors mx-auto block",
                            n[channel] ? "border-primary bg-primary" : "border-[var(--border)] bg-[var(--muted)]"
                          )}
                        >
                          <span className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform",
                            n[channel] ? "translate-x-5" : "translate-x-0.5"
                          )} />
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-4 bg-[var(--panel-soft)] border-t border-[var(--border)] flex justify-end">
            <button onClick={handleSave} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
              저장
            </button>
          </div>
        </section>
      )}

      {/* ── 시스템 탭 ── */}
      {activeTab === "system" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* 기본 설정 */}
          <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">기본 환경 설정</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">언어</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50">
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">타임존</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50">
                  <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                  <option value="UTC">UTC+0</option>
                </select>
              </div>
              {/* 다크 모드 */}
              <div className="flex items-center justify-between rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-4">
                <div>
                  <p className="text-sm font-semibold text-[#1a2138]">다크 모드</p>
                  <p className="text-xs text-[var(--subtle-foreground)]">UI 테마 전환</p>
                </div>
                <button
                  onClick={() => setDarkMode((v) => !v)}
                  className={cn(
                    "relative h-6 w-11 rounded-full border transition-colors",
                    darkMode ? "border-primary bg-primary" : "border-[var(--border)] bg-[var(--muted)]"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform",
                    darkMode ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>
            <button onClick={handleSave} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
              저장
            </button>
          </section>

          {/* 데이터 보관 정책 */}
          <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">데이터 보관 정책</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">가맹점 데이터 보관 기간</label>
                <div className="flex items-center gap-2">
                  <select value={retention} onChange={(e) => setRetention(e.target.value)}
                    className="h-10 flex-1 rounded-lg border border-[#d5deec] bg-card px-3 text-sm text-[#34415b] shadow-sm outline-none focus:border-primary/50">
                    <option value="13">13개월 (법적 최소)</option>
                    <option value="24">24개월</option>
                    <option value="36">36개월</option>
                    <option value="60">5년 (직영 권장)</option>
                  </select>
                </div>
                <p className="mt-1 text-[10px] text-[var(--subtle-foreground)]">보관 기간 도래 시 자동 아카이브 처리</p>
              </div>

              {[
                { label: "개인정보 자동 마스킹",   desc: "업로드 시 이름·전화·이메일 자동 처리", on: true  },
                { label: "분석 결과 캐시 보관",    desc: "AI 분석 결과 72시간 캐시 유지",        on: true  },
                { label: "감사 로그 영구 보관",    desc: "삭제 불가 — 법적 의무 항목",           on: true  },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#d5deec] bg-[#f4f7ff] p-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1a2138]">{item.label}</p>
                    <p className="text-xs text-[var(--subtle-foreground)]">{item.desc}</p>
                  </div>
                  <div className={cn(
                    "relative h-6 w-11 rounded-full border",
                    item.on ? "border-primary bg-primary opacity-60 cursor-not-allowed" : "border-[var(--border)] bg-[var(--muted)]"
                  )}>
                    <span className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm",
                      item.on ? "translate-x-5" : "translate-x-0.5"
                    )} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90">
              저장
            </button>
          </section>

          {/* 연동 상태 */}
          <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6 space-y-3 lg:col-span-2">
            <h3 className="text-base font-bold text-foreground">외부 시스템 연동 상태</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { name: "POS 시스템",       status: "미연동", note: "Phase 2 예정",     color: "text-[var(--subtle-foreground)]", dot: "bg-slate-300" },
                { name: "도도포인트 CRM",   status: "미연동", note: "Phase 2 예정",     color: "text-[var(--subtle-foreground)]", dot: "bg-slate-300" },
                { name: "날씨 API",         status: "연동됨", note: "정상 수집 중",     color: "text-emerald-600", dot: "bg-emerald-400" },
                { name: "발송 채널 (SMS)",  status: "연동됨", note: "정상 운영 중",     color: "text-emerald-600", dot: "bg-emerald-400" },
                { name: "OCR 엔진",         status: "연동됨", note: "정상 운영 중",     color: "text-emerald-600", dot: "bg-emerald-400" },
                { name: "BO 원가 시스템",   status: "미연동", note: "Phase 2 예정",     color: "text-[var(--subtle-foreground)]", dot: "bg-slate-300" },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-[#d5deec] bg-[#f4f7ff] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", item.dot)} />
                    <div>
                      <p className="text-sm font-semibold text-[#1a2138]">{item.name}</p>
                      <p className="text-[10px] text-[var(--subtle-foreground)]">{item.note}</p>
                    </div>
                  </div>
                  <span className={cn("text-xs font-black", item.color)}>{item.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ── 감사 로그 탭 ── */}
      {activeTab === "audit" && (
        <section className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">감사 로그</h3>
            <span className="text-[11px] font-black text-[#b0bdd4] uppercase tracking-widest">My Activity Log</span>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[var(--panel-soft)] text-muted-foreground border-b border-border">
                <tr>
                  <th className="pl-8 pr-4 py-4 text-left font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40">액션</th>
                  <th className="px-4 py-4 text-left font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40">대상</th>
                  <th className="px-4 py-4 text-left font-bold text-[11px] uppercase tracking-wider border-r border-[var(--border)]/40 w-40">IP 주소</th>
                  <th className="pl-4 pr-8 py-4 text-left font-bold text-[11px] uppercase tracking-wider w-44">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--surface-hover)]/70 transition-all font-medium">
                    <td className="pl-8 pr-4 py-4 border-r border-[var(--border)]/40 font-bold text-[#1a2138] flex items-center gap-2">
                      <ChevronRight className="h-3.5 w-3.5 text-[#b0bdd4]" />
                      {log.action}
                    </td>
                    <td className="px-4 py-4 border-r border-[var(--border)]/40 text-muted-foreground text-xs">{log.target}</td>
                    <td className="px-4 py-4 border-r border-[var(--border)]/40 font-mono text-xs text-[var(--subtle-foreground)]">{log.ip}</td>
                    <td className="pl-4 pr-8 py-4 font-mono text-xs text-[var(--subtle-foreground)]">{log.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-4 bg-card border-t border-[var(--border)] flex items-center justify-between">
            <p className="text-[11px] font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">Page 1 of 5</p>
            <div className="flex items-center gap-1">
              <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)] shadow-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#4a5568] text-xs font-bold hover:bg-[var(--panel-soft)]">2</button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#4a5568] text-xs font-bold hover:bg-[var(--panel-soft)]">3</button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)] shadow-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};