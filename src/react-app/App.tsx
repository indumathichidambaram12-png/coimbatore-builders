import { BrowserRouter as Router, Routes, Route } from "react-router";
import { LanguageProvider } from "@/react-app/contexts/LanguageContext";
import { AuthProvider } from "@/react-app/contexts/AuthContext";
import { DatabaseProvider } from "@/shared/contexts/DatabaseContext";
import Layout from "@/react-app/components/Layout";
import AuthGuard from "@/react-app/components/AuthGuard";
import Dashboard from "@/react-app/pages/Dashboard";
import Workers from "@/react-app/pages/Workers";
import Attendance from "@/react-app/pages/Attendance";
import Payments from "@/react-app/pages/Payments";
import Projects from "@/react-app/pages/Projects";
import Reports from "@/react-app/pages/Reports";
import Settings from "@/react-app/pages/Settings";

import { useEffect } from "react";
import { SyncService } from "@/shared/services/SyncService";

export default function App() {
  useEffect(() => {
    const syncService = SyncService.getInstance();
    syncService.initSyncListeners();
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <DatabaseProvider>
          <Router>
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/workers" element={<Workers />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </AuthGuard>
          </Router>
        </DatabaseProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
