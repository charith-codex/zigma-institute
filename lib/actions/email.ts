"use server";

import { sendPaymentInvoice } from "@/email";

export async function sendInvoiceAction(formData: FormData) {
  const email = formData.get("email") as string;
  const orderId = formData.get("orderId") as string;

  await sendPaymentInvoice(email, orderId);
}
