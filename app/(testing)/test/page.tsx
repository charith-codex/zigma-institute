import { auth } from "@/auth";
import ClientComponent from "./client-comp";
import { CourseCreateForm } from "@/components/eims/CourseCreateForm";
import SendInvoiceButton from "@/email/SendInvoiceButton";
import Link from "next/link";

export default async function Demo() {
  const session = await auth();
  // console.log(session);

  return (
    <div>
      <h1>test</h1>
      <ClientComponent />
      <p>{session?.user?.email}</p>

      {/* send email */}
      <SendInvoiceButton email="pvmcw7@gmail.com" orderId="256" />

      {/* payment */}
      <Link href="/lms/courses">Go to Course Payment</Link>

      <CourseCreateForm />
    </div>
  );
}
