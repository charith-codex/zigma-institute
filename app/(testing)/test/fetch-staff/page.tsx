// fetch from sub table data using user + server action

import { auth } from "@/auth";
import { fetchStaffContact } from "./fetch.action";

export default async function page() {
  const session = await auth();

  const userId = session?.user?.id || "";
  const staff = await fetchStaffContact(userId);

  console.log(staff);

  return <div>{JSON.stringify(staff)}</div>;
}
