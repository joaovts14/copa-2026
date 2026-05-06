"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="mb-6 rounded-2xl bg-white/95 px-6 py-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-xl font-black text-green-700">
          Bolão Copa 2026
        </Link>

        <div className="flex items-center gap-3 text-sm font-bold">
          <Link href="/" className="text-gray-700 hover:text-green-700">
            Início
          </Link>

          <Link href="/jogos" className="text-gray-700 hover:text-green-700">
            Jogos
          </Link>

          <Link href="/ranking" className="text-gray-700 hover:text-green-700">
            Ranking
          </Link>

          <button
            onClick={sair}
            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}