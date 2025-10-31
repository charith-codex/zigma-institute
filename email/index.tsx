import React from "react";
import { Resend } from "resend";
import { SENDER_EMAIL, APP_NAME } from "@/lib/constants";
import PaymentInvoice from "./payment-invoice";
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY as string);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendPaymentInvoice = async (email: string, orderId: string) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: `Order Confirmation ${orderId}`,
    react: <PaymentInvoice orderId={orderId} />,
  });
};
