import { Navbar } from "@/components/layout/navbar";
import { SettingsView } from "@/components/settings/settings-view";

export default function SettingsPage() {
  return (
    <main className="min-h-screen pb-10">
      <Navbar />
      <SettingsView />
    </main>
  );
}
