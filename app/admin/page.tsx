"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";

type Team = {
  id: number;
  name: string;
  flag_url: string | null;
};

type Match = {
  id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  round: number;
};

type Resultado = {
  home: string;
  away: string;
};

export default function Admin() {
  const supabase = createClient();
  const [statusRodadas, setStatusRodadas] = useState<any[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [resultados, setResultados] = useState<Record<number, Resultado>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const ADMIN_EMAIL = "joaovitortobias@hotmail.com";
  const [autorizado, setAutorizado] = useState(false);
useEffect(() => {
  async function verificarAdmin() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user || user.email !== ADMIN_EMAIL) {
      router.push("/jogos");
      return;
    }

    setAutorizado(true);
    carregarDados();
  }

  verificarAdmin();
}, []);

  async function carregarDados() {
    setLoading(true);
    const { data: statusData } = await supabase
  .from("admin_rodadas_status")
  .select("*")
  .order("round");

setStatusRodadas(statusData || []);

    const { data: teamsData } = await supabase.from("teams").select("*").order("name");

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("match_date");

    setTeams(teamsData || []);
    setMatches(matchesData || []);

    const mapa: Record<number, Resultado> = {};

    matchesData?.forEach((m) => {
      mapa[m.id] = {
        home: m.home_score !== null ? String(m.home_score) : "",
        away: m.away_score !== null ? String(m.away_score) : "",
      };
    });

    setResultados(mapa);
    setLoading(false);
  }

  function getTeam(id: number) {
    return teams.find((team) => team.id === id);
  }

  function alterarResultado(
    matchId: number,
    campo: "home" | "away",
    valor: string
  ) {
    setResultados((atual) => ({
      ...atual,
      [matchId]: {
        home: atual[matchId]?.home || "",
        away: atual[matchId]?.away || "",
        [campo]: valor,
      },
    }));
  }

  async function salvarResultado(matchId: number) {
    const resultado = resultados[matchId];

    if (!resultado || resultado.home === "" || resultado.away === "") {
      alert("Preencha os dois placares.");
      return;
    }

    const { error } = await supabase
      .from("matches")
      .update({
        home_score: Number(resultado.home),
        away_score: Number(resultado.away),
        status: "finished",
      })
      .eq("id", matchId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Resultado salvo!");
    carregarDados();
  }

  async function limparResultado(matchId: number) {
    const { error } = await supabase
      .from("matches")
      .update({
        home_score: null,
        away_score: null,
        status: "pending",
      })
      .eq("id", matchId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Resultado removido!");
    carregarDados();
  }

  if (!autorizado) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="rounded-2xl bg-white p-6 font-bold text-gray-900 shadow-xl">
        Verificando permissão...
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="mx-auto max-w-5xl">
        <Navbar />

        <header className="mb-6 rounded-2xl bg-white p-6 shadow-xl">
          <h1 className="text-3xl font-black text-gray-900">
            Admin - Resultados
          </h1>
          <p className="mt-2 text-gray-600">
            Preencha o placar real dos jogos para atualizar o ranking.
          </p>
        </header>
<section className="mb-6 rounded-2xl bg-white p-6 shadow-xl">
  <h2 className="text-2xl font-black text-gray-900">
    Status de preenchimento
  </h2>

  <p className="mt-1 text-gray-600">
    Veja quantas pessoas ainda faltam preencher cada rodada.
  </p>

  <div className="mt-5 grid gap-4 md:grid-cols-3">
    {statusRodadas.map((r) => (
      <div
        key={`${r.stage}-${r.round}`}
        className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
      >
        <h3 className="text-lg font-black text-gray-900">
          Rodada {r.round}
        </h3>

        <div className="mt-3 space-y-1 text-sm font-bold">
          <p className="text-green-700">
            ✅ Completos: {r.usuarios_completo}
          </p>

          <p className="text-red-700">
            ❌ Faltando: {r.usuarios_faltando}
          </p>

          <p className="text-gray-700">
            Jogos da rodada: {r.total_jogos}
          </p>
        </div>

        {r.lista_faltando && r.lista_faltando.length > 0 && (
          <div className="mt-4 rounded-xl bg-white p-3">
            <p className="mb-2 text-sm font-black text-gray-900">
              Quem falta:
            </p>

            <div className="space-y-2">
              {r.lista_faltando.map((u: any) => (
                <div
                  key={u.nome}
                  className="flex justify-between text-sm text-gray-700"
                >
                  <span>{u.nome}</span>
                  <span className="font-bold text-red-600">
                    faltam {u.faltando}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
</section>
        {loading && (
          <div className="rounded-xl bg-white p-6 text-center font-bold shadow">
            Carregando...
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-4">
            {matches.map((m) => {
              const homeTeam = getTeam(m.home_team_id);
              const awayTeam = getTeam(m.away_team_id);

              return (
                <div key={m.id} className="rounded-2xl bg-white p-5 shadow-xl">
                  <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Rodada {m.round} •{" "}
                      {new Date(m.match_date).toLocaleString("pt-BR")}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        m.status === "finished"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {m.status === "finished" ? "Finalizado" : "Pendente"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="flex items-center gap-2 font-bold">
                      {homeTeam?.flag_url && (
                        <img
                          src={homeTeam.flag_url}
                          alt={homeTeam.name}
                          className="h-5 w-7 rounded object-cover md:h-6 md:w-9"
                        />
                      )}
                      {homeTeam?.name}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        min={0}
                        className="w-16 rounded-lg border p-2 text-center font-bold"
                        value={resultados[m.id]?.home || ""}
                        onChange={(e) =>
                          alterarResultado(m.id, "home", e.target.value)
                        }
                      />

                      <span className="font-black">x</span>

                      <input
                        type="number"
                        min={0}
                        className="w-16 rounded-lg border p-2 text-center font-bold"
                        value={resultados[m.id]?.away || ""}
                        onChange={(e) =>
                          alterarResultado(m.id, "away", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 font-bold">
                      {awayTeam?.name}
                      {awayTeam?.flag_url && (
                        <img
                          src={awayTeam.flag_url}
                          alt={awayTeam.name}
                          className="h-5 w-7 rounded object-cover md:h-6 md:w-9"
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 md:flex-row">
                    <button
                      onClick={() => salvarResultado(m.id)}
                      className="rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
                    >
                      Salvar resultado
                    </button>

                    <button
                      onClick={() => limparResultado(m.id)}
                      className="rounded-lg bg-gray-200 px-4 py-3 font-bold text-gray-700 hover:bg-gray-300"
                    >
                      Limpar resultado
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}