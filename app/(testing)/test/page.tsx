import { auth } from "@/auth";
import ClientComponent from "./client-comp";
import { CourseCreateForm } from "@/components/cms/CourseCreateForm";
import SendInvoiceButton from "@/email/SendInvoiceButton";

export default async function Demo() {
  const session = await auth();
  // console.log(session?.user);

  return (
    <div>
      <h1>test</h1>
      <ClientComponent />
      <p>{session?.user?.email}</p>

      {/* send email */}
      <SendInvoiceButton email="pvmcw7@gmail.com" orderId="256" /> 

      <CourseCreateForm />
    </div>
  );
}
