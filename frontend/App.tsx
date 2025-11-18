
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UserDashboardEnhanced from './pages/UserDashboardEnhanced';
import ReportAnomalyPage from './pages/ReportAnomalyPage';
import AnomalyUploadEnhanced from './pages/AnomalyUploadEnhanced';
import AnomalyUploadReal from './pages/AnomalyUploadReal';
import AIDetectionPage from './pages/AIDetectionPage';
import OpusWorkflowPage from './pages/OpusWorkflowPage';
import HumanReviewPage from './pages/HumanReviewPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';
import IncidentDetailsEnhanced from './pages/IncidentDetailsEnhanced';
import VerificationPage from './pages/VerificationPage';
import OperationsConsole from './pages/OperationsConsole';
import AlertsDeliveryPage from './pages/AlertsDeliveryPage';
import GlobalAnalyticsPage from './pages/GlobalAnalyticsPage';
import GlobalAnalyticsEnhanced from './pages/GlobalAnalyticsEnhanced';
import SettingsPage from './pages/SettingsPage';
import AuditViewerPage from './pages/AuditViewerPage';
import AboutPage from './pages/AboutPage';
import OnboardingPage from './pages/OnboardingPage';
import NotFoundPage from './pages/NotFoundPage';

const AppContent: React.FC = () => {
    const location = useLocation();
    const showSidebar = location.pathname !== '/';

    return (
        <div className="flex h-screen bg-gaia-dark text-gaia-text font-sans">
            {showSidebar && <Sidebar />}
            <main className="flex-1 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard-enhanced" element={<UserDashboardEnhanced />} />
                    <Route path="/report" element={<ReportAnomalyPage />} />
                    <Route path="/upload" element={<AnomalyUploadReal />} />
                    <Route path="/detection/:id" element={<AIDetectionPage />} />
                    <Route path="/workflow/:id" element={<OpusWorkflowPage />} />
                    <Route path="/review/:id" element={<HumanReviewPage />} />
                    <Route path="/incident/:id" element={<IncidentDetailsPage />} />
                    <Route path="/incident-enhanced/:id" element={<IncidentDetailsEnhanced />} />
                    <Route path="/verification/:id" element={<VerificationPage />} />
                    <Route path="/operations" element={<OperationsConsole />} />
                    <Route path="/alerts" element={<AlertsDeliveryPage />} />
                    <Route path="/analytics" element={<GlobalAnalyticsPage />} />
                    <Route path="/analytics-enhanced" element={<GlobalAnalyticsEnhanced />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/audit/:id" element={<AuditViewerPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
        </div>
    );
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
