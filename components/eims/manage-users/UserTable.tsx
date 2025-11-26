"use client";

import { Children } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface UserTableProps {
  headers: string[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage: string;
  children: React.ReactNode;
}

export function UserTable({ headers, isLoading, error, emptyMessage, children }: UserTableProps) {
  const rowCount = Children.count(children);
  const hasRows = !isLoading && !error && rowCount > 0;

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell colSpan={headers.length}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && error && (
            <TableRow>
              <TableCell colSpan={headers.length} className="text-destructive">
                {error}
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !error && hasRows && children}

          {!isLoading && !error && !hasRows && (
            <TableRow>
              <TableCell colSpan={headers.length} className="text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
