import { auth } from "@/lib/auth-config";
import { Landing } from "@/components/landing";
import { Dashboard } from "@/components/dashboard";

export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Auth not configured yet — show landing
  }

  if (!session?.user) {
    return <Landing />;
  }

  return <Dashboard />;
}
