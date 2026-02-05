"use client";

import {
  ColumnDef,
  SortingState,
  ColumnOrderState,
  ColumnSizingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { GripVertical, Columns3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowSelectionChange?: (selectedRows: Record<string, boolean>) => void;
  headerActions?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  headerActions,
}: DataTableProps<TData, TValue>) {
  const STORAGE_KEY_ORDER = 'dataTable_columnOrder';
  const STORAGE_KEY_SIZING = 'dataTable_columnSizing';
  const STORAGE_KEY_VISIBILITY = 'dataTable_columnVisibility';

  // Load saved state from localStorage
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_VISIBILITY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  });
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_ORDER);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_SIZING);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  });

  // Save to localStorage whenever column order, sizing, or visibility changes
  useEffect(() => {
    if (typeof window !== 'undefined' && columnOrder.length > 0) {
      localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(columnOrder));
    }
  }, [columnOrder]);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(columnSizing).length > 0) {
      localStorage.setItem(STORAGE_KEY_SIZING, JSON.stringify(columnSizing));
    }
  }, [columnSizing]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_VISIBILITY, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnOrder,
      columnSizing,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    enableRowSelection: true,
  });

  // Notify parent of selection changes
  useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(rowSelection);
    }
  }, [rowSelection, onRowSelectionChange]);

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      return;
    }

    const currentOrder = table.getState().columnOrder;
    const allColumns = table.getAllLeafColumns().map(col => col.id);
    const orderToUse = currentOrder.length > 0 ? currentOrder : allColumns;

    const draggedIndex = orderToUse.indexOf(draggedColumn);
    const targetIndex = orderToUse.indexOf(targetColumnId);

    const newOrder = [...orderToUse];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  return (
    <div>
      {/* Column Visibility Controls */}
      <div className="flex items-center justify-end gap-2 py-4">
        {headerActions}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Columns3 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="rounded-md border overflow-x-auto">
        <Table style={{ width: table.getTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        position: 'relative',
                      }}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(header.id)}
                    >
                      <div className="flex items-center gap-2">
                        {!header.isPlaceholder && (
                          <div
                            draggable={true}
                            onDragStart={() => handleDragStart(header.id)}
                            className="cursor-move"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </div>
                      {/* Resize handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            header.getResizeHandler()(e);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            header.getResizeHandler()(e);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          draggable={false}
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-gray-300 opacity-0 hover:opacity-100 ${header.column.getIsResizing() ? 'opacity-100 bg-blue-500' : ''
                            }`}
                          style={{
                            transform: header.column.getIsResizing()
                              ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)`
                              : '',
                          }}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setColumnOrder([]);
            setColumnSizing({});
            localStorage.removeItem(STORAGE_KEY_ORDER);
            localStorage.removeItem(STORAGE_KEY_SIZING);
          }}
          className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-xs sm:text-sm w-full sm:w-auto"
        >
          Reset Columns
        </Button>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:bg-gray-50 disabled:text-gray-400 text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:bg-gray-50 disabled:text-gray-400 text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
