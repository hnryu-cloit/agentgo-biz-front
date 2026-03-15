import type React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/commons/Layout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { OwnerDashboardPage } from "@/pages/OwnerDashboardPage";
import { QnaPage } from "@/pages/QnaPage";
import { SupervisorDashboardPage } from "@/pages/SupervisorDashboardPage";
import { SvAnalysisPage } from "@/pages/SvAnalysisPage";
import { SvActionsPage } from "@/pages/SvActionsPage";
import { SvVisitLogPage } from "@/pages/SvVisitLogPage";
import { HqControlTowerPage } from "@/pages/HqControlTowerPage";
import { DataUploadPage } from "@/pages/DataUploadPage";
import { NoticeOcrPage } from "@/pages/NoticeOcrPage";
import { CampaignDesignerPage } from "@/pages/CampaignDesignerPage";
import { CampaignPerformancePage } from "@/pages/CampaignPerformancePage";
import { RfmSegmentPage } from "@/pages/RfmSegmentPage";
import { AlertDetailPage } from "@/pages/AlertDetailPage";
import { PromoRoiPage } from "@/pages/PromoRoiPage";
import { BenchmarkPage } from "@/pages/BenchmarkPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsUsersPage } from "@/pages/SettingsUsersPage";
import { SettingsStoresPage } from "@/pages/SettingsStoresPage";
import { StockTakePage } from "@/pages/StockTakePage";
import { LaborOptimizationPage } from "@/pages/LaborOptimizationPage";
import { AdminSettingsPage } from "@/pages/AdminSettingsPage";

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 로그인 — Layout 밖 */}
      <Route path="/login" element={<LoginPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/overview" element={<HomePage />} />

        {/* 점주 */}
        <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
        <Route path="/owner/qna" element={<QnaPage />} />
        <Route path="/owner/stock-take" element={<StockTakePage />} />
        <Route path="/owner/labor" element={<LaborOptimizationPage />} />

        {/* SV */}
        <Route path="/supervisor/dashboard" element={<SupervisorDashboardPage />} />
        <Route path="/supervisor/analysis" element={<SvAnalysisPage />} />
        <Route path="/supervisor/actions" element={<SvActionsPage />} />
        <Route path="/supervisor/visit-log" element={<SvVisitLogPage />} />

        {/* 본사 */}
        <Route path="/hq/control-tower" element={<HqControlTowerPage />} />
        <Route path="/hq/notices" element={<NoticeOcrPage />} />
        <Route path="/hq/alerts/detail" element={<AlertDetailPage />} />

        {/* 마케팅 */}
        <Route path="/marketing/campaigns" element={<CampaignDesignerPage />} />
        <Route path="/marketing/rfm" element={<RfmSegmentPage />} />
        <Route path="/marketing/performance" element={<CampaignPerformancePage />} />

        {/* 분석 */}
        <Route path="/analysis/roi" element={<PromoRoiPage />} />
        <Route path="/analysis/benchmark" element={<BenchmarkPage />} />

        {/* 리포트 / 설정 */}
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings/users" element={<SettingsUsersPage />} />
        <Route path="/settings/stores" element={<SettingsStoresPage />} />

        {/* 데이터 */}
        <Route path="/data/upload" element={<DataUploadPage />} />

        {/* 관리자 설정 */}
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};