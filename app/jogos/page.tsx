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
  stage: string;
};

type Palpite = {
  home: string;
  away: string;
};

export default function Jogos() {
  const supabase = createClient();

  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [user, setUser] = useState<any>(null);
  const [palpites, setPalpites] = useState<Record<number, Palpite>>({});

  const [faseSelecionada, setFaseSelecionada] = useState("groups");
  const [rodadaSelecionada, setRodadaSelecionada] = useState(1);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      const { data: teamsData } = await supabase
        .from("teams")
        .select("*");

      const { data: matchesData } = await supabase
        .from("matches")
        .select("*")
        .order("match_date");

      setTeams(teamsData || []);
      setMatches(matchesData || []);

      if (userData.user) {
        const { data: picksData } = await supabase
          .from("picks")
          .select("*")
          .eq("user_id", userData.user.id);

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

  const matchesFiltrados = useMemo(() => {
    if (faseSelecionada === "groups") {
      return matches.filter(
        (m) =>
          m.stage === "groups" &&
          m.round === rodadaSelecionada
      );
    }

    return matches.filter((m) => m.stage === faseSelecionada);
  }, [matches, faseSelecionada, rodadaSelecionada]);

  function getTeam(id: number) {
    return teams.find((t) => t.id === id);
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

  async function salvarTodosPalpites() {
    if (!user) return;

    const palpitesParaSalvar = matches
      .filter((m) => m.round === rodadaSelecionada)
      .flatMap((m) => {
        const palpite = palpites[m.id];

        if (!palpite || palpite.home === "" || palpite.away === "") {
          return [];
        }

        return [
          {
            user_id: user.id,
            match_id: m.id,
            home_score_pick: Number(palpite.home),
            away_score_pick: Number(palpite.away),
          },
        ];
      });

    if (palpitesParaSalvar.length === 0) {
      alert("Nenhum palpite preenchido.");
      return;
    }

    const { error } = await supabase
      .from("picks")
      .upsert(palpitesParaSalvar, {
        onConflict: "user_id,match_id",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Palpites salvos!");
  }

  function TeamDisplay({ teamId }: { teamId: number }) {
    const team = getTeam(teamId);

    return (
      <div className="flex items-center gap-2">
        {team?.flag_url && (
          <img
            src={team.flag_url}
            alt={team.name}
            className="h-5 w-7 rounded object-cover md:h-6 md:w-9"
          />
        )}
        <span className="font-bold">{team?.name}</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6 pb-28">
      <div className="mx-auto max-w-5xl">
        <Navbar />

        {/* Abas */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {[
            { key: "groups", label: "Grupos" },
            { key: "round_of_32", label: "16 avos" },
            { key: "round_of_16", label: "Oitavas" },
            { key: "quarterfinals", label: "Quartas" },
            { key: "semifinals", label: "Semi" },
            { key: "final", label: "Final" },
          ].map((fase) => (
            <button
              key={fase.key}
              onClick={() => setFaseSelecionada(fase.key)}
              className={`rounded-xl px-4 py-2 font-bold ${
                faseSelecionada === fase.key
                  ? "bg-black text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {fase.label}
            </button>
          ))}
        </div>

        {/* Rodadas */}
        {faseSelecionada === "groups" && (
          <div className="mb-6 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((rodada) => (
              <button
                key={rodada}
                onClick={() => setRodadaSelecionada(rodada)}
                className={`rounded-xl px-3 py-2 font-bold ${
                  rodadaSelecionada === rodada
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                Rodada {rodada}
              </button>
            ))}
          </div>
        )}

        {/* Jogos */}
        {loading && <p>Carregando...</p>}

        <div className="flex flex-col gap-4">
          {matchesFiltrados.map((m) => (
            <div key={m.id} className="rounded-xl bg-white p-4 shadow">
              <div className="mb-2 text-sm text-gray-500">
                {new Date(m.match_date).toLocaleString("pt-BR")}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                  <TeamDisplay teamId={m.home_team_id} />
                  <input
                    type="number"
                    className="h-12 w-16 rounded-lg border border-gray-400 text-center font-bold"
                    value={palpites[m.id]?.home || ""}
                    onChange={(e) =>
                      alterarPalpite(m.id, "home", e.target.value)
                    }
                  />
                </div>

                <div className="flex justify-between">
                  <TeamDisplay teamId={m.away_team_id} />
                  <input
                    type="number"
                    className="h-12 w-16 rounded-lg border border-gray-400 text-center font-bold"
                    value={palpites[m.id]?.away || ""}
                    onChange={(e) =>
                      alterarPalpite(m.id, "away", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botão flutuante */}
      <button
        onClick={salvarTodosPalpites}
        className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-green-600 py-4 text-lg font-black text-white shadow-2xl"
      >
        Salvar palpites
      </button>
    </main>
  );
}