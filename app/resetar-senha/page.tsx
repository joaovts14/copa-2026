"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function ResetarSenha() {
  const supabase = createClient();
  const router = useRouter();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [sessaoOk, setSessaoOk] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessaoOk(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessaoOk(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function alterarSenha() {
    if (!sessaoOk) {
      alert("Sessão de recuperação inválida ou expirada. Solicite um novo link.");
      router.push("/");
      return;
    }

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
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-gray-900">Redefinir senha</h1>

        {!sessaoOk && (
          <p className="mt-4 rounded-xl bg-yellow-100 p-3 text-sm font-bold text-yellow-800">
            Abra esta página pelo link recebido no e-mail de recuperação.
          </p>
        )}

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