import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import { ProtectedRoute, AdminRoute, GuestRoute } from "@/components/auth/ProtectedRoute";
import LoginPage     from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import FieldsPage    from "@/pages/FieldsPage";
import AgentsPage    from "@/pages/AgentsPage";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            borderRadius: "var(--r-sm)",
            border: "1px solid var(--mist)",
            boxShadow: "var(--shadow-md)",
          },
          success: {
            iconTheme: { primary: "var(--sage-2)", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "var(--terracotta)", secondary: "#fff" },
          },
        }}
      />

      <Routes>
        
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fields"    element={<FieldsPage />} />

     
            <Route element={<AdminRoute />}>
              <Route path="/agents" element={<AgentsPage />} />
            </Route>
          </Route>
        </Route>

   
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
