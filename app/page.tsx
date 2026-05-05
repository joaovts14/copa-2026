"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function Home() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function cadastrar() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("cadastro:", data);
    console.log("erro:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Cadastro realizado! Verifique seu e-mail, se necessário.");
  }

  async function entrar() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("login:", data);
    console.log("erro:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login realizado com sucesso!");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Bolão da Copa</h1>
        <p className="mt-2 text-gray-600">
          Entre ou crie sua conta para adicionar seus palpites.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            placeholder="Seu e-mail"
            className="rounded border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            className="rounded border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={entrar}
            className="rounded bg-blue-600 p-3 font-semibold text-white"
          >
            Entrar
          </button>

          <button
            onClick={cadastrar}
            className="rounded border border-blue-600 p-3 font-semibold text-blue-600"
          >
            Criar conta
          </button>
        </div>
      </div>
    </main>
  );
}