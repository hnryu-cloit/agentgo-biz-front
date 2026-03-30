import { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/commons/Layout";
import { useAuth } from "@/contexts/useAuth";
import { authStorage } from "@/lib/apiClient";
import { LoadingState } from "@/components/commons/LoadingState";

const AdminSettingsPage = lazy(() => import("@/pages/AdminSettingsPage").then((module) => ({ default: module.AdminSettingsPage })));
const AlertDetailPage = lazy(() => import("@/pages/AlertDetailPage").then((module) => ({ default: module.AlertDetailPage })));
const BenchmarkPage = lazy(() => import("@/pages/BenchmarkPage").then((module) => ({ default: module.BenchmarkPage })));
const CampaignDesignerPage = lazy(() => import("@/pages/CampaignDesignerPage").then((module) => ({ default: module.CampaignDesignerPage })));
const CampaignPerformancePage = lazy(() => import("@/pages/CampaignPerformancePage").then((module) => ({ default: module.CampaignPerformancePage })));
const DataUploadPage = lazy(() => import("@/pages/DataUploadPage").then((module) => ({ default: module.DataUploadPage })));
const HqControlTowerPage = lazy(() => import("@/pages/HqControlTowerPage").then((module) => ({ default: module.HqControlTowerPage })));
const LaborOptimizationPage = lazy(() => import("@/pages/LaborOptimizationPage").then((module) => ({ default: module.LaborOptimizationPage })));
const LoginPage = lazy(() => import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const NoticeOcrPage = lazy(() => import("@/pages/NoticeOcrPage").then((module) => ({ default: module.NoticeOcrPage })));
const OwnerDashboardPage = lazy(() => import("@/pages/OwnerDashboardPage").then((module) => ({ default: module.OwnerDashboardPage })));
const PromoRoiPage = lazy(() => import("@/pages/PromoRoiPage").then((module) => ({ default: module.PromoRoiPage })));
const ReportsPage = lazy(() => import("@/pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const RfmSegmentPage = lazy(() => import("@/pages/RfmSegmentPage").then((module) => ({ default: module.RfmSegmentPage })));
const SettingsStoresPage = lazy(() => import("@/pages/SettingsStoresPage").then((module) => ({ default: module.SettingsStoresPage })));
const SettingsUsersPage = lazy(() => import("@/pages/SettingsUsersPage").then((module) => ({ default: module.SettingsUsersPage })));
const StockTakePage = lazy(() => import("@/pages/StockTakePage").then((module) => ({ default: module.StockTakePage })));
const SupervisorDashboardPage = lazy(() => import("@/pages/SupervisorDashboardPage").then((module) => ({ default: module.SupervisorDashboardPage })));
const SvActionsPage = lazy(() => import("@/pages/SvActionsPage").then((module) => ({ default: module.SvActionsPage })));
const SvAnalysisPage = lazy(() => import("@/pages/SvAnalysisPage").then((module) => ({ default: module.SvAnalysisPage })));
const SvVisitLogPage = lazy(() => import("@/pages/SvVisitLogPage").then((module) => ({ default: module.SvVisitLogPage })));

const PrivateRoute: React.FC = () => {
  const { isLoading } = useAuth();
  const token = authStorage.getAccessToken();
  if (isLoading) return <LoadingState />;
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const roleHomePath: Record<string, string> = {
  store_owner: "/owner/dashboard",
  supervisor: "/supervisor/dashboard",
  hq_admin: "/hq/control-tower",
  marketer: "/marketing/rfm",
};

const RoleHomeRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingState />;
  const target = user?.role ? roleHomePath[user.role] : "/login";
  return <Navigate to={target} replace />;
};

const RoleRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingState />;

  if (user && allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingState message="페이지를 불러오는 중..." />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<RoleHomeRedirect />} />
            <Route path="/overview" element={<RoleHomeRedirect />} />

            {/* 점주 전용 영역 */}
            <Route element={<RoleRoute allowedRoles={["store_owner"]} />}>
              <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
              <Route path="/owner/stock-take" element={<StockTakePage />} />
              <Route path="/owner/labor" element={<LaborOptimizationPage />} />
              <Route path="/analysis/benchmark" element={<BenchmarkPage />} />
            </Route>

            {/* SV 전용 영역 */}
            <Route element={<RoleRoute allowedRoles={["supervisor"]} />}>
              <Route path="/supervisor/dashboard" element={<SupervisorDashboardPage />} />
              <Route path="/supervisor/analysis" element={<SvAnalysisPage />} />
              <Route path="/supervisor/actions" element={<SvActionsPage />} />
              <Route path="/supervisor/visit-log" element={<SvVisitLogPage />} />
            </Route>

            {/* 마케터 전용 영역 */}
            <Route element={<RoleRoute allowedRoles={["marketer"]} />}>
              <Route path="/marketing/campaigns" element={<CampaignDesignerPage />} />
              <Route path="/marketing/rfm" element={<RfmSegmentPage />} />
              <Route path="/marketing/performance" element={<CampaignPerformancePage />} />
              <Route path="/analysis/roi" element={<PromoRoiPage />} />
            </Route>

            {/* 본사 관리자 전용 영역 */}
            <Route element={<RoleRoute allowedRoles={["hq_admin"]} />}>
              <Route path="/hq/control-tower" element={<HqControlTowerPage />} />
              <Route path="/hq/notices" element={<NoticeOcrPage />} />
              <Route path="/hq/alerts/detail" element={<AlertDetailPage />} />
              <Route path="/data/upload" element={<DataUploadPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings/users" element={<SettingsUsersPage />} />
              <Route path="/settings/stores" element={<SettingsStoresPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
