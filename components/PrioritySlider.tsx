"use client";

import { useRef, useState } from "react";
import { createPrioritas } from "@/app/actions/todos";
import { priorityColor } from "@/lib/priorityColor";
import type { Prioritas } from "@/lib/types";

export function PrioritySlider({
  options,
  value,
  onChange,
}: {
  options: Prioritas[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, setPending] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState<number | null>(null);

  const sorted = [...options].sort((a, b) => a.urutan - b.urutan);

  async function submitNew() {
    const nama = newName.trim();
    if (!nama) {
      setAdding(false);
      return;
    }
    setPending(true);
    const created = await createPrioritas(nama);
    setPending(false);
    setNewName("");
    setAdding(false);
    onChange(created.id);
  }

  if (adding) {
    return (
      <input
        autoFocus
        value={newName}
        disabled={pending}
        placeholder="Nama prioritas baru..."
        onChange={(e) => setNewName(e.target.value)}
        onBlur={submitNew}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitNew();
          }
          if (e.key === "Escape") {
            setAdding(false);
            setNewName("");
          }
        }}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-50 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
      />
    );
  }

  if (sorted.length === 0) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="w-full rounded-lg border border-dashed border-zinc-700 px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:border-violet-500 hover:text-violet-400"
      >
        + Tambah prioritas
      </button>
    );
  }

  const selectedIndex = sorted.findIndex((o) => o.id === value);
  const hasValue = selectedIndex !== -1;
  const activeIndex = hasValue ? selectedIndex : 0;
  const maxIndex = Math.max(sorted.length - 1, 1);
  const committedPercent = (activeIndex / maxIndex) * 100;
  const percent = dragPercent ?? committedPercent;

  const nearestIndexForPercent = (p: number) =>
    Math.min(maxIndex, Math.max(0, Math.round((p / 100) * maxIndex)));

  const previewIndex = nearestIndexForPercent(percent);
  const previewOption = sorted[previewIndex];
  const accent = priorityColor(previewOption.urutan);

  function percentFromClientX(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(100, Math.max(0, raw));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setDragPercent(percentFromClientX(e.clientX));
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragPercent(percentFromClientX(e.clientX));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const finalPercent = percentFromClientX(e.clientX);
    const idx = nearestIndexForPercent(finalPercent);
    setDragging(false);
    setDragPercent(null);
    if (idx !== activeIndex) onChange(sorted[idx].id);
  }

  function moveByStep(delta: number) {
    const idx = Math.min(maxIndex, Math.max(0, activeIndex + delta));
    if (idx !== activeIndex) onChange(sorted[idx].id);
  }

  const gradient = `linear-gradient(to right, ${sorted
    .map(
      (o, i) => `${priorityColor(o.urutan).border} ${(i / maxIndex) * 100}%`
    )
    .join(", ")})`;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span
          style={{ color: hasValue || dragging ? accent.text : undefined }}
          className={
            !hasValue && !dragging ? "text-zinc-500" : "font-medium"
          }
        >
          {hasValue || dragging
            ? previewOption.nama
            : "Geser untuk pilih prioritas"}
        </span>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-zinc-500 transition-colors hover:text-violet-400"
        >
          + baru
        </button>
      </div>

      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative h-2 w-full cursor-pointer touch-none rounded-full ${
          !hasValue && !dragging ? "opacity-60" : ""
        }`}
        style={{ background: gradient }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={maxIndex}
          aria-valuenow={activeIndex}
          aria-valuetext={sorted[activeIndex]?.nama}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") moveByStep(-1);
            if (e.key === "ArrowRight") moveByStep(1);
          }}
          style={{
            left: `${percent}%`,
            ["--thumb" as string]: accent.border,
            transition: dragging
              ? "none"
              : "left 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className="fancy-thumb absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
        <span>{sorted[0].nama}</span>
        <span>{sorted[sorted.length - 1].nama}</span>
      </div>
    </div>
  );
}
