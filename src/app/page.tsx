"use client";

import { CharacterWriter } from "@/app/components/clients";

import { useState } from "react";

import Link from "next/link";

export default function Home() {
  const [character, setCharacter] = useState<string>("");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between h-20 px-6">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <div className="flex flex-col">
            <span className="text-3xl font-bold tracking-tight text-red-500">
              hanziway
            </span>
            <span className="text-m font-bold tracking-tight text-red-500">
              漢字道
            </span>
          </div>
        </Link>
      </header>

      <main className="flex flex-col flex-1 gap-6 p-6 overflow-hidden">
        <div className="self-center justify-self-center flex-col">
          <input
            className="flex-1 bg-white text-black"
            type="text"
            value={character}
            onChange={(e) => {
              setCharacter(e.target.value);
            }}
          />

          <div className="flex flex-1 flex-col ">
            {[...character].map((char, index) => (
              <div key={index} className="flex-1 self-center">
                <CharacterWriter character={char} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
