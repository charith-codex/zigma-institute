"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  isLoading,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalCount === 0 || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t border-muted">
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(currentPage * pageSize, totalCount)}
        </span>{" "}
        of <span className="font-medium">{totalCount}</span> results
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>
        <div className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>
      </div>
    </div>
  );
}
