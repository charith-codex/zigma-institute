import { auth } from "@/auth";
import ClientComponent from "./client-comp";

export default async function Demo() {
  const session = await auth();
  // console.log(session?.user);

  return (
    <div>
      <h1>test</h1>
      <ClientComponent />
      <p>{session?.user?.email}</p>
      {session?.user?.role === "ADMIN" ? (
        <p>Welcome, Admin!</p>
      ) : (
        <p>Welcome!</p>
      )}
    </div>
  );
}
