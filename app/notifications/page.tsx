import { Navbar } from "@/components/layout/navbar";
import { NotificationsView } from "@/components/notifications/notifications-view";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen pb-10">
      <Navbar />
      <NotificationsView />
    </main>
  );
}
