"use client";

import { Button } from "@/components/ui/button";
import { sendInvoiceAction } from "@/lib/actions/email";
import { useTransition } from "react";

export default function SendInvoiceButton({
  email,
  orderId,
}: {
  email: string;
  orderId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => sendInvoiceAction(formData))}
    >
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="orderId" value={orderId} />
      <Button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 disabled:opacity-50"
      >
        {isPending ? "Sending..." : "Send Invoice Email"}
      </Button>
    </form>
  );
}
