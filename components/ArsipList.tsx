"use client";

import { useState, useTransition } from "react";
import { deleteTodo } from "@/app/actions/todos";
import { CollapsibleRow } from "@/components/CollapsibleRow";
import { TodoItem } from "@/components/TodoItem";
import type { Kategori, Prioritas, Todo } from "@/lib/types";

function formatTanggalPanjang(tanggal: string) {
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupByTanggal(todos: Todo[]) {
  const groups = new Map<string, Todo[]>();
  for (const todo of todos) {
    const arr = groups.get(todo.tanggal) ?? [];
    arr.push(todo);
    groups.set(todo.tanggal, arr);
  }
  return Array.from(groups.entries());
}

export function ArsipList({
  todos,
  kategoriList,
  prioritasList,
}: {
  todos: Todo[];
  kategoriList: Kategori[];
  prioritasList: Prioritas[];
}) {
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    setExitingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      startTransition(() => deleteTodo(id));
    }, 280);
  }

  const groups = groupByTanggal(todos);

  return (
    <div className="flex flex-col gap-8">
      {groups.map(([tanggal, items]) => (
        <div key={tanggal}>
          <h3 className="mb-3 text-sm font-medium text-zinc-400">
            {formatTanggalPanjang(tanggal)}
            <span className="ml-2 text-zinc-600">
              ({items.length} {items.length === 1 ? "tugas" : "tugas"})
            </span>
          </h3>
          <div className="flex flex-col">
            {items.map((todo) => (
              <CollapsibleRow key={todo.id} collapsed={exitingIds.has(todo.id)}>
                <TodoItem
                  todo={todo}
                  kategoriList={kategoriList}
                  prioritasList={prioritasList}
                  showToggle={false}
                  onDelete={handleDelete}
                />
              </CollapsibleRow>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
