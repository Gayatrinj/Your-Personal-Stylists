// src/auth/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null; // or a spinner
  // ⬇️ redirect unauthenticated to LANDING, not /login
  return user ? <>{children}</> : <Navigate to="/" replace />;
}
