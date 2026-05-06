"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Navbar from "../../components/Navbar";

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

  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [resultados, setResultados] = useState<Record<number, Resultado>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);

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