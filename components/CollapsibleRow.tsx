"use client";

import type { ReactNode } from "react";

// Trik grid-template-rows 1fr/0fr: satu-satunya cara CSS murni buat animasi
// height:auto secara smooth, sekaligus otomatis bikin item lain di
// list "mengisi" ruang yang kosong secara halus (bukan cuma fade doang).
export function CollapsibleRow({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
      style={{ gridTemplateRows: collapsed ? "0fr" : "1fr" }}
    >
      <div
        className={`overflow-hidden transition-opacity duration-200 ${
          collapsed ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="pb-3">{children}</div>
      </div>
    </div>
  );
}
