import type React from "react";
import { Sparkles, Target } from "lucide-react";

type InlineAssistPanelProps = {
  title: string;
  why: string;
  actionLabel: string;
};

export const InlineAssistPanel: React.FC<InlineAssistPanelProps> = ({
  title,
  why,
  actionLabel,
}) => {
  return (
    <div className="mt-3 rounded-2xl border border-[#cfe0ff] bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">현재 선택 항목 해설</p>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-white/80 bg-white/70 px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">왜 이런가</p>
        <p className="mt-1 text-sm font-medium leading-5 text-slate-700">{why}</p>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-2">
        <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-primary">지금 할 일</p>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-700">{actionLabel}</p>
        </div>
      </div>
    </div>
  );
};
