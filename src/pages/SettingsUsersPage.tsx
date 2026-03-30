import type React from "react";
import { useEffect, useState } from "react";
import {
  UserPlus, CheckCircle2, XCircle, ShieldCheck, ShieldAlert, Trash2, Edit2,
  Search, Filter, ChevronLeft, ChevronRight, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/commons/EmptyState";
import { ErrorState } from "@/components/commons/ErrorState";
import { LoadingState } from "@/components/commons/LoadingState";
import { createUser, getUsers, setUserActive } from "@/services/settings";

type UserRole = "store_owner" | "supervisor" | "hq_admin" | "marketer";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  assignedStores?: string[];
  lastLogin: string;
  active: boolean;
};

const roleLabel: Record<UserRole, string> = {
  hq_admin: "본사 관리자",
  marketer: "마케팅 담당",
  supervisor: "슈퍼바이저",
  store_owner: "점주",
};

const roleStyle: Record<UserRole, string> = {
  hq_admin: "text-purple-700 bg-purple-50 border-purple-200",
  marketer: "text-indigo-700 bg-indigo-50 border-indigo-200",
  supervisor: "text-primary bg-[#eef3ff] border-[#b8ccff]",
  store_owner: "text-muted-foreground bg-[#f4f7ff] border-[#d5deec]",
};

export const SettingsUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "store_owner" as UserRole,
    store_id: "",
  });

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);
    getUsers()
      .then((res) => {
        if (!alive) return;
        setUsers(res.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as UserRole,
          department: "",
          lastLogin: u.updated_at.replace("T", " ").slice(0, 16),
          active: u.is_active,
        })));
      })
      .catch((error) => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : "사용자 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const toggleActive = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const next = !target.active;
    setUsers(users.map((u) => u.id === id ? { ...u, active: next } : u));
    setUserActive(id, next).catch(() => {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: target.active } : u));
    });
  };

  const filteredUsers = users.filter((u) =>
    u.name.includes(search) || u.email.includes(search) || u.department.includes(search) || roleLabel[u.role].includes(search)
  );

  const handleCreateUser = async () => {
    const created = await createUser({
      email: newUser.email,
      name: newUser.name,
      password: newUser.password,
      role: newUser.role,
      store_id: newUser.store_id || undefined,
    });
    setUsers((prev) => [{
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role as UserRole,
      department: "",
      lastLogin: created.updated_at.replace("T", " ").slice(0, 16),
      active: created.is_active,
    }, ...prev]);
    setShowCreateForm(false);
    setNewUser({ name: "", email: "", password: "", role: "store_owner", store_id: "" });
  };

  if (isLoading) {
    return <LoadingState message="사용자 목록을 불러오는 중..." />;
  }

  if (loadError) {
    return <ErrorState title="사용자 목록을 불러올 수 없습니다" message={loadError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6 pb-10">

      {/* 헤더 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#eef3ff] p-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">설정</p>
              <h1 className="text-xl font-bold text-foreground">사용자 및 권한 관리</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">시스템 접속 계정을 관리하고 직무에 맞는 운영 권한을 부여합니다.</p>
            </div>
          </div>
          <button onClick={() => setShowCreateForm((prev) => !prev)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E5BE9] transition-colors">
            <UserPlus className="h-4 w-4" />
            신규 사용자 초대
          </button>
        </div>
      </section>

      {showCreateForm && (
        <section className="rounded-2xl border border-border/90 bg-card shadow-elevated p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input value={newUser.name} onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))} placeholder="이름" className="h-10 rounded-lg border border-[#d5deec] bg-card px-3 text-sm" />
            <input value={newUser.email} onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))} placeholder="이메일" className="h-10 rounded-lg border border-[#d5deec] bg-card px-3 text-sm" />
            <input type="password" value={newUser.password} onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))} placeholder="임시 비밀번호" className="h-10 rounded-lg border border-[#d5deec] bg-card px-3 text-sm" />
            <select value={newUser.role} onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value as UserRole }))} className="h-10 rounded-lg border border-[#d5deec] bg-card px-3 text-sm">
              {Object.entries(roleLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowCreateForm(false)} className="rounded-lg border border-[#d5deec] bg-card px-4 py-2 text-sm">취소</button>
            <button onClick={() => void handleCreateUser()} disabled={!newUser.name || !newUser.email || !newUser.password} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">생성</button>
          </div>
        </section>
      )}

      {/* 테이블 섹션 */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden">

        {/* 검색 & 툴바 */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="이름, 이메일, 부서로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#d5deec] bg-[#f4f7ff] py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-[#d5deec] bg-card px-3 py-2 text-xs font-medium text-[#34415b] hover:bg-[#f4f7ff] transition-colors">
              <Filter className="h-3.5 w-3.5" />
              필터
            </button>
            <div className="h-5 w-px bg-border" />
            <span className="text-[11px] font-medium text-muted-foreground">총 {filteredUsers.length}명</span>
          </div>
        </div>

        {/* 테이블 */}
        {filteredUsers.length === 0 ? (
          <div className="p-6">
            <EmptyState title="표시할 사용자가 없습니다" description="검색 조건에 맞는 계정이 없거나 아직 사용자가 생성되지 않았습니다." />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-border bg-gray-50">
              <tr>
                <th className="pl-6 pr-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">사용자 정보</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">소속 부서</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">권한</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">담당 매장</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">최근 접속</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">상태</th>
                <th className="pl-4 pr-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredUsers.slice(0, 10).map((u) => (
                <tr
                  key={u.id}
                  className={cn(
                    "hover:bg-gray-50/50 transition-colors",
                    !u.active && "opacity-50"
                  )}
                >
                  <td className="pl-6 pr-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        u.active ? "border-[#b8ccff] bg-[#eef3ff] text-primary" : "border-border bg-muted text-muted-foreground"
                      )}>
                        {u.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-xs text-muted-foreground">{u.department}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", roleStyle[u.role])}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {u.assignedStores && u.assignedStores.length > 0 ? (
                        u.assignedStores.map((s) => (
                          <span key={s} className="rounded border border-[#d5deec] bg-[#f4f7ff] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-[11px] text-muted-foreground tabular-nums">{u.lastLogin}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />활성
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                          <XCircle className="h-3 w-3" />비활성
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="pl-4 pr-6 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => toggleActive(u.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                        title={u.active ? "비활성화" : "활성화"}
                      >
                        {u.active ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <p className="text-[11px] font-medium text-muted-foreground">Page 1 / 2</p>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff] transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-xs font-semibold shadow-sm">1</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#34415b] text-xs font-medium hover:bg-[#f4f7ff] transition-colors">2</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d5deec] bg-card text-muted-foreground hover:bg-[#f4f7ff] transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
