import { Header } from "@/components/clients";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
