import type React from "react";
import { Link } from "react-router-dom";
import { DatabaseZap } from "lucide-react";

type ColdStartBannerProps = {
  reason?: string;
  availableScopes?: string[];
};

export const ColdStartBanner: React.FC<ColdStartBannerProps> = ({
  reason = "분석에 필요한 최소 데이터가 부족합니다.",
  availableScopes,
}) => {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <DatabaseZap className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800">데이터 부족 안내</p>
          <p className="mt-0.5 text-sm text-amber-700">{reason}</p>
          {availableScopes && availableScopes.length > 0 && (
            <p className="mt-1.5 text-xs text-amber-600">
              현재 가능한 분석: {availableScopes.join(", ")}
            </p>
          )}
          <Link
            to="/data/upload"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            데이터 업로드하기
          </Link>
        </div>
      </div>
    </div>
  );
};
