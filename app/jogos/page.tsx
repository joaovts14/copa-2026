"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Navbar from "../../components/Navbar";

type Team = {
  id: number;
  name: string;
  group_name: string;
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

type Palpite = {
  home: string;
  away: string;
};



export default function Jogos() {
  const supabase = createClient();

  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [user, setUser] = useState<any>(null);
  const [palpites, setPalpites] = useState<Record<number, Palpite>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const usuario = userData.user;

      setUser(usuario);

      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .order("group_name")
        .order("id");

      const { data: matchesData } = await supabase
        .from("matches")
        .select("*")
        .order("match_date");

      setTeams(teamsData || []);
      setMatches(matchesData || []);

      if (usuario) {
        const { data: picksData } = await supabase
          .from("picks")
          .select("*")
          .eq("user_id", usuario.id);

        const mapa: Record<number, Palpite> = {};

        picksData?.forEach((p) => {
          mapa[p.match_id] = {
            home: String(p.home_score_pick),
            away: String(p.away_score_pick),
          };
        });

        setPalpites(mapa);
      }

      setLoading(false);
    }

    load();
  }, []);
  const [rodadaSelecionada, setRodadaSelecionada] = useState(1);

  const matchesDaRodada = useMemo(() => {
  return matches.filter((match) => match.round === rodadaSelecionada);
}, [matches, rodadaSelecionada]);

  const matchesByGroup = useMemo(() => {
    const grupos: Record<string, Match[]> = {};

    matchesDaRodada.forEach((match) => {
      const homeTeam = getTeam(match.home_team_id);
      const grupo = homeTeam?.group_name || "Sem grupo";

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }

      grupos[grupo].push(match);
    });

    return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b));
  }, [matchesDaRodada, teams]);

  function getTeam(id: number) {
    return teams.find((team) => team.id === id);
  }

  function getTeamName(id: number) {
    return getTeam(id)?.name || "Time não encontrado";
  }

  function TeamDisplay({ teamId, align = "left" }: { teamId: number; align?: "left" | "right" }) {
  const team = getTeam(teamId);

  return (
    <div
      className={`flex items-center gap-2 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      {team?.flag_url && (
        <img
          src={team.flag_url}
          alt={`Bandeira ${team.name}`}
          className="h-5 w-7 md:h-6 md:w-9"
        />
      )}

      <span className="font-bold text-gray-900">
        {team?.name || "Time não encontrado"}
      </span>
    </div>
  );
}

  function jogoJaComecou(match: Match) {
    return new Date(match.match_date) <= new Date();
  }

  function alterarPalpite(
    matchId: number,
    campo: "home" | "away",
    valor: string
  ) {
    setPalpites((atual) => ({
      ...atual,
      [matchId]: {
        home: atual[matchId]?.home || "",
        away: atual[matchId]?.away || "",
        [campo]: valor,
      },
    }));
  }

  async function salvarPalpite(matchId: number) {
    if (!user) {
      alert("Você precisa estar logado");
      return;
    }

    const match = matches.find((m) => m.id === matchId);

    if (!match) {
      alert("Jogo não encontrado.");
      return;
    }

    if (jogoJaComecou(match)) {
      alert("Não é possível alterar o palpite depois que o jogo começou.");
      return;
    }

    const palpite = palpites[matchId];

    if (!palpite || palpite.home === "" || palpite.away === "") {
      alert("Preencha o placar antes de salvar.");
      return;
    }

    const { error } = await supabase.from("picks").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        home_score_pick: Number(palpite.home),
        away_score_pick: Number(palpite.away),
      },
      {
        onConflict: "user_id,match_id",
      }
    );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Palpite salvo!");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="mx-auto max-w-5xl">
        <Navbar />
        <header className="mb-8 rounded-2xl bg-white/95 p-6 shadow-lg">
          <p className="text-sm font-bold uppercase tracking-widest text-green-700">
            Copa do Mundo 2026
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Bolão da Copa
          </h1>

          <p className="mt-2 text-gray-600">
            Faça seus palpites por grupo antes dos jogos começarem.
          </p>

          {!user && (
            <p className="mt-4 rounded-lg bg-yellow-100 p-3 text-yellow-800">
              Você não está logado. Faça login antes de salvar palpites.
            </p>
          )}
        </header>

        <div className="mb-6 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((rodada) => (
                <button
                key={rodada}
                onClick={() => setRodadaSelecionada(rodada)}
                className={`rounded-xl px-4 py-3 font-black shadow transition ${
                    rodadaSelecionada === rodada
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                >
                Rodada {rodada}
                </button>
            ))}
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-6 text-center shadow">
            Carregando jogos...
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow">
            Nenhum jogo encontrado para esta rodada.
          </div>
        )}

        <div className="flex flex-col gap-8">
          {matchesByGroup.map(([groupName, groupMatches]) => (
            <section
              key={groupName}
              className="overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <div className="bg-gray-900 px-6 py-4 text-white">
                <h2 className="text-xl font-black">Grupo {groupName}</h2>

                <p className="mt-1 text-sm text-gray-300">
                  {teams
                    .filter((team) => team.group_name === groupName)
                    .map((team) => team.name)
                    .join(" • ")}
                </p>
              </div>

              <div className="divide-y">
                {groupMatches.map((m) => {
                  const bloqueado = jogoJaComecou(m);

                  return (
                    <div key={m.id} className="p-5">
                      <div className="mb-3 flex items-center justify-between gap-4 text-sm text-gray-500">
                        <span>
                          {new Date(m.match_date).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            bloqueado
                              ? "bg-gray-200 text-gray-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {bloqueado ? "Bloqueado" : "Aberto"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">                        
                        <div className="md:text-left text-center">
                        <TeamDisplay teamId={m.home_team_id} />
                        </div>

                        {bloqueado ? (
                          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-lg font-black">
                            <span>{m.home_score ?? "-"}</span>
                            <span>x</span>
                            <span>{m.away_score ?? "-"}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min={0}
                              className="w-14 rounded-lg border p-2 text-center font-bold"
                              value={palpites[m.id]?.home || ""}
                              onChange={(e) =>
                                alterarPalpite(m.id, "home", e.target.value)
                              }
                            />

                            <span className="font-bold">x</span>

                            <input
                              type="number"
                              min={0}
                              className="w-14 rounded-lg border p-2 text-center font-bold"
                              value={palpites[m.id]?.away || ""}
                              onChange={(e) =>
                                alterarPalpite(m.id, "away", e.target.value)
                              }
                            />
                          </div>
                        )}

                        <div className="md:text-right text-center">
                            <TeamDisplay teamId={m.away_team_id} align="right" />
                        </div>
                      </div>

                      {bloqueado && (
                        <div className="mt-3 text-sm text-gray-600">
                          Seu palpite:{" "}
                          <strong>
                            {palpites[m.id]?.home ?? "-"} x{" "}
                            {palpites[m.id]?.away ?? "-"}
                          </strong>
                        </div>
                      )}

                      <button
                        disabled={bloqueado}
                        onClick={() => salvarPalpite(m.id)}
                        className={`mt-4 w-full rounded-lg px-4 py-3 font-bold text-white transition ${
                          bloqueado
                            ? "cursor-not-allowed bg-gray-400"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {bloqueado ? "Jogo bloqueado" : "Salvar palpite"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}