import React from "react";

export function LogoMark({ className = "h-9 w-9" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="12"
        fill="var(--color-primary)"
        stroke="var(--text-on-dark)"
        strokeOpacity="0.16"
      />
      <path
        d="M16.5 30.5V17.5c0-.9 1-1.4 1.7-.8l5.8 5.1 5.8-5.1c.7-.6 1.7-.1 1.7.8v13c0 4-3.3 7.3-7.3 7.3h-2.2c-4 0-7.3-3.3-7.3-7.3Z"
        fill="var(--color-accent)"
        opacity="0.95"
      />
      <path
        d="M16.5 20.3l7.5 6.7 7.5-6.7"
        stroke="var(--text-on-dark)"
        strokeOpacity="0.85"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

