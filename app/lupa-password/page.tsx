"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";

export default function LupaPasswordPage() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    undefined
  );

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm"
      >
        <h1 className="mb-1 bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-xl font-semibold text-transparent">
          Lupa password
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          Masukkan email akunmu, nanti dikirim link buat bikin password baru.
        </p>

        {state?.message ? (
          <p className="mb-4 rounded-lg border border-emerald-900 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
            {state.message}
          </p>
        ) : (
          <>
            <label
              className="mb-1 block text-sm text-zinc-400"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mb-6 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-zinc-50 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
            />

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 py-2 font-medium text-white shadow-lg shadow-violet-900/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {pending ? "Mengirim..." : "Kirim link reset"}
            </button>
          </>
        )}

        <Link
          href="/login"
          className="mt-4 block text-center text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Kembali ke login
        </Link>
      </form>
    </div>
  );
}
