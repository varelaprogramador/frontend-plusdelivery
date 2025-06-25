"use client"

import type React from "react"
import { memo, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useVirtualization } from "@/hooks/use-virtualization"

interface Column {
  key: string
  header: string
  width?: string
  render?: (value: any, item: any) => React.ReactNode
}

interface VirtualizedTableProps {
  data: any[]
  columns: Column[]
  itemHeight?: number
  containerHeight?: number
  onRowClick?: (item: any) => void
  className?: string
}

const VirtualizedRow = memo(
  ({
    item,
    columns,
    onRowClick,
    style,
  }: {
    item: any
    columns: Column[]
    onRowClick?: (item: any) => void
    style: React.CSSProperties
  }) => (
    <TableRow
      className="border-zinc-800 hover:bg-zinc-900 cursor-pointer"
      onClick={() => onRowClick?.(item)}
      style={style}
    >
      {columns.map((column) => (
        <TableCell key={column.key} style={{ width: column.width }}>
          {column.render ? column.render(item[column.key], item) : item[column.key]}
        </TableCell>
      ))}
    </TableRow>
  ),
)

VirtualizedRow.displayName = "VirtualizedRow"

export const VirtualizedTable = memo(
  ({ data, columns, itemHeight = 60, containerHeight = 400, onRowClick, className }: VirtualizedTableProps) => {
    const { visibleItems, totalHeight, handleScroll, offsetY } = useVirtualization({
      items: data,
      itemHeight,
      containerHeight,
    })

    const memoizedColumns = useMemo(() => columns, [columns])

    return (
      <div className={`rounded-md border border-zinc-800 ${className}`}>
        <Table>
          <TableHeader className="bg-zinc-900 sticky top-0 z-10">
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              {memoizedColumns.map((column, idx) => (
                <TableHead key={`${column.key}-${idx}`} className="text-zinc-400" style={{ width: column.width }}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>

        <div className="overflow-auto" style={{ height: containerHeight }} onScroll={handleScroll}>
          <div style={{ height: totalHeight, position: "relative" }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              <Table>
                <TableBody>
                  {visibleItems.map((item, idx) => (
                    <VirtualizedRow
                      key={(`${item.id}-${idx}`) || item.index}
                      item={item}
                      columns={memoizedColumns}
                      onRowClick={onRowClick}
                      style={{ height: itemHeight }}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

VirtualizedTable.displayName = "VirtualizedTable"
