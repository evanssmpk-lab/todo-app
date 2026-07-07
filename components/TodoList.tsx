"use client";

import { useState, useTransition } from "react";
import { deleteTodo } from "@/app/actions/todos";
import { CollapsibleRow } from "@/components/CollapsibleRow";
import { TodoItem } from "@/components/TodoItem";
import type { Kategori, Prioritas, Todo } from "@/lib/types";

export function TodoList({
  todos,
  kategoriList,
  prioritasList,
}: {
  todos: Todo[];
  kategoriList: Kategori[];
  prioritasList: Prioritas[];
}) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const completedCount = todos.filter((t) => t.status === "selesai").length;

  function handleDelete(id: string) {
    setExitingIds((prev) => new Set(prev).add(id));
    // Kasih waktu animasi collapse (lihat CollapsibleRow) selesai dulu,
    // baru benar-benar hapus dari database.
    setTimeout(() => {
      startTransition(() => deleteTodo(id));
    }, 280);
  }

  return (
    <div>
      {completedCount > 0 && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setHideCompleted((h) => !h)}
            className="text-xs text-zinc-500 transition-colors hover:text-violet-400"
          >
            {hideCompleted
              ? `Tampilkan yang selesai (${completedCount})`
              : `Sembunyikan yang selesai (${completedCount})`}
          </button>
        </div>
      )}

      <div className="flex flex-col">
        {todos.map((todo) => {
          const collapsed =
            exitingIds.has(todo.id) ||
            (hideCompleted && todo.status === "selesai");
          return (
            <CollapsibleRow key={todo.id} collapsed={collapsed}>
              <TodoItem
                todo={todo}
                kategoriList={kategoriList}
                prioritasList={prioritasList}
                onDelete={handleDelete}
              />
            </CollapsibleRow>
          );
        })}
      </div>
    </div>
  );
}
