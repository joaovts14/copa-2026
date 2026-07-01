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
  winner_team_id: number | null;
  stage: string;
};

type Resultado = {
  home: string;
  away: string;
};

export default function Admin() {
  const supabase = createClient();
  const router = useRouter();

  const ADMIN_EMAIL = "joaovitortobias@hotmail.com";

  const [statusRodadas, setStatusRodadas] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [resultados, setResultados] = useState<Record<number, Resultado>>({});
  const [loading, setLoading] = useState(true);
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

    const { data: releasesData } = await supabase
      .from("releases")
      .select("*")
      .order("stage")
      .order("round", { nullsFirst: false });

    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .order("name");

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("match_date");

    setStatusRodadas(statusData || []);
    setReleases(releasesData || []);
    setTeams(teamsData || []);

    const ordenados = [...(matchesData || [])].sort((a, b) => {
      const ordemStatus = (status: string) => {
        if (status === "live") return 0;
        if (status === "pending") return 1;
        if (status === "finished") return 2;
        return 3;
      };

      const statusA = ordemStatus(a.status);
      const statusB = ordemStatus(b.status);

      if (statusA !== statusB) return statusA - statusB;

      return (
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
      );
    });

    setMatches(ordenados);

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
    if (valor !== "" && Number(valor) < 0) return;

    setResultados((atual) => ({
      ...atual,
      [matchId]: {
        home: atual[matchId]?.home || "",
        away: atual[matchId]?.away || "",
        [campo]: valor,
      },
    }));
  }

async function alterarLiberacao(
  stage: string,
  round: number | null,
  released: boolean
) {
  const existente = releases.find(
    (r) =>
      r.stage === stage &&
      (round === null ? r.round === null : r.round === round)
  );

  if (existente) {
    const { error } = await supabase
      .from("releases")
      .update({ released })
      .eq("id", existente.id);

    if (error) {
      alert(error.message);
      return;
    }
  } else {
    const { error } = await supabase
      .from("releases")
      .insert({
        stage,
        round,
        released,
      });

    if (error) {
      alert(error.message);
      return;
    }
  }

  carregarDados();
}

  async function alterarStatus(matchId: number, status: string) {
    const { error } = await supabase
      .from("matches")
      .update({ status })
      .eq("id", matchId);

    if (error) {
      alert(error.message);
      return;
    }

    carregarDados();
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

  function getStatusLabel(status: string) {
    if (status === "finished") return "Finalizado";
    if (status === "live") return "Em andamento";
    return "Pendente";
  }
  async function limparVencedor(matchId: number) {
  const { error } = await supabase
    .from("matches")
    .update({ winner_team_id: null })
    .eq("id", matchId);

  if (error) {
    alert(error.message);
    return;
  }

  carregarDados();
}

  async function alterarVencedor(matchId: number, winnerTeamId: number) {
  const { error } = await supabase
    .from("matches")
    .update({ winner_team_id: winnerTeamId })
    .eq("id", matchId);

  if (error) {
    alert(error.message);
    return;
  }

  carregarDados();
}

  function getStatusClass(status: string) {
    if (status === "finished") {
      return "bg-green-100 text-green-700";
    }

    if (status === "live") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }
  const fasesLiberacao = [
  {
    label: "Rodada 1",
    stage: "groups",
    round: 1,
  },
  {
    label: "Rodada 2",
    stage: "groups",
    round: 2,
  },
  {
    label: "Rodada 3",
    stage: "groups",
    round: 3,
  },
  {
    label: "32 avos",
    stage: "round_of_32",
    round: null,
  },
  {
    label: "Oitavas",
    stage: "round_of_16",
    round: null,
  },
  {
    label: "Quartas",
    stage: "quarterfinals",
    round: null,
  },
  {
    label: "Semifinais",
    stage: "semifinals",
    round: null,
  },
  {
    label: "Final",
    stage: "final",
    round: null,
  },
];

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
            Liberação dos palpites
          </h2>

          <p className="mt-1 text-gray-600">
            Controle quando os participantes poderão ver os palpites uns dos
            outros.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
{fasesLiberacao.map((fase) => {
  const release = releases.find(
    (r) =>
      r.stage === fase.stage &&
      (fase.round === null ? r.round === null : r.round === fase.round)
  );

  const liberado = release?.released === true;

  return (
    <div
      key={`${fase.stage}-${fase.round ?? "null"}`}
      className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
    >
      <h3 className="text-lg font-black text-gray-900">
        {fase.label}
      </h3>

      <p className="mt-1 text-xs font-bold text-gray-500">
        {fase.stage}
      </p>

      <p
        className={`mt-2 text-sm font-bold ${
          liberado ? "text-green-700" : "text-red-700"
        }`}
      >
        {liberado ? "Liberado" : "Bloqueado"}
      </p>

      <button
        onClick={() =>
          alterarLiberacao(fase.stage, fase.round, !liberado)
        }
        className={`mt-4 w-full rounded-xl px-4 py-3 font-black text-white ${
          liberado
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {liberado ? "Bloquear" : "Liberar"}
      </button>
    </div>
  );
})}
          </div>
        </section>

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

                {r.lista_preencheu && r.lista_preencheu.length > 0 && (
                  <div className="mt-4 rounded-xl bg-green-50 p-3">
                    <p className="mb-2 text-sm font-black text-green-900">
                      Quem preencheu:
                    </p>

                    <div className="space-y-2">
                      {r.lista_preencheu.map((u: any) => (
                        <div
                          key={u.nome}
                          className="flex justify-between text-sm text-gray-700"
                        >
                          <span>{u.nome}</span>
                          <span className="font-bold text-green-700">
                            completo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                  <div className="mb-3 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                    <span>
                      Rodada {m.round} •{" "}
                      {new Date(m.match_date).toLocaleString("pt-BR")}
                    </span>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        m.status
                      )}`}
                    >
                      {getStatusLabel(m.status)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="flex items-center gap-2 font-bold text-gray-900">
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
                        inputMode="numeric"
                        className="w-16 rounded-lg border border-gray-400 bg-white p-2 text-center text-lg font-black text-gray-950 placeholder-gray-500 shadow-sm"
                        value={resultados[m.id]?.home || ""}
                        onChange={(e) =>
                          alterarResultado(m.id, "home", e.target.value)
                        }
                      />

                      <span className="font-black text-gray-900">x</span>

                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        className="w-16 rounded-lg border border-gray-400 bg-white p-2 text-center text-lg font-black text-gray-950 placeholder-gray-500 shadow-sm"
                        value={resultados[m.id]?.away || ""}
                        onChange={(e) =>
                          alterarResultado(m.id, "away", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 font-bold text-gray-900">
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
                  {m.stage !== "groups" && (
  <div className="mt-4 rounded-xl bg-gray-50 p-4">
    <p className="mb-3 text-sm font-black text-gray-800">
      Quem passou?
    </p>

    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => alterarVencedor(m.id, m.home_team_id)}
        className={`rounded-xl border px-3 py-3 text-sm font-black ${
          m.winner_team_id === m.home_team_id
            ? "border-green-600 bg-green-100 text-green-800"
            : "border-gray-300 bg-white text-gray-700"
        }`}
      >
        {homeTeam?.name}
      </button>

      <button
        type="button"
        onClick={() => alterarVencedor(m.id, m.away_team_id)}
        className={`rounded-xl border px-3 py-3 text-sm font-black ${
          m.winner_team_id === m.away_team_id
            ? "border-green-600 bg-green-100 text-green-800"
            : "border-gray-300 bg-white text-gray-700"
        }`}
      >
        {awayTeam?.name}
      </button>
      <button
  type="button"
  onClick={() => limparVencedor(m.id)}
  className="col-span-2 rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-black text-gray-700 hover:bg-gray-100"
>
  Limpar seleção
</button>
    </div>
  </div>
)}

                  <div className="mt-4 grid gap-2 md:grid-cols-4">
                    <button
                      onClick={() => alterarStatus(m.id, "live")}
                      className="rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700"
                    >
                      Em andamento
                    </button>

                    <button
                      onClick={() => salvarResultado(m.id)}
                      className="rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
                    >
                      Salvar final
                    </button>

                    <button
                      onClick={() => alterarStatus(m.id, "pending")}
                      className="rounded-lg bg-yellow-500 px-4 py-3 font-bold text-white hover:bg-yellow-600"
                    >
                      Pendente
                    </button>

                    <button
                      onClick={() => limparResultado(m.id)}
                      className="rounded-lg bg-gray-200 px-4 py-3 font-bold text-gray-700 hover:bg-gray-300"
                    >
                      Limpar
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