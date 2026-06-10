"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function ResetarSenha() {
  const supabase = createClient();
  const router = useRouter();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function alterarSenha() {
    if (!senha || !confirmarSenha) {
      alert("Preencha os dois campos.");
      return;
    }

    if (senha.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não conferem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: senha,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Senha alterada com sucesso!");
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-gray-900">
          Redefinir senha
        </h1>

        <p className="mt-2 text-gray-600">
          Digite sua nova senha para acessar o bolão.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nova senha"
            className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 placeholder-gray-500 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar nova senha"
            className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 placeholder-gray-500 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />

          <button
            onClick={alterarSenha}
            disabled={loading}
            className="rounded-lg bg-green-600 p-3 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      </div>
    </main>
  );
}