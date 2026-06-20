import { Header } from "@/components/clients";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
      <footer className="border-border text-foreground/40 flex shrink-0 justify-center border-t px-6 py-1 text-xs">
        v{process.env.NEXT_PUBLIC_APP_VERSION}
      </footer>
    </div>
  );
}
