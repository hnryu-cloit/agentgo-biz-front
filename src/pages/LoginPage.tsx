import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Logo from "@/assets/logo.svg";

type Role = "store_owner" | "supervisor" | "hq_admin";

const roleOptions: { value: Role; label: string; desc: string }[] = [
  { value: "store_owner", label: "점주", desc: "가맹점 운영 대시보드" },
  { value: "supervisor", label: "슈퍼바이저", desc: "담당 구역 관제 보드" },
  { value: "hq_admin", label: "본사 관리자", desc: "전국 통합 관제 시스템" },
];

const roleRedirect: Record<Role, string> = {
  store_owner: "/owner/dashboard",
  supervisor: "/supervisor/dashboard",
  hq_admin: "/hq/control-tower",
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<Role>("store_owner");
  const [failCount, setFailCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLocked = failCount >= 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    // Mock 로그인 처리 (실제 API 미연동)
    setTimeout(() => {
      if (email === "demo@agentgo.biz" && password === "password") {
        navigate(roleRedirect[role]);
      } else {
        const next = failCount + 1;
        setFailCount(next);
        if (next >= 5) {
          setError("5회 이상 로그인 실패로 계정이 잠겼습니다. 관리자에게 문의하세요.");
        } else {
          setError(`이메일 또는 비밀번호가 일치하지 않습니다. (${next}/5)`);
        }
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7ff] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src={Logo} alt="AgentGo" className="h-9 w-auto" />
        </div>

        <div className="rounded-2xl border border-[#d5deec] bg-white p-7 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">로그인</h1>
          <p className="mt-1 text-sm text-muted-foreground">역할을 선택하고 계정 정보를 입력하세요.</p>

          {/* Role Select */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {roleOptions.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`rounded-xl border px-3 py-2.5 text-center transition-colors ${
                  role === r.value
                    ? "border-[#b8ccff] bg-[#eef3ff] text-primary"
                    : "border-[#d5deec] bg-white text-[#4a5568] hover:bg-[#f4f7ff]"
                }`}
              >
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="mt-0.5 text-[10px] text-[var(--subtle-foreground)]">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#34415b]">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@agentgo.biz"
                disabled={isLocked}
                className="h-11 w-full rounded-xl border border-[#d5deec] bg-white px-4 text-sm text-[#1a2138] placeholder-slate-300 focus:border-primary focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#34415b]">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLocked}
                  className="h-11 w-full rounded-xl border border-[#d5deec] bg-white px-4 pr-11 text-sm text-[#1a2138] placeholder-slate-300 focus:border-primary focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--subtle-foreground)]"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLocked || loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "로그인"
              )}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-[var(--subtle-foreground)]">
            <button className="hover:text-primary hover:underline">비밀번호 재설정</button>
            <span>계정 문의: support@agentgo.biz</span>
          </div>
        </div>

        {/* 데모 안내 */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#b8ccff] bg-[#eef3ff] px-4 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-xs text-[#4a5568]">
            <span className="font-semibold text-primary">데모 계정:</span>{" "}
            demo@agentgo.biz / password
          </div>
        </div>
      </div>
    </div>
  );
};
