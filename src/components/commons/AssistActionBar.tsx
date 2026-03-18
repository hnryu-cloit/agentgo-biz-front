import type React from "react";
import { cn } from "@/lib/utils";

type ActionItem = {
  label: string;
  onClick: () => void;
  tone?: "primary" | "neutral";
};

type AssistActionBarProps = {
  summary: ActionItem;
  action: ActionItem;
  compare?: ActionItem;
  className?: string;
  compact?: boolean;
};

function ActionButton({
  label,
  onClick,
  tone = "neutral",
  compact = false,
}: ActionItem & { compact?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl border text-center font-black transition-colors",
        compact ? "px-2 py-2 text-[11px]" : "px-3 py-3 text-xs",
        tone === "primary"
          ? "border-[#c9d8ff] bg-[#eef3ff] text-primary hover:bg-[#e3edff]"
          : "border-[#d5deec] bg-white text-slate-700 hover:bg-[#f7faff]",
      )}
    >
      {label}
    </button>
  );
}

export const AssistActionBar: React.FC<AssistActionBarProps> = ({
  summary,
  action,
  compare,
  className,
  compact = false,
}) => {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-2xl border border-[#dbe4f3] bg-[#f3f7ff] p-2",
        compare ? "grid-cols-3" : "grid-cols-2",
        className,
      )}
    >
      <ActionButton {...summary} compact={compact} />
      <ActionButton {...action} tone={action.tone ?? "primary"} compact={compact} />
      {compare ? <ActionButton {...compare} compact={compact} /> : null}
    </div>
  );
};
