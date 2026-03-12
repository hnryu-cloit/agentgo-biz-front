import type React from "react";
import { useState } from "react";
import { Megaphone, Users, Sparkles, Send, BarChart2 } from "lucide-react";

const segments = [
  { id: "vip", name: "VIP", users: "2,341명", rev: "기여 38%", desc: "최근 30일 내 3회 이상 방문" },
  { id: "good", name: "우수", users: "8,120명", rev: "기여 44%", desc: "최근 60일 내 방문 이력" },
  { id: "churn", name: "이탈 우려", users: "1,847명", rev: "잠재 18%", desc: "30일 이상 미방문 고객" },
];

const offerPresets = [
  { label: "복귀 할인 쿠폰 10%", roi: "예상 ROI 416%" },
  { label: "무료 음료 증정", roi: "예상 ROI 280%" },
  { label: "포인트 2배 적립", roi: "예상 ROI 195%" },
];

export const CampaignDesignerPage: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>("churn");
  const [discount, setDiscount] = useState(10);
  const [selectedPreset, setSelectedPreset] = useState(0);

  const selected = segments.find((s) => s.id === selectedSegment);

  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">마케팅</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">캠페인 설계</h2>
            <p className="mt-1 text-base text-slate-500">
              세그먼트를 선택하고 오퍼를 설계한 뒤 승인 요청까지 진행합니다.
            </p>
          </div>
          <div className="rounded-xl bg-[#EEF4FF] p-3 shadow-sm">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mt-6 flex items-center gap-0">
          {["세그먼트 선택", "오퍼 설계", "메시지 작성", "승인 요청"].map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                  idx < 2 ? "bg-primary text-white" : "border border-[#DCE4F3] bg-white text-slate-400"
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-xs font-medium ${idx < 2 ? "text-primary" : "text-slate-400"}`}>
                  {step}
                </span>
              </div>
              {idx < 3 && <div className="mx-3 h-px w-8 bg-[#DCE4F3]" />}
            </div>
          ))}
        </div>
      </section>

      {/* Step 1 + Step 2 */}
      <section className="grid gap-4 lg:grid-cols-2">

        {/* Step 1. 세그먼트 선택 */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Users className="h-5 w-5 text-slate-400" />
            Step 1. 세그먼트 선택
          </h3>
          <p className="mt-1 text-sm text-slate-500">캠페인 대상 고객 그룹을 선택합니다.</p>

          <div className="mt-4 flex-1 space-y-2">
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => setSelectedSegment(seg.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm ${
                  selectedSegment === seg.id
                    ? "border-[#BFD4FF] bg-[#EEF4FF]"
                    : "border-[#DCE4F3] bg-[#F7FAFF] hover:border-[#BFD1ED]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${selectedSegment === seg.id ? "text-primary" : "text-slate-900"}`}>
                    {seg.name}
                  </p>
                  <span className="text-xs font-medium text-slate-500">{seg.rev}</span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{seg.users} · {seg.desc}</p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="mt-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3 shadow-sm">
              <p className="text-xs text-slate-500">선택된 세그먼트</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {selected.name} · {selected.users}
              </p>
            </div>
          )}
        </article>

        {/* Step 2. 오퍼 설계 */}
        <article className="flex flex-col rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-slate-400" />
            Step 2. 오퍼 설계
          </h3>
          <p className="mt-1 text-sm text-slate-500">AI 추천 오퍼를 선택하거나 직접 설정합니다.</p>

          {/* AI 추천 오퍼 */}
          <div className="mt-4 space-y-2">
            {offerPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPreset(idx)}
                className={`w-full rounded-xl border px-4 py-2.5 text-left transition-all hover:shadow-sm ${
                  selectedPreset === idx
                    ? "border-[#BFD4FF] bg-[#EEF4FF]"
                    : "border-[#DCE4F3] bg-[#F7FAFF] hover:border-[#BFD1ED]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${selectedPreset === idx ? "text-primary" : "text-slate-700"}`}>
                    {preset.label}
                  </p>
                  <span className="text-xs text-slate-500">{preset.roi}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 할인율 슬라이더 */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">할인율</label>
              <span className="rounded border border-[#CFE0FF] bg-[#EEF4FF] px-2 py-0.5 text-sm font-bold text-primary shadow-sm">
                {discount}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-0.5 flex justify-between text-xs text-slate-400">
              <span>5%</span>
              <span>30%</span>
            </div>
          </div>

          {/* 메시지 */}
          <div className="mt-4 flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">발송 메시지</label>
            <textarea
              className="h-24 w-full rounded-xl border border-[#D6E0F0] bg-white p-3 text-sm text-slate-700 outline-none transition-colors focus:border-primary/50"
              defaultValue={`고객님, 오랜만에 방문하시면 ${discount}% 할인 혜택을 드립니다. (7일 유효)`}
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-lg border border-[#D6E0F0] bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F8FAFF]">
              테스트 발송
            </button>
            <button className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E5BE9]">
              승인 요청
            </button>
          </div>
        </article>

      </section>

      {/* 예상 성과 요약 */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6 shadow-elevated">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <BarChart2 className="h-5 w-5 text-slate-400" />
          예상 성과 요약
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            { label: "발송 대상", value: selected?.users ?? "-" },
            { label: "예상 오픈율", value: "38.2%" },
            { label: "예상 복귀율", value: "24.0%" },
            { label: "예상 ROI", value: "416%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4 shadow-sm">
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
