// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/auth/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/auth/Login";
import StylistPage from "@/PersonalStylistUI/StylistPage";
import SavedList from "@/PersonalStylistUI/SavedList";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* App (protected) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <StylistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedList />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
