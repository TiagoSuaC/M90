"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

interface SortableHeaderProps {
  column: string;
  label: string;
  className?: string;
}

export function SortableHeader({ column, label, className }: SortableHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sortBy");
  const currentOrder = searchParams.get("sortOrder");
  const isActive = currentSort === column;

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());

    if (!isActive) {
      params.set("sortBy", column);
      params.set("sortOrder", "asc");
    } else if (currentOrder === "asc") {
      params.set("sortBy", column);
      params.set("sortOrder", "desc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1 hover:text-foreground transition-colors -ml-1 px-1 py-0.5 rounded"
      >
        {label}
        {isActive && currentOrder === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : isActive && currentOrder === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}
