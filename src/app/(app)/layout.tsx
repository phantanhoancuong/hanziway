import { Header, UpdatePanel } from "@/components/client";
import { Footer } from "@/components/server";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <main className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {children}
        <UpdatePanel />
      </main>
      <Footer />
    </div>
  );
}
