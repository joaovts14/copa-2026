"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { createClient } from "../../lib/supabase/client";

type PublicPick = {
  id: number;
  nome: string;
  match_id: number;
  stage: string;
  round: number | null;
  match_date: string;
  home_team: string;
  home_flag: string | null;
  away_team: string;
  away_flag: string | null;
  home_score_pick: number;
  away_score_pick: number;
  real_home_score: number | null;
  real_away_score: number | null;
};

export default function Palpites() {
  const supabase = createClient();

  const [palpites, setPalpites] = useState<PublicPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [jogosAbertos, setJogosAbertos] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("public_picks")
        .select("*")
        .order("match_date");

      console.log(error);
      setPalpites(data || []);
      setLoading(false);
    }

    carregar();
  }, []);

  function toggleJogo(matchId: number) {
    setJogosAbertos((atual) => ({
      ...atual,
      [matchId]: !atual[matchId],
    }));
  }

  function getIniciais(nome: string) {
    return nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();
  }

  function getGrupoPalpite(p: PublicPick) {
    if (p.home_score_pick > p.away_score_pick) return "home";
    if (p.home_score_pick < p.away_score_pick) return "away";
    return "draw";
  }

  function calcularResultado(p: PublicPick) {
    if (p.real_home_score === null || p.real_away_score === null) {
      return null;
    }

    const realHome = p.real_home_score;
    const realAway = p.real_away_score;
    const pickHome = p.home_score_pick;
    const pickAway = p.away_score_pick;

    if (realHome === pickHome && realAway === pickAway) {
      return "exact";
    }

    const realResultado =
      realHome > realAway ? "home" : realHome < realAway ? "away" : "draw";

    const pickResultado =
      pickHome > pickAway ? "home" : pickHome < pickAway ? "away" : "draw";

    const saldoReal = realHome - realAway;
    const saldoPick = pickHome - pickAway;

    if (realResultado === pickResultado && saldoReal === saldoPick) {
      return "saldo";
    }

    if (realResultado === pickResultado) {
      return "resultado";
    }

    if (realHome === pickHome || realAway === pickAway) {
      return "umTime";
    }

    return "erro";
  }

  function getClasses(resultado: string | null) {
    switch (resultado) {
      case "exact":
        return "border-green-600 bg-green-100";
      case "saldo":
        return "border-green-400 bg-green-50";
      case "resultado":
        return "border-emerald-300 bg-emerald-50";
      case "umTime":
        return "border-yellow-300 bg-yellow-50";
      case "erro":
        return "border-red-300 bg-red-50";
      default:
        return "border-gray-200 bg-white";
    }
  }

  function getAvatarClasses(resultado: string | null) {
    switch (resultado) {
      case "exact":
        return "bg-green-600 text-white";
      case "saldo":
        return "bg-green-200 text-green-900";
      case "resultado":
        return "bg-emerald-200 text-emerald-900";
      case "umTime":
        return "bg-yellow-200 text-yellow-900";
      case "erro":
        return "bg-red-200 text-red-900";
      default:
        return "bg-green-100 text-green-800";
    }
  }

  function getScoreClass(resultado: string | null) {
    switch (resultado) {
      case "exact":
        return "text-green-800";
      case "saldo":
        return "text-green-700";
      case "resultado":
        return "text-emerald-700";
      case "umTime":
        return "text-yellow-800";
      case "erro":
        return "text-red-700";
      default:
        return "text-gray-900";
    }
  }

  const jogos = palpites.reduce<Record<number, PublicPick[]>>((acc, p) => {
    if (!acc[p.match_id]) acc[p.match_id] = [];
    acc[p.match_id].push(p);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="mx-auto max-w-6xl">
        <Navbar />

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-xl">
          <h1 className="text-3xl font-black text-gray-900">Palpites</h1>
          <p className="mt-2 text-gray-700">
            Veja os palpites liberados pelo admin.
          </p>
        </section>

        {loading && (
          <div className="rounded-2xl bg-white p-6 text-center font-bold text-gray-900 shadow">
            Carregando...
          </div>
        )}

        {!loading && Object.keys(jogos).length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center font-bold text-gray-700 shadow">
            Nenhum palpite liberado ainda.
          </div>
        )}

        {!loading && Object.keys(jogos).length > 0 && (
          <section className="overflow-hidden rounded-2xl bg-white shadow-xl">
            {Object.entries(jogos).map(([matchId, lista], index) => {
              const jogo = lista[0];
              const aberto = jogosAbertos[Number(matchId)] === true;

              const palpitesHome = lista.filter(
                (p) => getGrupoPalpite(p) === "home"
              );
              const palpitesDraw = lista.filter(
                (p) => getGrupoPalpite(p) === "draw"
              );
              const palpitesAway = lista.filter(
                (p) => getGrupoPalpite(p) === "away"
              );

              return (
                <div
                  key={matchId}
                  className={index !== 0 ? "border-t border-gray-200" : ""}
                >
                  <button
                    type="button"
                    onClick={() => toggleJogo(Number(matchId))}
                    className="w-full p-5 text-left hover:bg-gray-50"
                  >
                    <div className="grid items-center gap-3 md:grid-cols-[180px_1fr_auto]">
                      <span className="text-sm font-bold text-gray-500">
                        {new Date(jogo.match_date).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <div className="flex items-center justify-center gap-4 text-lg font-black text-gray-900">
                        <div className="flex items-center gap-2">
                          {jogo.home_flag && (
                            <img
                              src={jogo.home_flag}
                              alt={jogo.home_team}
                              className="h-5 w-7 rounded object-cover md:h-6 md:w-9"
                            />
                          )}
                          <span>{jogo.home_team}</span>
                        </div>

                        <span className="text-gray-500">x</span>

                        <div className="flex items-center gap-2">
                          <span>{jogo.away_team}</span>
                          {jogo.away_flag && (
                            <img
                              src={jogo.away_flag}
                              alt={jogo.away_team}
                              className="h-5 w-7 rounded object-cover md:h-6 md:w-9"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3 md:justify-end">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-black text-green-800">
                          {lista.length} palpites
                        </span>

                        <span className="text-2xl font-black text-gray-500">
                          {aberto ? "−" : "+"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {aberto && (
                    <div className="px-5 pb-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        {[
                          {
                            titulo: `Vitória ${jogo.home_team}`,
                            total: palpitesHome.length,
                            itens: palpitesHome,
                            cor: "border-green-300 bg-green-50",
                          },
                          {
                            titulo: "Empate",
                            total: palpitesDraw.length,
                            itens: palpitesDraw,
                            cor: "border-yellow-300 bg-yellow-50",
                          },
                          {
                            titulo: `Vitória ${jogo.away_team}`,
                            total: palpitesAway.length,
                            itens: palpitesAway,
                            cor: "border-blue-300 bg-blue-50",
                          },
                        ].map((grupo) => (
                          <div
                            key={grupo.titulo}
                            className={`rounded-2xl border-2 p-4 ${grupo.cor}`}
                          >
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <h3 className="text-sm font-black text-gray-900">
                                {grupo.titulo}
                              </h3>

                              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-gray-700">
                                {grupo.total}
                              </span>
                            </div>

                            {grupo.itens.length === 0 && (
                              <p className="text-sm font-semibold text-gray-500">
                                Ninguém apostou
                              </p>
                            )}

                            <div className="flex flex-col gap-2">
                              {grupo.itens.map((p) => {
                                const resultado = calcularResultado(p);

                                return (
                                  <div
                                    key={p.id}
                                    className={`flex items-center justify-between gap-2 rounded-xl border-2 p-2 shadow-sm ${getClasses(
                                      resultado
                                    )}`}
                                  >
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${getAvatarClasses(
                                          resultado
                                        )}`}
                                      >
                                        {getIniciais(p.nome)}
                                      </span>

                                      <span className="truncate text-sm font-bold text-gray-900">
                                        {p.nome}
                                      </span>
                                    </div>

                                    <span
                                      className={`shrink-0 text-sm font-black ${getScoreClass(
                                        resultado
                                      )}`}
                                    >
                                      {p.home_score_pick} x{" "}
                                      {p.away_score_pick}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}