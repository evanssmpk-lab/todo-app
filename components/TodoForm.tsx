"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createTodo } from "@/app/actions/todos";
import { CategoryPicker } from "@/components/CategoryPicker";
import { DatePicker } from "@/components/DatePicker";
import { TimePicker } from "@/components/TimePicker";
import { PrioritySlider } from "@/components/PrioritySlider";
import type { Kategori, Prioritas } from "@/lib/types";

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const inputClass =
  "rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition-all hover:shadow-violet-700/40 hover:brightness-110 active:scale-[0.97] disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : "+ Tambah"}
    </button>
  );
}

export function TodoForm({
  kategoriList,
  prioritasList,
}: {
  kategoriList: Kategori[];
  prioritasList: Prioritas[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [kategoriId, setKategoriId] = useState("");
  const [prioritasId, setPrioritasId] = useState("");
  const [tanggal, setTanggal] = useState(todayISO());
  const [jam, setJam] = useState("");

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createTodo(formData);
        formRef.current?.reset();
        setKategoriId("");
        setPrioritasId("");
        setTanggal(todayISO());
        setJam("");
      }}
      className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm transition-shadow focus-within:border-violet-800/60 sm:grid-cols-6"
    >
      <input
        name="aktivitas"
        required
        placeholder="Mau ngapain nih?"
        className={`${inputClass} sm:col-span-2`}
      />
      <div className="sm:col-span-2">
        <input type="hidden" name="tanggal" value={tanggal} required />
        <DatePicker value={tanggal} onChange={setTanggal} />
      </div>
      <div className="sm:col-span-2">
        <input type="hidden" name="jam" value={jam} />
        <TimePicker value={jam} onChange={setJam} />
      </div>
      <input
        name="catatan"
        placeholder="Catatan (opsional)"
        className={`${inputClass} sm:col-span-6`}
      />

      <div className="sm:col-span-3">
        <input type="hidden" name="kategori_id" value={kategoriId} />
        <CategoryPicker
          options={kategoriList}
          value={kategoriId}
          onChange={setKategoriId}
          placeholder="Kategori..."
        />
      </div>
      <div className="sm:col-span-3">
        <input type="hidden" name="prioritas_id" value={prioritasId} />
        <PrioritySlider
          options={prioritasList}
          value={prioritasId}
          onChange={setPrioritasId}
        />
      </div>

      <div className="sm:col-span-6">
        <SubmitButton />
      </div>
    </form>
  );
}
