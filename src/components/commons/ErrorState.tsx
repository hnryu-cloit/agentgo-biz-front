import type React from "react";
import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "데이터를 불러올 수 없습니다",
  message = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <p className="mt-4 text-base font-semibold text-[#34415b]">{title}</p>
      <p className="mt-1.5 max-w-xs text-sm text-[var(--subtle-foreground)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 rounded-lg border border-[#d5deec] bg-white px-4 py-2 text-sm font-medium text-[#34415b] hover:bg-[#f4f7ff]"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};
