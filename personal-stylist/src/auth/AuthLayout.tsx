// src/auth/AuthLayout.tsx
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div
        className="w-full bg-white rounded-xl shadow-lg p-8"
        style={{
          maxWidth: "520px",
          borderRadius: "12px",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06)",
        }}
      >
        {/* Header / Branding */}
        <div className="flex items-center gap-3 mb-6">
          {/* Replace with your logo image if you have one */}
          <div className="h-9 w-9 rounded-lg bg-[#2563EB]/10 grid place-items-center font-bold text-[#2563EB]">
            S
          </div>
          <div>
            <div className="text-base font-semibold text-[#0A0A0A]">
              StyleAI
            </div>
            <div className="text-xs text-[#6B7280]">
              Your personal stylist, powered by AI
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
