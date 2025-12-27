import { auth } from "@/auth";
import { DashboardContent } from "@/components/eims/DashboardContent";

const Dashboard = async () => {
  const session = await auth();
  return <DashboardContent session={session} />;
};

export default Dashboard;
