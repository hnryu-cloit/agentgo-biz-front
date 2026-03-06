import { useState } from "react";
import { storeNames } from "@/data/mockStoreResource";

type UploadType = "sales" | "cost" | "customer" | "review";

const typeTabs: { value: UploadType; label: string }[] = [
  { value: "sales", label: "매출" },
  { value: "cost", label: "원가/메뉴" },
  { value: "customer", label: "고객/포인트" },
  { value: "review", label: "리뷰" },
];

export const DataUploadPage = () => {
  const [selectedType, setSelectedType] = useState<UploadType>("sales");
  const [selectedStore, setSelectedStore] = useState("전체 매장");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <h2 className="text-2xl font-bold text-slate-900">데이터 업로드</h2>
        <p className="mt-1 text-base text-slate-500">원천 파일을 업로드하고 처리 상태를 확인합니다.</p>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={
                selectedType === tab.value
                  ? "rounded-lg border border-[#BFD4FF] bg-[#EEF4FF] px-3 py-2 text-sm font-semibold text-[#2454C8]"
                  : "rounded-lg border border-[#D6E0F0] bg-white px-3 py-2 text-sm font-medium text-slate-600"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <div className="rounded-xl border-2 border-dashed border-[#DCE4F3] bg-[#F7FAFF] p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">파일을 드래그하거나 선택하세요</p>
              <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">파일 선택</button>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">매장</label>
              <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="h-10 w-full rounded-lg border border-[#D6E0F0] bg-white px-3 text-sm">
                <option>전체 매장</option>
                {storeNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-[#DCE4F3] bg-[#F7FAFF] p-4">
            <p className="text-sm font-semibold text-slate-800">미리보기</p>
            <div className="mt-3 flex h-48 items-center justify-center rounded-lg border border-[#D6E0F0] bg-white text-sm text-slate-500">
              선택된 파일이 없습니다
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
