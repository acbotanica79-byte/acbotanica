"use client";

import { useState } from "react";

const PETAL_ANGLES = [0, 72, 144, 216, 288];

function FlowerToggleIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="overflow-visible">
      {PETAL_ANGLES.map((angle, i) => (
        <ellipse
          key={angle}
          cx="12"
          cy="12"
          rx="3.2"
          ry="5.2"
          fill="currentColor"
          style={{
            transformOrigin: "12px 12px",
            transform: `rotate(${angle}deg) translateY(${open ? -6.5 : -2}px) scale(${open ? 1 : 0.2})`,
            opacity: open ? 0.85 : 0,
            transition: `transform 320ms cubic-bezier(.34,1.56,.64,1) ${i * 22}ms, opacity 220ms ${i * 22}ms`,
          }}
        />
      ))}
      <circle
        cx="12"
        cy="12"
        r={open ? 2.6 : 3.4}
        fill="currentColor"
        style={{ transition: "r 280ms ease" }}
      />
    </svg>
  );
}

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  placeholder?: string;
}

export default function PasswordField({
  value,
  onChange,
  label,
  id,
  autoComplete = "current-password",
  required = true,
  minLength,
  disabled,
  placeholder,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-verde-escuro">
          {label}
        </label>
      )}
      <div className="relative mt-1.5">
        <input
          id={id}
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-verde-claro/50 bg-branco px-4 py-2.5 pr-11 text-sm outline-none focus:border-verde-musgo disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Esconder senha" : "Mostrar senha"}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-verde-musgo hover:bg-verde-claro/15"
        >
          <FlowerToggleIcon open={show} />
        </button>
      </div>
    </div>
  );
}
