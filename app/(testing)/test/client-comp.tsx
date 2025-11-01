"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const ClientComponent = () => {
  const { data: session } = useSession();

  // console.log(session?.user);
  return (
    <div>
      <Button onClick={() => toast.success("Saved!")}>Show toast</Button>
      <p>{session?.user?.name}</p>
      <p>{session?.user?.role}</p>
    </div>
  );
};

export default ClientComponent;
