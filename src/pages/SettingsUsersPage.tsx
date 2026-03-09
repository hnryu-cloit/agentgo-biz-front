import type React from "react";
import { useState } from "react";
import { UserPlus, CheckCircle2, XCircle, Mail, Store } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";

type UserRole = "store_owner" | "supervisor" | "hq_admin" | "marketer";

const roleLabel: Record<UserRole, string> = {
  store_owner: "점주",
  supervisor: "슈퍼바이저",
  hq_admin: "본사 관리자",
  marketer: "마케터",
};

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  assignedStores?: string[];
};

const storeNames = storeResources.slice(0, 5).map((s, i) => s?.name ?? `${String.fromCharCode(65 + i)}매장`);

const initialUsers: User[] = [
  { id: "u1", name: "클로잇", email: "cloit.genai@itcen.com", role: "hq_admin", active: true, createdAt: "2026-01-10" },
  { id: "u2", name: "김점주", email: "owner.a@agentgo.biz", role: "store_owner", active: true, createdAt: "2026-01-15", assignedStores: [storeNames[0]] },
  { id: "u3", name: "박슈퍼", email: "sv.1@agentgo.biz", role: "supervisor", active: true, createdAt: "2026-01-20", assignedStores: [storeNames[0], storeNames[1], storeNames[2]] },
  { id: "u4", name: "이마케터", email: "mkt@agentgo.biz", role: "marketer", active: true, createdAt: "2026-02-01" },
  { id: "u5", name: "최점주", email: "owner.b@agentgo.biz", role: "store_owner", active: false, createdAt: "2026-02-10", assignedStores: [storeNames[1]] },
];

export const SettingsUsersPage: React.FC = () => {
  const [users, setUsers] = useState(initialUsers);
  const [showInvite, setShowInvite] = useState(false);
  const [showSvAssign, setShowSvAssign] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("store_owner");
  const [inviteSent, setInviteSent] = useState(false);
  const [svStores, setSvStores] = useState<string[]>([]);

  const toggleActive = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setShowInvite(false);
      setInviteSent(false);
      setInviteEmail("");
    }, 1500);
  };

  const svUser = showSvAssign ? users.find((u) => u.id === showSvAssign) : null;

  const handleSvSave = () => {
    setUsers((prev) =>
      prev.map((u) => (u.id === showSvAssign ? { ...u, assignedStores: svStores } : u))
    );
    setShowSvAssign(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">사용자 관리</h2>
              <p className="mt-1 text-sm text-slate-500">조직 내 사용자 초대·비활성화 및 SV 담당 매장을 배정합니다.</p>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              사용자 초대
            </button>
          </div>
        </section>

        {/* User Table */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-[#F7FAFF] text-slate-600">
                <tr>
                  <th className="px-4 py-3">이름</th>
                  <th className="px-4 py-3">이메일</th>
                  <th className="px-4 py-3">역할</th>
                  <th className="px-4 py-3">담당 매장</th>
                  <th className="px-4 py-3">가입일</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3 text-right">액션</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={`border-t border-border ${!u.active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${
                        u.role === "hq_admin" ? "border-purple-200 bg-purple-50 text-purple-700"
                          : u.role === "supervisor" ? "border-[#BFD4FF] bg-[#EEF4FF] text-primary"
                          : "border-[#DCE4F3] bg-white text-slate-600"
                      }`}>
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.assignedStores && u.assignedStores.length > 0 ? (
                        <span className="text-xs text-slate-600">{u.assignedStores.join(", ")}</span>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{u.createdAt}</td>
                    <td className="px-4 py-3">
                      {u.active ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />활성
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                          <XCircle className="h-3.5 w-3.5" />비활성
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {u.role === "supervisor" && (
                          <button
                            onClick={() => { setShowSvAssign(u.id); setSvStores(u.assignedStores ?? []); }}
                            className="flex items-center gap-1 rounded border border-[#D6E0F0] bg-white px-2 py-1 text-xs text-slate-700 hover:bg-[#F8FAFF]"
                          >
                            <Store className="h-3 w-3" />
                            매장배정
                          </button>
                        )}
                        <button
                          onClick={() => toggleActive(u.id)}
                          className={`rounded border px-2 py-1 text-xs ${
                            u.active
                              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {u.active ? "비활성화" : "활성화"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">사용자 초대</h4>
            <p className="mt-1 text-sm text-slate-500">이메일로 초대 링크를 발송합니다.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@agentgo.biz"
                    className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white pl-9 pr-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">역할</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="h-10 w-full rounded-xl border border-[#D6E0F0] bg-white px-3 text-sm"
                >
                  {(Object.keys(roleLabel) as UserRole[]).map((r) => (
                    <option key={r} value={r}>{roleLabel[r]}</option>
                  ))}
                </select>
              </div>
            </div>

            {inviteSent && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-sm text-emerald-700">초대 이메일이 발송되었습니다.</p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowInvite(false)} className="rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-700">취소</button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviteSent}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Mail className="h-3.5 w-3.5" />초대 발송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SV Store Assignment Modal */}
      {svUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">담당 매장 배정 — {svUser.name}</h4>
            <p className="mt-1 text-sm text-slate-500">슈퍼바이저에게 담당 가맹점을 배정합니다.</p>

            <div className="mt-4 space-y-2">
              {storeNames.map((name) => {
                const checked = svStores.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => setSvStores((prev) => checked ? prev.filter((s) => s !== name) : [...prev, name])}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      checked ? "border-[#BFD4FF] bg-[#EEF4FF]" : "border-[#DCE4F3] bg-white hover:bg-[#F7FAFF]"
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-primary bg-primary" : "border-[#DCE4F3] bg-white"}`}>
                      {checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${checked ? "text-primary" : "text-slate-700"}`}>{name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowSvAssign(null)} className="rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-700">취소</button>
              <button onClick={handleSvSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">저장</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};