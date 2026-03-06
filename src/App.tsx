import type React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/commons/Layout";
import { HomePage } from "@/pages/HomePage";
import { OwnerDashboardPage } from "@/pages/OwnerDashboardPage";
import { SupervisorDashboardPage } from "@/pages/SupervisorDashboardPage";
import { HqControlTowerPage } from "@/pages/HqControlTowerPage";
import { DataUploadPage } from "@/pages/DataUploadPage";
import { NoticeOcrPage } from "@/pages/NoticeOcrPage";
import { CampaignDesignerPage } from "@/pages/CampaignDesignerPage";
import { AlertDetailPage } from "@/pages/AlertDetailPage";

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/overview" element={<HomePage />} />
        <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
        <Route path="/supervisor/dashboard" element={<SupervisorDashboardPage />} />
        <Route path="/hq/control-tower" element={<HqControlTowerPage />} />
        <Route path="/hq/notices" element={<NoticeOcrPage />} />
        <Route path="/marketing/campaigns" element={<CampaignDesignerPage />} />
        <Route path="/hq/alerts/detail" element={<AlertDetailPage />} />
        <Route path="/data/upload" element={<DataUploadPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

