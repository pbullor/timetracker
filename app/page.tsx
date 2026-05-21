import { auth } from "@/lib/auth-config";
import { Landing } from "@/components/landing";
import { Dashboard } from "@/components/dashboard";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    return <Landing />;
  }

  return <Dashboard />;
}
