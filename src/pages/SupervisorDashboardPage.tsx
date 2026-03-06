import type React from "react";
import { useMemo, useState } from "react";
import { ShieldAlert, MapPin, Activity } from "lucide-react";
import { storeResources } from "@/data/mockStoreResource";

type StoreRow = {
  id: string;
  name: string;
  salesDelta: number;
  risk: number;
  churn: "높음" | "보통" | "낮음";
  margin: "위험" | "주의" | "정상";
  compliance: number;
  lastVisit: string;
};

const rows: StoreRow[] = [
  { id: "s1", name: storeResources[0]?.name ?? "A매장", salesDelta: -18, risk: 92, churn: "높음", margin: "위험", compliance: 40, lastVisit: "82일 전" },
  { id: "s2", name: storeResources[1]?.name ?? "B매장", salesDelta: -11, risk: 78, churn: "높음", margin: "주의", compliance: 60, lastVisit: "45일 전" },
  { id: "s3", name: storeResources[2]?.name ?? "C매장", salesDelta: -8, risk: 71, churn: "보통", margin: "위험", compliance: 80, lastVisit: "21일 전" },
  { id: "s4", name: storeResources[3]?.name ?? "D매장", salesDelta: 5, risk: 42, churn: "보통", margin: "주의", compliance: 90, lastVisit: "14일 전" },
  { id: "s5", name: storeResources[4]?.name ?? "E매장", salesDelta: 3, risk: 18, churn: "낮음", margin: "정상", compliance: 100, lastVisit: "7일 전" },
];

const tone = (value: string) => {
  if (value === "위험" || value === "높음") return "border border-red-200 bg-white text-red-600";
  if (value === "주의" || value === "보통") return "border border-amber-200 bg-white text-amber-600";
  return "border border-[#DCE4F3] bg-white text-slate-600";
};

export const SupervisorDashboardPage: React.FC = () => {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const detail = useMemo(() => rows.find((row) => row.id === detailId) ?? null, [detailId]);
  const report = useMemo(() => rows.find((row) => row.id === reportId) ?? null, [reportId]);

  const stats = useMemo(() => ({
    danger: rows.filter((r) => r.risk >= 80 || r.margin === "위험").length,
    warning: rows.filter((r) => (r.risk >= 50 && r.risk < 80) || r.margin === "주의").length,
    normal: rows.filter((r) => r.risk < 50 && r.margin === "정상").length,
  }), []);

  const avgDelta = useMemo(() => {
    const sum = rows.reduce((acc, r) => acc + r.salesDelta, 0);
    return (sum / rows.length).toFixed(1);
  }, []);

  const risingCount = rows.filter((r) => r.salesDelta > 0).length;
  const fallingCount = rows.filter((r) => r.salesDelta <= 0).length;
  const risingPct = Math.round((risingCount / rows.length) * 100);

  const topDangerStores = rows
    .filter((r) => r.risk >= 70)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 2)
    .map((r) => r.name)
    .join(", ");

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-[#DCE4F3] bg-[#F7FAFF] px-3 py-1 text-xs font-semibold text-primary">
                  서울 남부구역
                </span>
                <span className="text-sm text-slate-500">관리 매장: 총 {rows.length}개</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">수퍼바이저 보드</h2>
              <p className="mt-1 text-base text-slate-500">
                AI가 분석한 구역 내 매장별 위험도 및 권장 조치사항입니다.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <span className="absolute bottom-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">고위험 매장 {stats.danger}곳</p>
                <p className="text-xs text-slate-500">긴급 현장 방문이 필요합니다</p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* 구역 평균 매출 증감 */}
          <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">구역 평균 매출 증감</p>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{avgDelta}%</p>
            <p className="mt-1 text-xs text-slate-500">전월 동기 대비</p>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>상승 {risingCount}곳</span>
                <span>하락 {fallingCount}곳</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                <div className="h-full rounded-full bg-primary" style={{ width: `${risingPct}%` }} />
              </div>
            </div>
          </article>

          {/* 이탈 징후 고객 수 */}
          <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">이탈 징후 고객 수</p>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">1,240명</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
              <span className="font-medium text-red-600">+15%</span>
              <span>A매장 집중 발생</span>
            </div>
          </article>

          {/* AI 추천 금주 방문지 */}
          <article className="rounded-2xl border border-[#DCE4F3] bg-[#F7FAFF] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">AI 추천 금주 방문지</p>
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{topDangerStores}</p>
            <p className="mt-1 text-xs text-slate-500">위험도 스코어 70점 이상</p>
            <button className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90">
              방문 일정 생성하기
            </button>
          </article>
        </section>

        {/* Store Table */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">매장별 위험도 분석</h3>
              <p className="mt-0.5 text-sm text-slate-500">매출·마진·이탈·방문 주기를 종합한 우선순위입니다</p>
            </div>
            <button className="rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F8FAFF]">
              전체 리포트
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="bg-[#F7FAFF] text-slate-600">
                <tr>
                  <th className="px-3 py-3">매장</th>
                  <th className="px-3 py-3">매출</th>
                  <th className="px-3 py-3">마진</th>
                  <th className="px-3 py-3">이탈</th>
                  <th className="px-3 py-3">이행률</th>
                  <th className="px-3 py-3">리스크</th>
                  <th className="px-3 py-3">최근 방문</th>
                  <th className="px-3 py-3 text-right">액션</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="px-3 py-3">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${row.salesDelta < 0 ? "text-red-600" : "text-emerald-600"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${row.salesDelta < 0 ? "bg-red-400" : "bg-emerald-400"}`} />
                        {row.salesDelta > 0 ? "+" : ""}{row.salesDelta}%
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`${tone(row.margin)} rounded-full px-2 py-1 text-xs font-semibold`}>
                        {row.margin}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`${tone(row.churn)} rounded-full px-2 py-1 text-xs font-semibold`}>
                        {row.churn}
                      </span>
                    </td>
                    <td className="px-3 py-3">{row.compliance}%</td>
                    <td className="px-3 py-3">
                      <span className={`font-bold ${row.risk >= 80 ? "text-red-600" : row.risk >= 50 ? "text-amber-600" : "text-emerald-600"}`}>
                        {row.risk}점
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-sm ${parseInt(row.lastVisit) > 30 ? "text-red-500 font-medium" : "text-slate-500"}`}>
                        {row.lastVisit}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setDetailId(row.id)}
                          className="rounded border border-border px-2 py-1 text-xs text-slate-700"
                        >
                          상세
                        </button>
                        <button
                          onClick={() => setReportId(row.id)}
                          className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white"
                        >
                          리포트
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

      {detail && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">매장 상세</h4>
            <p className="mt-3 text-sm text-slate-700">{detail.name}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setDetailId(null)}
                className="rounded border border-border px-3 py-2 text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">방문 리포트</h4>
            <p className="mt-2 text-sm text-slate-600">{report.name}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setReportId(null)}
                className="rounded border border-border px-3 py-2 text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};