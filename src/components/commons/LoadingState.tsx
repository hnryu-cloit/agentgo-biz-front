import type React from "react";

type LoadingStateProps = {
  message?: string;
};

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "데이터를 불러오는 중..." }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#d5deec] bg-[#f4f7ff] py-14 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d5deec] border-t-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
