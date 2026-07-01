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
  winner_team_id: number | null;
};

type Palpite = {
  home: string;
  away: string;
  predictedWinnerTeamId?: number | null;
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
  predictedWinnerTeamId: p.predicted_winner_team_id,
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
    if (abaBloqueada) {
  alert("Esta etapa já foi bloqueada.");
  return;
}

const palpitesParaSalvar = matchesFiltrados.flatMap((m) => {
  const palpite = palpites[m.id];

  if (!palpite || palpite.home === "" || palpite.away === "") {
    return [];
  }

  let predictedWinnerTeamId: number | null = null;

if (isEliminatoria(m.stage)) {
  if (Number(palpite.home) > Number(palpite.away)) {
    predictedWinnerTeamId = m.home_team_id;
  } else if (Number(palpite.home) < Number(palpite.away)) {
    predictedWinnerTeamId = m.away_team_id;
  } else {
    predictedWinnerTeamId = palpite.predictedWinnerTeamId || null;

    if (!predictedWinnerTeamId) {
      return [];
    }
  }
}

  return [
    {
      user_id: user.id,
      match_id: m.id,
      home_score_pick: Number(palpite.home),
      away_score_pick: Number(palpite.away),
      predicted_winner_team_id: predictedWinnerTeamId,
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
        <span className="font-bold text-gray-900">{team?.name}</span>
      </div>
    );
  }

function calcularPontos(match: Match, palpite?: Palpite) {
  if (
    !palpite ||
    palpite.home === "" ||
    palpite.away === "" ||
    match.home_score === null ||
    match.away_score === null
  ) {
    return null;
  }

  const realHome = match.home_score;
  const realAway = match.away_score;
  const pickHome = Number(palpite.home);
  const pickAway = Number(palpite.away);

  let pontos = 0;

  // Placar exato
  if (realHome === pickHome && realAway === pickAway) {
    pontos = 10;
  } else {
    const acertouResultado =
      (realHome > realAway && pickHome > pickAway) ||
      (realHome < realAway && pickHome < pickAway) ||
      (realHome === realAway && pickHome === pickAway);

    if (acertouResultado) {
      const saldoReal = realHome - realAway;
      const saldoPalpite = pickHome - pickAway;

      if (saldoReal === saldoPalpite) {
        pontos = 7;
      } else {
        pontos = 5;
      }
    } else if (realHome === pickHome || realAway === pickAway) {
      pontos = 2;
    }
  }

  // 🔥 BONUS BRASIL
  const homeTeam = getTeam(match.home_team_id);
  const awayTeam = getTeam(match.away_team_id);

  const temBrasil =
    homeTeam?.name === "Brasil" || awayTeam?.name === "Brasil";

  if (temBrasil && pontos > 0) {
    pontos += 2;
  }

  if (
  match.stage !== "groups" &&
  palpite.predictedWinnerTeamId &&
  (match as any).winner_team_id &&
  palpite.predictedWinnerTeamId === (match as any).winner_team_id
) {
  if (match.stage === "round_of_16") pontos += 3;
  if (match.stage === "quarterfinals") pontos += 5;
  if (match.stage === "semifinals") pontos += 7;
  if (match.stage === "final") pontos += 10;
}

  return pontos;
}
function getResultadoPalpite(match: Match) {
  const palpite = palpites[match.id];

  if (
    !palpite ||
    palpite.home === "" ||
    palpite.away === "" ||
    match.home_score === null ||
    match.away_score === null
  ) {
    return null;
  }

  const realHome = match.home_score;
  const realAway = match.away_score;
  const pickHome = Number(palpite.home);
  const pickAway = Number(palpite.away);

  let texto = "Errou";
  let classe = "bg-red-100 text-red-800 border-red-300";
  let pontosBase = 0;

  if (realHome === pickHome && realAway === pickAway) {
    texto = "Placar exato";
    classe = "bg-green-100 text-green-800 border-green-300";
    pontosBase = 10;
  } else {
    const acertouResultado =
      (realHome > realAway && pickHome > pickAway) ||
      (realHome < realAway && pickHome < pickAway) ||
      (realHome === realAway && pickHome === pickAway);

    if (acertouResultado) {
      const saldoReal = realHome - realAway;
      const saldoPalpite = pickHome - pickAway;

      if (saldoReal === saldoPalpite) {
        texto = "Vencedor + saldo";
        classe = "bg-emerald-100 text-emerald-800 border-emerald-300";
        pontosBase = 7;
      } else {
        texto = "Acertou vencedor";
        classe = "bg-yellow-100 text-yellow-800 border-yellow-300";
        pontosBase = 5;
      }
    } else if (realHome === pickHome || realAway === pickAway) {
      texto = "Acerto parcial";
      classe = "bg-orange-100 text-orange-800 border-orange-300";
      pontosBase = 2;
    }
  }

  const homeTeam = getTeam(match.home_team_id);
  const awayTeam = getTeam(match.away_team_id);

  const temBrasil =
    homeTeam?.name === "Brasil" || awayTeam?.name === "Brasil";

  const bonusBrasil = temBrasil && pontosBase > 0 ? 2 : 0;

  let bonusClassificado = 0;

  if (
    match.stage !== "groups" &&
    palpite.predictedWinnerTeamId &&
    match.winner_team_id &&
    palpite.predictedWinnerTeamId === match.winner_team_id
  ) {
    if (match.stage === "round_of_16") bonusClassificado = 3;
    if (match.stage === "quarterfinals") bonusClassificado = 5;
    if (match.stage === "semifinals") bonusClassificado = 7;
    if (match.stage === "final") bonusClassificado = 10;
  }

  const pontos = pontosBase + bonusBrasil + bonusClassificado;

  return {
    texto,
    classe,
    pontos,
    pontosBase,
    bonusBrasil,
    bonusClassificado,
  };
}

const totalJogosDaAba = matchesFiltrados.length;

const preenchidosDaAba = matchesFiltrados.filter((m) => {
  const p = palpites[m.id];
  return p && p.home !== "" && p.away !== "";
}).length;

const faltantesDaAba = totalJogosDaAba - preenchidosDaAba;

const prazoDaAba = matchesFiltrados.length
  ? new Date(
      Math.min(...matchesFiltrados.map((m) => new Date(m.match_date).getTime()))
    )
  : null;

const abaBloqueada = prazoDaAba ? prazoDaAba <= new Date() : false;
function alterarClassificado(matchId: number, teamId: number) {
  setPalpites((atual) => ({
    ...atual,
    [matchId]: {
      home: atual[matchId]?.home || "",
      away: atual[matchId]?.away || "",
      predictedWinnerTeamId: teamId,
    },
  }));
}

function isEliminatoria(stage: string) {
  return stage !== "groups";
}

function palpiteEmpatado(matchId: number) {
  const p = palpites[matchId];

  if (!p || p.home === "" || p.away === "") {
    return false;
  }

  return Number(p.home) === Number(p.away);
}
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6 pb-28">
      <div className="mx-auto max-w-5xl">
        <Navbar />
<div className="mb-6 rounded-2xl bg-white p-5 shadow-xl">
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-green-700">
        Status dos palpites
      </p>

      <h2 className="mt-1 text-2xl font-black text-gray-900">
        {preenchidosDaAba}/{totalJogosDaAba} preenchidos
      </h2>

      <p className="mt-1 text-sm font-semibold text-gray-700">
        {faltantesDaAba === 0
          ? "Todos os palpites desta etapa foram preenchidos."
          : `Faltam ${faltantesDaAba} palpites para preencher.`}
      </p>
    </div>

    <div
      className={`rounded-xl px-4 py-3 text-center font-bold ${
        abaBloqueada
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {abaBloqueada ? (
        "Etapa bloqueada"
      ) : (
        <>
          Prazo até:
          <br />
          {prazoDaAba?.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </>
      )}
    </div>
  </div>

  <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
    <div
      className="h-full rounded-full bg-green-600 transition-all"
      style={{
        width:
          totalJogosDaAba > 0
            ? `${(preenchidosDaAba / totalJogosDaAba) * 100}%`
            : "0%",
      }}
    />
  </div>
</div>
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
                    type="numeric"
                    className="h-12 w-16 text-gray-900 rounded-lg border border-gray-400 text-center font-bold"
                    value={palpites[m.id]?.home || ""}
                    onChange={(e) =>
                      alterarPalpite(m.id, "home", e.target.value)
                    }
                  />
                </div>

                <div className="flex justify-between">
                  <TeamDisplay teamId={m.away_team_id} />
                  <input
                    type="numeric"
                    className="h-12 w-16 rounded-lg border text-gray-900 border-gray-400 text-center font-bold"
                    value={palpites[m.id]?.away || ""}
                    onChange={(e) =>
                      alterarPalpite(m.id, "away", e.target.value)
                    }
                  />
                 
                </div>
                {isEliminatoria(m.stage) && palpiteEmpatado(m.id) && (
  <div className="mt-4 rounded-xl bg-yellow-50 p-4">
    <p className="mb-3 text-sm font-black text-yellow-800">
      Quem passa de fase?
    </p>

    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => alterarClassificado(m.id, m.home_team_id)}
        className={`rounded-lg border px-3 py-2 text-sm font-bold ${
          palpites[m.id]?.predictedWinnerTeamId === m.home_team_id
            ? "border-green-600 bg-green-100 text-green-800"
            : "border-gray-300 bg-white text-gray-700"
        }`}
      >
        {getTeam(m.home_team_id)?.name}
      </button>

      <button
        type="button"
        onClick={() => alterarClassificado(m.id, m.away_team_id)}
        className={`rounded-lg border px-3 py-2 text-sm font-bold ${
          palpites[m.id]?.predictedWinnerTeamId === m.away_team_id
            ? "border-green-600 bg-green-100 text-green-800"
            : "border-gray-300 bg-white text-gray-700"
        }`}
      >
        {getTeam(m.away_team_id)?.name}
      </button>
    </div>
  </div>
)}
{getResultadoPalpite(m) && (
  <div
    className={`mt-4 rounded-xl border px-4 py-3 text-center font-bold ${
      getResultadoPalpite(m)!.classe
    }`}
  >
    <div>{getResultadoPalpite(m)!.texto}</div>

    <div className="mt-1 text-sm">
      Placar: +{getResultadoPalpite(m)!.pontosBase} pts
      {getResultadoPalpite(m)!.bonusBrasil > 0 && (
        <> • Brasil: +{getResultadoPalpite(m)!.bonusBrasil}</>
      )}
      {getResultadoPalpite(m)!.bonusClassificado > 0 && (
        <> • Classificado: +{getResultadoPalpite(m)!.bonusClassificado}</>
      )}
    </div>

    <div className="mt-1 text-base font-black">
      Total: {getResultadoPalpite(m)!.pontos} pts
    </div>
  </div>
)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botão flutuante */}
<button
  onClick={salvarTodosPalpites}
  disabled={abaBloqueada}
  className={`fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl py-4 text-lg font-black text-white shadow-2xl ${
    abaBloqueada
      ? "cursor-not-allowed bg-gray-500"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  {abaBloqueada
    ? "Etapa bloqueada"
    : `Salvar palpites (${preenchidosDaAba}/${totalJogosDaAba})`}
</button>
    </main>
  );
}