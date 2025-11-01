import { auth } from "@/auth";
import { AdminDashboardClient } from "./AdminDashboardClient";

const Dashboard = async () => {
  const session = await auth();
  return <AdminDashboardClient session={session} />;
};

export default Dashboard;
