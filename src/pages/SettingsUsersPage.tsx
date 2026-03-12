import type React from "react";
import { useState } from "react";
import { 
  UserPlus, CheckCircle2, XCircle, Mail, Store, 
  ShieldCheck, ShieldAlert, Trash2, Edit2,
  Search, Filter, ChevronLeft, ChevronRight,
  Briefcase, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const initialUsers: User[] = [
  { id: "u1", name: "김태호", email: "th.kim@itcen.com", role: "hq_admin", department: "IT운영본부 / 플랫폼팀", lastLogin: "2026-03-09 14:20:35", active: true },
  { id: "u2", name: "이민지", email: "mj.lee@itcen.com", role: "marketer", department: "전략기획실 / 브랜드팀", lastLogin: "2026-03-09 11:05:12", active: true },
  { id: "u3", name: "김수진", email: "sj.kim@itcen.com", role: "supervisor", department: "영업본부 / 운영 1팀", assignedStores: ["강남역점", "역삼점"], lastLogin: "2026-03-08 18:30:45", active: true },
  { id: "u4", name: "박재원", email: "jw.park@itcen.com", role: "supervisor", department: "영업본부 / 운영 1팀", assignedStores: ["홍대점", "합정점"], lastLogin: "2026-03-09 09:45:22", active: true },
  { id: "u5", name: "최유리", email: "yr.choi@itcen.com", role: "store_owner", department: "가맹점주 / 강남", assignedStores: ["강남역점"], lastLogin: "2026-03-07 22:10:05", active: true },
  { id: "u6", name: "정성훈", email: "sh.jung@itcen.com", role: "marketer", department: "디지털마케팅팀", lastLogin: "2026-02-28 15:20:18", active: false },
  { id: "u7", name: "한지혜", email: "jh.han@itcen.com", role: "supervisor", department: "영업본부 / 운영 2팀", assignedStores: ["판교점"], lastLogin: "2026-03-09 13:00:55", active: true },
  { id: "u8", name: "오세윤", email: "sy.oh@itcen.com", role: "hq_admin", department: "경영관리본부 / 인사팀", lastLogin: "2026-03-09 10:30:40", active: true },
  { id: "u9", name: "강동원", email: "dw.kang@itcen.com", role: "supervisor", department: "영업본부 / 운영 3팀", assignedStores: ["분당점", "수지점"], lastLogin: "2026-03-09 08:50:15", active: true },
  { id: "u10", name: "송혜교", email: "hk.song@itcen.com", role: "marketer", department: "전략기획실 / CRM팀", lastLogin: "2026-03-08 17:15:33", active: true },
  { id: "u11", name: "현빈", email: "hb.kim@itcen.com", role: "supervisor", department: "영업본부 / 운영 2팀", assignedStores: ["일산점"], lastLogin: "2026-03-09 11:40:28", active: true },
  { id: "u12", name: "손예진", email: "yj.son@itcen.com", role: "store_owner", department: "가맹점주 / 경기", assignedStores: ["판교점"], lastLogin: "2026-03-09 10:05:19", active: true },
  { id: "u13", name: "조인성", email: "is.cho@itcen.com", role: "hq_admin", department: "경영본부 / 법무팀", lastLogin: "2026-03-06 14:00:42", active: true },
  { id: "u14", name: "공유", email: "oo.gong@itcen.com", role: "marketer", department: "컨텐츠팀", lastLogin: "2026-03-09 15:30:11", active: true },
  { id: "u15", name: "김고은", email: "ge.kim@itcen.com", role: "supervisor", department: "운영 1팀", assignedStores: ["신촌점"], lastLogin: "2026-03-09 12:20:50", active: true },
];

const roleLabel: Record<UserRole, string> = {
  hq_admin: "본사 관리자",
  marketer: "마케팅 담당",
  supervisor: "슈퍼바이저",
  store_owner: "점주",
};

const roleStyle: Record<UserRole, string> = {
  hq_admin: "text-purple-600 bg-purple-50 border-purple-100",
  marketer: "text-indigo-600 bg-indigo-50 border-indigo-100",
  supervisor: "text-primary bg-primary/5 border-primary/10",
  store_owner: "text-slate-500 bg-slate-50 border-slate-100",
};

export const SettingsUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");

  const toggleActive = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const filteredUsers = users.filter(u => 
    u.name.includes(search) || u.email.includes(search) || u.department.includes(search) || roleLabel[u.role].includes(search)
  );

  return (
    <div className="space-y-6 pb-10 font-sans">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">설정</p>
            <h2 className="text-2xl font-bold text-slate-900">사용자 및 권한 관리</h2>
            <p className="mt-1 text-base text-slate-500">시스템 접속 계정을 관리하고 직무에 맞는 운영 권한을 부여합니다.</p>
          </div>
          <button
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1E5BE9]"
          >
            <UserPlus className="h-4 w-4" />
            신규 사용자 초대
          </button>
        </div>
      </section>

      {/* Table Section */}
      <section className="rounded-2xl border border-border/90 bg-card shadow-elevated overflow-hidden">
        {/* Search & Tool Bar */}
        <div className="p-5 border-b border-border bg-white flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="이름, 이메일, 부서로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-white text-sm font-medium text-slate-700 outline-none focus:border-primary/50 transition-all shadow-sm placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white text-xs font-bold text-slate-600 hover:bg-[#F8FAFF] shadow-sm">
              <Filter className="h-3.5 w-3.5" />
              필터
            </button>
            <div className="h-6 w-px bg-slate-100" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total {filteredUsers.length}</span>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F7FAFF] text-slate-500">
              <tr>
                <th className="pl-8 pr-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-slate-100/50">사용자 정보</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-slate-100/50 text-center">소속 부서/팀</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-slate-100/50 text-center">권한 그룹</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-slate-100/50 text-center">담당 매장</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-slate-100/50 text-center">최근 접속</th>
                <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-wider border-r border-slate-100/50 text-center">상태</th>
                <th className="pl-4 pr-8 py-4 font-bold text-[11px] uppercase tracking-wider text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.slice(0, 10).map((u) => (
                <tr key={u.id} className={cn(
                  "transition-colors hover:bg-slate-50/50",
                  !u.active && "bg-slate-50/30 opacity-60"
                )}>
                  {/* 1열: 사용자 정보 (좌측 정렬) */}
                  <td className="pl-8 pr-4 py-4 border-r border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border",
                        u.active ? "bg-white border-primary/20 text-primary" : "bg-slate-100 border-slate-200 text-slate-400"
                      )}>
                        {u.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{u.name}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* 2열: 소속 부서 (중앙 정렬) */}
                  <td className="px-4 py-4 border-r border-slate-100/50 text-center">
                    <span className="text-xs font-medium text-slate-600">{u.department}</span>
                  </td>
                  {/* 3열: 권한 그룹 (중앙 정렬) */}
                  <td className="px-4 py-4 border-r border-slate-100/50 text-center">
                    <span className={cn(
                      "inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-sm",
                      roleStyle[u.role]
                    )}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  {/* 4열: 담당 매장 (중앙 정렬) */}
                  <td className="px-4 py-4 border-r border-slate-100/50 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {u.assignedStores && u.assignedStores.length > 0 ? (
                        u.assignedStores.map(s => (
                          <span key={s} className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-100">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">No Access</span>
                      )}
                    </div>
                  </td>
                  {/* 5열: 최근 접속 (중앙 정렬) */}
                  <td className="px-4 py-4 border-r border-slate-100/50 text-center">
                    <span className="text-[11px] font-medium text-slate-500">{u.lastLogin}</span>
                  </td>
                  {/* 6열: 상태 (중앙 정렬) */}
                  <td className="px-4 py-4 border-r border-slate-100/50 text-center">
                    <div className="flex justify-center">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          활성
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <XCircle className="h-3 w-3" />
                          비활성
                        </span>
                      )}
                    </div>
                  </td>
                  {/* 7열: 관리 (중앙 정렬) */}
                  <td className="pl-4 pr-8 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button 
                        onClick={() => toggleActive(u.id)}
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        title={u.active ? "비활성화" : "활성화"}
                      >
                        {u.active ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Standard Pagination Area */}
        <div className="px-8 py-4 bg-white border-t border-border flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Page 1 of 2</p>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-white text-slate-400 hover:bg-slate-50 shadow-sm">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all">2</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-white text-slate-400 hover:bg-slate-50 shadow-sm">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
