"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    undefined
  );

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm"
    >
      <h1 className="mb-1 bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-xl font-semibold text-transparent">
        Buat password baru
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Password baru akan langsung dipakai untuk login berikutnya.
      </p>

      <label className="mb-1 block text-sm text-zinc-400" htmlFor="password">
        Password baru
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-zinc-50 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
      />

      <label className="mb-1 block text-sm text-zinc-400" htmlFor="confirm">
        Konfirmasi password
      </label>
      <input
        id="confirm"
        name="confirm"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        className="mb-6 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-zinc-50 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
      />

      {state?.error && (
        <p className="mb-4 text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 py-2 font-medium text-white shadow-lg shadow-violet-900/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan password baru"}
      </button>
    </form>
  );
}
