"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface TextInputProps extends React.ComponentProps<"input"> {
  className?: string;
  label?: string;
  icon?: React.ReactNode;
  variant?: "standard" | "error" | "warning";
  helperMessage?: string;
}

function TextInput({
  className,
  label,
  icon,
  variant = "standard",
  value,
  name,
  placeholder = "",
  helperMessage,
  onChange,
  onClick,
  onBlur,
  ...rest
}: TextInputProps) {
  const id = useId();

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-ProximaNovaSemiBold text-color-6 uppercase tracking-wide mb-1.5"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 ring-1 transition-all duration-200",
          variant === "standard" && "ring-color-7 focus-within:ring-2 focus-within:ring-color-2",
          variant === "error" && "!ring-2 !ring-red-500",
          variant === "warning" && "!ring-2 !ring-yellow-500"
        )}
      >
        {icon && <span className="text-color-5 shrink-0 [&>svg]:size-4">{icon}</span>}
        <input
          id={id}
          className={cn(
            "w-full min-w-0 bg-transparent text-base text-color-1 font-ProximaNovaMed placeholder:text-color-5/80 placeholder:font-ProximaNovaThin focus:outline-none",
            variant === "error" && "text-red-500 error-placeholder",
            variant === "warning" && "text-yellow-600 warning-placeholder"
          )}
          type="text"
          value={value}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          onClick={onClick}
          onBlur={onBlur}
          {...rest}
        />
      </div>
      {helperMessage && (
        <span className="block text-xs text-red-500 font-ProximaNovaThin mt-1.5">
          {helperMessage}
        </span>
      )}
    </div>
  );
}

export default TextInput;
