"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function Home() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function verificarSessao() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        router.push("/jogos");
        return;
      }

      setCheckingSession(false);
    }

    verificarSessao();
  }, []);

  async function entrar() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/jogos");
  }

  async function cadastrar() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/jogos");
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
        <div className="rounded-2xl bg-white p-8 font-bold shadow-xl">
          Verificando sessão...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-gray-900">
          Bolão da Copa 2026
        </h1>

        <p className="mt-2 text-gray-600">
          Faça login ou crie sua conta para começar.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Seu e-mail"
            className="rounded-lg border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            className="rounded-lg border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={entrar}
            disabled={loading}
            className="rounded-lg bg-green-600 p-3 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <button
            onClick={cadastrar}
            disabled={loading}
            className="rounded-lg border border-green-600 p-3 font-bold text-green-600 hover:bg-green-50 disabled:border-gray-400 disabled:text-gray-400"
          >
            Criar conta
          </button>
        </div>
      </div>
    </main>
  );
}