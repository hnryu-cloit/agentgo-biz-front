import type React from "react";
import { useMemo, useState } from "react";
import { ShieldAlert, MapPin, Activity, Megaphone, BarChart2, ArrowUp, ArrowDown, Minus, CheckSquare } from "lucide-react";
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

// KPI 비교 데이터
type KpiMetric = "sales" | "unitPrice" | "qty" | "margin" | "cancel";
const kpiOptions: { value: KpiMetric; label: string; unit: string }[] = [
  { value: "sales", label: "매출", unit: "천원" },
  { value: "unitPrice", label: "객단가", unit: "원" },
  { value: "qty", label: "객수", unit: "명" },
  { value: "margin", label: "마진율", unit: "%" },
  { value: "cancel", label: "취소율", unit: "%" },
];

const kpiValues: Record<KpiMetric, number[]> = {
  sales: [870, 1240, 980, 1560, 1820],
  unitPrice: [7016, 8200, 7500, 9100, 10200],
  qty: [124, 151, 131, 172, 178],
  margin: [18.1, 22.4, 20.1, 25.3, 27.8],
  cancel: [4.2, 3.1, 2.8, 1.9, 1.2],
};

// 공지 이행 데이터
const complianceData = [
  { store: "A매장", done: 2, total: 5 },
  { store: "B매장", done: 3, total: 5 },
  { store: "C매장", done: 4, total: 5 },
  { store: "D매장", done: 4, total: 5 },
  { store: "E매장", done: 5, total: 5 },
];

const tone = (value: string) => {
  if (value === "위험" || value === "높음") return "border border-red-200 bg-white text-red-600";
  if (value === "주의" || value === "보통") return "border border-amber-200 bg-white text-amber-600";
  return "border border-[#DCE4F3] bg-white text-slate-600";
};

export const SupervisorDashboardPage: React.FC = () => {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<KpiMetric>("sales");
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

  const kpiOpt = kpiOptions.find((o) => o.value === selectedKpi)!;
  const kpiMax = Math.max(...kpiValues[selectedKpi]);
  const rankedRows = [...rows]
    .map((r, i) => ({ ...r, kpiVal: kpiValues[selectedKpi][i] }))
    .sort((a, b) => b.kpiVal - a.kpiVal);

  const topStore = rankedRows[0];
  const bottomStore = rankedRows[rankedRows.length - 1];

  return (
    <>
      <div className="space-y-6">
        {/* Morning Briefing */}
        <section className="rounded-2xl border border-[#BFD4FF] bg-[#EEF4FF] p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">SV 모닝 브리핑</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">서울 남부구역 2026-03-08 07:00 기준</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[#DCE4F3] bg-white p-3">
              <p className="text-xs font-medium text-slate-500">구역 전일 실적</p>
              <p className="mt-1 text-sm font-bold text-slate-900">총 매출 6,470천원</p>
              <p className="text-xs text-red-500">구역 평균 -5.8% · 하락 매장 3곳</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700">오늘 주요 이슈</p>
              <p className="mt-1 text-sm font-bold text-slate-900">A매장 이상 결제 탐지</p>
              <p className="text-xs text-red-600">취소율 4.2% · P0 경보 발생</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-700">공지 이행 미완료</p>
              <p className="mt-1 text-sm font-bold text-slate-900">A/B매장 미이행 2건</p>
              <p className="text-xs text-amber-600">마감: 3월 10일</p>
            </div>
          </div>
        </section>

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
          {/* 위험/주의/정상 카드 */}
          {[
            { label: "위험 매장", count: stats.danger, color: "red", desc: "즉시 개입 필요" },
            { label: "주의 매장", count: stats.warning, color: "amber", desc: "모니터링 강화" },
            { label: "정상 매장", count: stats.normal, color: "emerald", desc: "현재 안정적" },
          ].map((s) => (
            <article
              key={s.label}
              className={`rounded-2xl border bg-card p-5 shadow-sm ${
                s.color === "red" ? "border-red-200" : s.color === "amber" ? "border-amber-200" : "border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${
                  s.color === "red" ? "bg-red-400" : s.color === "amber" ? "bg-amber-400" : "bg-emerald-400"
                }`} />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">{s.count}개</p>
              <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
            </article>
          ))}
        </section>

        {/* 구역 성과 + AI 방문지 */}
        <section className="grid gap-4 md:grid-cols-3">
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

        {/* 공지 이행 현황 */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">공지 이행 현황</h3>
            <span className="ml-auto text-sm text-slate-500">
              최신 공지 기준 ({complianceData.reduce((s, c) => s + c.done, 0)}/{complianceData.reduce((s, c) => s + c.total, 0)} 완료)
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {complianceData.map((item) => (
              <div key={item.store} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-sm font-medium text-slate-700">{item.store}</span>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.done === item.total ? "bg-emerald-400" : item.done / item.total >= 0.6 ? "bg-primary" : "bg-red-400"
                      }`}
                      style={{ width: `${(item.done / item.total) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-14 shrink-0 text-right text-xs text-slate-500">{item.done}/{item.total}</span>
                {item.done < item.total && (
                  <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                    미완료
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 매장별 KPI 비교 */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900">담당 매장 KPI 비교</h3>
            </div>
            <select
              value={selectedKpi}
              onChange={(e) => setSelectedKpi(e.target.value as KpiMetric)}
              className="h-9 rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm text-slate-700"
            >
              {kpiOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-sm text-slate-500">지표: {kpiOpt.label} ({kpiOpt.unit})</p>

          <div className="mt-5 space-y-3">
            {rankedRows.map((row, idx) => (
              <div key={row.id} className="flex items-center gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  idx === 0 ? "bg-primary text-white" : "border border-[#DCE4F3] bg-white text-slate-500"
                }`}>
                  {idx + 1}
                </span>
                <span className="w-16 shrink-0 text-sm font-medium text-slate-700">{row.name}</span>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE4F3]">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(row.kpiVal / kpiMax) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-20 shrink-0 text-right text-sm font-semibold text-slate-900">
                  {row.kpiVal.toLocaleString()} {kpiOpt.unit}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 격차 분석 */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <h3 className="text-lg font-bold text-slate-900">상위·하위 매장 격차 분석</h3>
          <p className="mt-0.5 text-sm text-slate-500">상위 1위 vs 하위 1위 기준 주요 지표 격차입니다.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {kpiOptions.slice(0, 3).map((opt) => {
              const vals = kpiValues[opt.value];
              const sortedVals = [...vals].sort((a, b) => b - a);
              const gap = sortedVals[0] - sortedVals[sortedVals.length - 1];
              const gapPct = Math.round((gap / sortedVals[sortedVals.length - 1]) * 100);
              return (
                <div key={opt.value} className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
                  <p className="text-xs font-medium text-slate-500">{opt.label} 격차</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {gap.toLocaleString()}{opt.unit}
                  </p>
                  <p className="text-xs text-red-600">하위 대비 +{gapPct}%</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
            <p className="text-xs font-semibold text-slate-700">AI 원인 해석</p>
            <p className="mt-1.5 text-sm text-slate-600">
              {topStore.name}은 피크타임 회전율과 객단가가 높아 우수한 성과를 보입니다.
              {bottomStore.name}은 이탈 고객 비중이 높고 공지 이행률이 낮아 집중 코칭이 필요합니다.
              핵심 격차 요인은 <strong>시간대별 프로모션 운영 여부</strong>와 <strong>직원 서비스 품질</strong>로 분석됩니다.
            </p>
            <button className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              개선 액션 확인
            </button>
          </div>
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
                        {row.salesDelta < 0 ? <ArrowDown className="h-3 w-3" /> : row.salesDelta > 0 ? <ArrowUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {row.salesDelta > 0 ? "+" : ""}{row.salesDelta}%
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`${tone(row.margin)} rounded-full px-2 py-1 text-xs font-semibold`}>{row.margin}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`${tone(row.churn)} rounded-full px-2 py-1 text-xs font-semibold`}>{row.churn}</span>
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
                        <button onClick={() => setDetailId(row.id)} className="rounded border border-border px-2 py-1 text-xs text-slate-700">상세</button>
                        <button onClick={() => setReportId(row.id)} className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white">리포트</button>
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
              <button onClick={() => setDetailId(null)} className="rounded border border-border px-3 py-2 text-sm">닫기</button>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">방문 리포트 — {report.name}</h4>
            <div className="mt-4 space-y-3">
              {[
                { label: "이슈 우선순위 Top3", value: "①매출 하락 -18% ②이탈 고객 급증 ③공지 미이행" },
                { label: "코칭 포인트", value: "피크타임 운영 개선, 직원 서비스 교육 필요" },
                { label: "추천 대화 주제", value: "마진 경보 메뉴 가격 조정 논의, 이탈 고객 캠페인 계획" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
                  <p className="text-xs font-semibold text-slate-600">{item.label}</p>
                  <p className="mt-0.5 text-sm text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setReportId(null)} className="rounded border border-border px-3 py-2 text-sm">닫기</button>
              <button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">PDF 다운로드</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
