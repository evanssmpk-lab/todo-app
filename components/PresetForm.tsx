"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPreset } from "@/app/actions/presets";
import { CategoryPicker } from "@/components/CategoryPicker";
import { PrioritySlider } from "@/components/PrioritySlider";
import { TimePicker } from "@/components/TimePicker";
import { HARI_PENDEK, describeHari } from "@/lib/calendar";
import type { Kategori, Prioritas } from "@/lib/types";

const inputClass =
  "rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : "+ Buat preset"}
    </button>
  );
}

export function PresetForm({
  kategoriList,
  prioritasList,
}: {
  kategoriList: Kategori[];
  prioritasList: Prioritas[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [kategoriId, setKategoriId] = useState("");
  const [prioritasId, setPrioritasId] = useState("");
  const [jam, setJam] = useState("");
  const [hari, setHari] = useState<number[]>([]);

  function toggleHari(day: number) {
    setHari((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createPreset(formData);
        formRef.current?.reset();
        setKategoriId("");
        setPrioritasId("");
        setJam("");
        setHari([]);
      }}
      className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm transition-shadow focus-within:border-violet-800/60 sm:grid-cols-6"
    >
      <input
        name="aktivitas"
        required
        placeholder="Aktivitas rutinnya apa?"
        className={`${inputClass} sm:col-span-4`}
      />
      <div className="sm:col-span-2">
        <input type="hidden" name="jam" value={jam} />
        <TimePicker value={jam} onChange={setJam} />
      </div>

      <input
        name="catatan"
        placeholder="Catatan (opsional)"
        className={`${inputClass} sm:col-span-6`}
      />

      <div className="sm:col-span-6">
        <input type="hidden" name="kategori_id" value={kategoriId} />
        <CategoryPicker
          options={kategoriList}
          value={kategoriId}
          onChange={setKategoriId}
          placeholder="Kategori..."
        />
      </div>
      <div className="sm:col-span-6">
        <input type="hidden" name="prioritas_id" value={prioritasId} />
        <PrioritySlider
          options={prioritasList}
          value={prioritasId}
          onChange={setPrioritasId}
        />
      </div>

      <div className="sm:col-span-6">
        <p className="mb-1.5 text-xs text-zinc-500">
          Ulangi tiap hari
          {hari.length > 0 ? (
            <>
              : <span className="font-medium text-violet-300">{describeHari(hari)}</span>
            </>
          ) : (
            ":"
          )}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {HARI_PENDEK.map((label, day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleHari(day)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                hari.includes(day)
                  ? "border-violet-500 bg-violet-500/20 text-violet-200"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {label}
            </button>
          ))}
          {hari.map((d) => (
            <input key={d} type="hidden" name="hari" value={d} />
          ))}
        </div>
      </div>

      <div className="sm:col-span-6">
        <SubmitButton />
      </div>
    </form>
  );
}
