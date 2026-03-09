import type React from "react";
import { useState } from "react";
import {
  Terminal,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

type ParsedIntent = {
  menu: string;
  action: "price_change" | "set_add" | "discount";
  delta: number;
  unit: "원" | "%";
};

type SimResult = {
  currentPrice: number;
  newPrice: number;
  currentMargin: number;
  newMargin: number;
  salesVolumeImpact: number;
  revenueImpact: number;
  riskLevel: "low" | "medium" | "high";
  interpretation: string;
};

const exampleCommands = [
  "메뉴B 가격 500원 올려줘",
  "아메리카노를 세트A에 포함시켜줘",
  "점심 세트 10% 할인 적용해줘",
];

function mockParse(input: string): ParsedIntent | null {
  if (input.includes("500원") || input.includes("가격") || input.includes("올려")) {
    return { menu: "메뉴B (아메리카노)", action: "price_change", delta: 500, unit: "원" };
  }
  if (input.includes("세트") && input.includes("포함")) {
    return { menu: "아메리카노", action: "set_add", delta: 0, unit: "원" };
  }
  if (input.includes("할인") || input.includes("%")) {
    return { menu: "점심 세트", action: "discount", delta: 10, unit: "%" };
  }
  return null;
}

function mockSimulate(intent: ParsedIntent): SimResult {
  if (intent.action === "price_change") {
    return {
      currentPrice: 4500,
      newPrice: 5000,
      currentMargin: 18.1,
      newMargin: 20.2,
      salesVolumeImpact: -5,
      revenueImpact: 8.3,
      riskLevel: "medium",
      interpretation:
        "가격 인상 시 마진은 +2.1%p 개선되나, 수요 탄력성에 의해 판매량이 약 5% 감소할 수 있습니다. 경쟁 매장 대비 가격 수용성은 '보통' 수준입니다.",
    };
  }
  if (intent.action === "discount") {
    return {
      currentPrice: 12000,
      newPrice: 10800,
      currentMargin: 22,
      newMargin: 16.4,
      salesVolumeImpact: 18,
      revenueImpact: 6.2,
      riskLevel: "high",
      interpretation:
        "할인 적용 시 객수 증가(+18%)가 기대되나 마진이 목표치 아래로 하락합니다. 기간 한정 적용을 권장합니다.",
    };
  }
  return {
    currentPrice: 4500,
    newPrice: 5500,
    currentMargin: 18.1,
    newMargin: 23.5,
    salesVolumeImpact: 12,
    revenueImpact: 15.0,
    riskLevel: "low",
    interpretation: "세트 구성 변경으로 묶음 판매 효과가 기대됩니다. 객단가 상승과 함께 매출 기여가 긍정적입니다.",
  };
}

export const PosSimulationPage: React.FC = () => {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<ParsedIntent | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [approved, setApproved] = useState(false);
  const [parseError, setParseError] = useState(false);

  const handleSimulate = () => {
    if (!command.trim()) return;
    setLoading(true);
    setIntent(null);
    setResult(null);
    setApproved(false);
    setParseError(false);

    setTimeout(() => {
      const parsed = mockParse(command);
      if (!parsed) {
        setParseError(true);
        setLoading(false);
        return;
      }
      setIntent(parsed);
      const sim = mockSimulate(parsed);
      setResult(sim);
      setLoading(false);
    }, 1200);
  };

  const riskColors = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-700",
    medium: "border-amber-200 bg-amber-50 text-amber-700",
    high: "border-red-200 bg-red-50 text-red-700",
  };
  const riskLabel = { low: "낮음", medium: "보통", high: "높음" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF]">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">POS 변경 시뮬레이션</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              자연어로 POS 변경 명령을 입력하면 마진·매출 영향을 시뮬레이션합니다.
            </p>
          </div>
        </div>

        {/* MVP Notice */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#BFD4FF] bg-[#EEF4FF] px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-primary">MVP 안내:</span> 현재 시뮬레이션 결과만 제공되며 실제 POS에는 적용되지 않습니다.
            실제 적용은 수동으로 POS에서 처리해 주세요. (Phase 2 자동화 예정)
          </p>
        </div>

        {/* Command Input */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">변경 명령 입력</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
              placeholder="예) 메뉴B 가격 500원 올려줘"
              className="h-11 flex-1 rounded-xl border border-[#D6E0F0] bg-white px-4 text-sm text-slate-800 placeholder-slate-300 focus:border-primary focus:outline-none"
            />
            <button
              onClick={handleSimulate}
              disabled={!command.trim() || loading}
              className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              시뮬레이션
            </button>
          </div>

          {/* Example chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {exampleCommands.map((ex) => (
              <button
                key={ex}
                onClick={() => setCommand(ex)}
                className="rounded-full border border-[#DCE4F3] bg-[#F7FAFF] px-3 py-1 text-xs text-slate-600 hover:border-[#BFD4FF] hover:text-primary"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Parse Error */}
      {parseError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">명령을 이해하지 못했습니다</p>
            <p className="mt-0.5 text-sm text-red-600">
              구체적인 메뉴명과 변경 내용을 포함해 다시 입력해 주세요. (예: "메뉴B 가격 500원 올려줘")
            </p>
          </div>
        </div>
      )}

      {/* Parse Preview */}
      {intent && (
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <h3 className="text-lg font-bold text-slate-900">의도 파싱 결과</h3>
          <p className="mt-0.5 text-sm text-slate-500">AI가 해석한 명령 내용을 확인하세요.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { label: "대상 메뉴", value: intent.menu },
              { label: "변경 유형", value: intent.action === "price_change" ? "가격 변경" : intent.action === "set_add" ? "세트 구성" : "할인 적용" },
              { label: "변경 값", value: intent.delta > 0 ? `+${intent.delta}${intent.unit}` : "세트 추가" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-3">
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="mt-1 text-base font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Simulation Result */}
      {result && (
        <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">시뮬레이션 결과</h3>
            <span className={`rounded border px-2 py-0.5 text-xs font-bold ${riskColors[result.riskLevel]}`}>
              위험도: {riskLabel[result.riskLevel]}
            </span>
          </div>

          {/* Before / After */}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">현재</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">판매가</span>
                  <span className="font-semibold text-slate-800">{result.currentPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">마진율</span>
                  <span className="font-semibold text-slate-800">{result.currentMargin}%</span>
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${result.riskLevel === "high" ? "border-red-200 bg-red-50" : "border-[#BFD4FF] bg-[#EEF4FF]"}`}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">변경 후</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">판매가</span>
                  <span className="font-bold text-slate-900">{result.newPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">마진율</span>
                  <span className={`font-bold ${result.newMargin >= result.currentMargin ? "text-emerald-600" : "text-red-600"}`}>
                    {result.newMargin}%
                    {result.newMargin >= result.currentMargin ? (
                      <TrendingUp className="ml-1 inline h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="ml-1 inline h-3.5 w-3.5" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3">
              <span className="text-sm text-slate-500">판매량 영향</span>
              <span className={`text-sm font-bold ${result.salesVolumeImpact >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {result.salesVolumeImpact > 0 ? "+" : ""}{result.salesVolumeImpact}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] px-4 py-3">
              <span className="text-sm text-slate-500">매출 영향</span>
              <span className={`text-sm font-bold ${result.revenueImpact >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {result.revenueImpact > 0 ? "+" : ""}{result.revenueImpact}%
              </span>
            </div>
          </div>

          {/* AI Interpretation */}
          <div className="mt-4 rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
            <p className="text-xs font-semibold text-slate-700">AI 해석</p>
            <p className="mt-1 text-sm text-slate-600">{result.interpretation}</p>
          </div>

          {/* Approve */}
          {!approved ? (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm text-amber-700">
                <span className="font-semibold">수동 적용 안내:</span> 시뮬레이션 확인 후 실제 POS에서 직접 변경해 주세요.
              </p>
              <button
                onClick={() => setApproved(true)}
                className="ml-4 shrink-0 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                이력 저장
              </button>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">시뮬레이션 결과가 이력에 저장되었습니다.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};