"use client";

import { KATEGORI_WARNA_PALETTE } from "@/lib/colorPalette";

export function ColorSwatchPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {KATEGORI_WARNA_PALETTE.map((hex) => (
        <button
          key={hex}
          type="button"
          onClick={() => onChange(hex)}
          aria-label={hex}
          style={{ background: hex }}
          className={`size-7 shrink-0 rounded-full transition-transform hover:scale-110 ${
            value.toLowerCase() === hex.toLowerCase()
              ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
              : ""
          }`}
        />
      ))}
    </div>
  );
}
