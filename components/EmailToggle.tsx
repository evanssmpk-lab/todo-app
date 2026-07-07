"use client";

import { useState } from "react";

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return "•".repeat(email.length);
  const visible = name.slice(0, 1);
  return `${visible}${"•".repeat(Math.max(name.length - 1, 3))}@${domain}`;
}

export function EmailToggle({ email }: { email: string }) {
  const [visible, setVisible] = useState(true);

  return (
    <span className="hidden items-center gap-1.5 sm:flex">
      <span className="tabular-nums">{visible ? email : maskEmail(email)}</span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan email" : "Tampilkan email"}
        className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        {visible ? (
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 4.24A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-3.06 4.06M6.1 6.1C3.6 7.8 2 10 2 10s3.5 8 10 8a10.6 10.6 0 0 0 3.9-.74"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </span>
  );
}
