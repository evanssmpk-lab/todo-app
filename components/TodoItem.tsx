"use client";

import { useTransition } from "react";
import { deleteTodo, updateTodoField } from "@/app/actions/todos";
import { CategoryPicker } from "@/components/CategoryPicker";
import { PrioritySlider } from "@/components/PrioritySlider";
import { priorityColor } from "@/lib/priorityColor";
import type { Kategori, Prioritas, Todo } from "@/lib/types";

const STATUS_BADGE: Record<Todo["status"], string> = {
  belum_selesai: "bg-zinc-800 text-zinc-300",
  selesai: "bg-emerald-900/50 text-emerald-300",
  terlewat: "bg-red-900/50 text-red-300",
};

function formatTanggal(tanggal: string) {
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TodoItem({
  todo,
  kategoriList,
  prioritasList,
  showToggle = true,
}: {
  todo: Todo;
  kategoriList: Kategori[];
  prioritasList: Prioritas[];
  showToggle?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const isDone = todo.status === "selesai";
  const accent = todo.prioritas ? priorityColor(todo.prioritas.urutan) : null;

  return (
    <div
      style={{ borderLeftColor: accent?.border ?? "#3f3f46" }}
      className={`animate-rise-in group relative overflow-hidden rounded-2xl border border-zinc-800 border-l-4 bg-zinc-900/60 p-4 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/30 ${
        pending ? "opacity-50" : ""
      }`}
    >
      {accent && (
        <div
          style={{ background: accent.glow }}
          className="pointer-events-none absolute -top-10 -left-10 size-32 rounded-full blur-2xl"
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {showToggle && (
            <button
              type="button"
              disabled={pending}
              aria-label="Tandai selesai"
              onClick={() =>
                startTransition(() =>
                  updateTodoField(todo.id, {
                    status: isDone ? "belum_selesai" : "selesai",
                  })
                )
              }
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isDone
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-zinc-600 hover:border-emerald-500"
              }`}
            >
              {isDone && (
                <svg
                  viewBox="0 0 24 24"
                  className="animate-pop-check size-3 text-zinc-950"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={4}
                >
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}
          <div>
            <p
              className={`font-medium transition-colors ${
                isDone ? "text-zinc-500 line-through" : "text-zinc-50"
              }`}
            >
              {todo.aktivitas}
            </p>
            <p className="text-xs text-zinc-500">
              {formatTanggal(todo.tanggal)}
              {todo.jam ? ` · ${todo.jam.slice(0, 5)}` : ""}
            </p>
            {todo.catatan && (
              <p className="mt-1 text-sm text-zinc-400">{todo.catatan}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[todo.status]}`}
          >
            {todo.status.replace("_", " ")}
          </span>
          <button
            onClick={() => startTransition(() => deleteTodo(todo.id))}
            disabled={pending}
            className="text-xs text-zinc-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
          >
            Hapus
          </button>
        </div>
      </div>

      {todo.kategori && (
        <div className="relative mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
          <span
            className="size-2 rounded-full"
            style={{ background: todo.kategori.warna ?? "#71717a" }}
          />
          {todo.kategori.nama}
          {todo.prioritas && (
            <span style={{ color: accent?.text }} className="ml-2 font-medium">
              ● {todo.prioritas.nama}
            </span>
          )}
        </div>
      )}

      <div className="relative mt-3 flex flex-col gap-3">
        <CategoryPicker
          options={kategoriList}
          value={todo.kategori_id ?? ""}
          onChange={(id) =>
            startTransition(() => updateTodoField(todo.id, { kategori_id: id }))
          }
          placeholder="Kategori..."
        />
        <PrioritySlider
          options={prioritasList}
          value={todo.prioritas_id ?? ""}
          onChange={(id) =>
            startTransition(() =>
              updateTodoField(todo.id, { prioritas_id: id })
            )
          }
        />
      </div>
    </div>
  );
}
