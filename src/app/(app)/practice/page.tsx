import Link from "next/link";

export default function PracticePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-20 items-center justify-between px-6">
        <Link href="/" className="cursor-pointer">
          <div className="flex flex-col">
            <span className="text-accent text-3xl font-bold tracking-tight">
              hanziway
            </span>
            <span className="text-accent text-sm">漢字道</span>
          </div>
        </Link>
      </header>
    </div>
  );
}
