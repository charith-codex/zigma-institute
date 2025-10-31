"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type CoursePurchaseButtonProps = {
  courseId: string;
  className?: string;
};

export function CoursePurchaseButton({
  courseId,
  className,
}: CoursePurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to start checkout");
      }

      const { url } = (await response.json()) as { url?: string };
      if (!url) {
        throw new Error("Stripe session URL was not returned");
      }

      window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Unable to start checkout"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handlePurchase}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting...
        </>
      ) : (
        "Purchase course"
      )}
    </Button>
  );
}
