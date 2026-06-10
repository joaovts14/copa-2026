"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const ADMIN_EMAIL = "joaovitortobias@hotmail.com";

  useEffect(() => {
    async function carregarUsuario() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (user) {
        const nomeUsuario = (user.user_metadata as any)?.nome || user.email;

        setNome(nomeUsuario ?? null);
        setEmail(user.email ?? null);
      }
    }

    carregarUsuario();
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="mb-6 rounded-2xl bg-white/95 p-4 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link
          href="/jogos"
          className="text-center text-lg font-black text-green-700 md:text-left"
        >
          Bolão Copa do Mundo 2026
        </Link>

        <div className="flex items-center justify-center gap-2">
          {nome && (
            <span className="rounded-full bg-green-100 px-3 py-2 text-sm font-bold text-green-800 shadow-sm">
              👋 Olá, {nome.split(" ")[0]}
            </span>
          )}

          <button
            onClick={sair}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t border-gray-200 pt-4 text-sm font-bold">
        <Link
          href="/jogos"
          className="rounded-xl px-4 py-2 text-gray-700 hover:bg-green-100 hover:text-green-800"
        >
          Jogos
        </Link>

        <Link
          href="/ranking"
          className="rounded-xl px-4 py-2 text-gray-700 hover:bg-green-100 hover:text-green-800"
        >
          Ranking
        </Link>

        {email === ADMIN_EMAIL && (
          <Link
            href="/admin"
            className="rounded-xl px-4 py-2 text-gray-700 hover:bg-green-100 hover:text-green-800"
          >
            Admin
          </Link>
        )}
        <Link
  href="/regras"
  className="rounded-xl px-4 py-2 text-gray-700 hover:bg-green-100 hover:text-green-800"
>
  Regras
</Link>
<Link
  href="/palpites"
  className="rounded-xl px-4 py-2 text-gray-700 hover:bg-green-100 hover:text-green-800"
>
  Palpites
</Link>
      </div>
    </nav>
  );
}