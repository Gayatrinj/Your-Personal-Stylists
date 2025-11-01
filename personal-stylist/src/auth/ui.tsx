// src/auth/ui.tsx
import * as React from "react";

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outline" | "solid" }
) {
  const { className = "", variant = "solid", ...rest } = props;
  const base =
    "inline-flex items-center justify-center rounded-lg h-11 px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2";
  const style =
    variant === "outline"
      ? "border border-[#E5E7EB] text-[#0A0A0A] hover:bg-gray-50 bg-white"
      : "bg-[#2563EB] hover:bg-[#1d4ed8] text-white";
  return <button className={`${base} ${style} ${className}`} {...rest} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  const base =
    "w-full h-11 rounded-lg border border-[#E5E7EB] px-3 text-sm focus:border-[#2563EB] focus:ring-[#2563EB] outline-none";
  return <input className={`${base} ${className}`} {...rest} />;
}

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { className = "", ...rest } = props;
  return <label className={`text-sm text-[#0A0A0A] ${className}`} {...rest} />;
}

export function Checkbox(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-[#E5E7EB] accent-[#2563EB]"
      {...props}
    />
  );
}
