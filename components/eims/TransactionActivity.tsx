"use client";

import { useEffect, useState } from "react";
import { Search, ArrowLeft, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "./manage-users/Pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { listFeeTransactions, type FeeRecord } from "@/lib/actions/fees";

interface TransactionActivityProps {
  onClose: () => void;
}

export function TransactionActivity({ onClose }: TransactionActivityProps) {
  const [transactions, setTransactions] = useState<FeeRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const pageSize = 50;

  const fetchTransactions = async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const result = await listFeeTransactions({
        page,
        pageSize,
        searchTerm: search,
      });
      setTransactions(result.data);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    void fetchTransactions(1, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchTransactions(currentPage, debouncedSearch);
  }, [currentPage]);

  const formatCurrency = (cents: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(cents / 100);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-2xl font-black text-foreground">
            Transaction History
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            View and manage all payment transactions across the institute.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={onClose}
          className="rounded-lg px-4 text-xs font-bold gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Summary
        </Button>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              All Activities ({totalCount})
            </CardTitle>
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, course, or transaction ID..."
                className="pl-9 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-none border-x-0 border-t">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="font-bold py-4 px-6 text-[11px] uppercase tracking-wider">
                    Student
                  </TableHead>
                  <TableHead className="font-bold py-4 px-6 text-[11px] uppercase tracking-wider text-center">
                    Course / Item
                  </TableHead>
                  <TableHead className="font-bold py-4 px-6 text-[11px] uppercase tracking-wider text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-bold py-4 px-6 text-[11px] uppercase tracking-wider">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground animate-pulse font-medium"
                    >
                      Fetching transactions...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground italic"
                    >
                      No transactions matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="group hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm group-hover:text-primary transition-colors">
                            {transaction.studentName}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {format(
                              new Date(transaction.paidAt),
                              "MMM d, yyyy • h:mm a"
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="inline-flex flex-col">
                          <span className="text-xs font-bold text-foreground">
                            {transaction.courseName}
                          </span>
                          {transaction.paidMonth && transaction.paidYear && (
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              Installment:{" "}
                              {format(
                                new Date(
                                  transaction.paidYear,
                                  transaction.paidMonth - 1
                                ),
                                "MMMM yyyy"
                              )}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-green-700">
                          Success
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6 font-bold text-sm text-primary">
                        {formatCurrency(
                          transaction.amountInCents,
                          transaction.currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="bg-muted/30">
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
