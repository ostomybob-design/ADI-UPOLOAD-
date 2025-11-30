"use client";

import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface ColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function ColumnHeader<TData, TValue>({
  column,
  title,
}: ColumnHeaderProps<TData, TValue>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-4"
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
