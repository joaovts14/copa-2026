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
    real_home_score : number;
  real_away_score : number;
};

export default function Palpites() {
  const supabase = createClient();

  const [palpites, setPalpites] = useState<PublicPick[]>([]);
  const [loading, setLoading] = useState(true);

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

  function getIniciais(nome: string) {
    return nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();
  }

  function calcularResultado(p: PublicPick) {
  if (
    p.real_home_score === null ||
    p.real_away_score === null
  ) {
    return null;
  }

  const realHome = p.real_home_score;
  const realAway = p.real_away_score;

  const pickHome = p.home_score_pick;
  const pickAway = p.away_score_pick;

  // placar exato
  if (
    realHome === pickHome &&
    realAway === pickAway
  ) {
    return "exact";
  }

  const realResultado =
    realHome > realAway
      ? "home"
      : realHome < realAway
      ? "away"
      : "draw";

  const pickResultado =
    pickHome > pickAway
      ? "home"
      : pickHome < pickAway
      ? "away"
      : "draw";

  const saldoReal = realHome - realAway;
  const saldoPick = pickHome - pickAway;

  if (
    realResultado === pickResultado &&
    saldoReal === saldoPick
  ) {
    return "saldo";
  }

  if (realResultado === pickResultado) {
    return "resultado";
  }

  if (
    realHome === pickHome ||
    realAway === pickAway
  ) {
    return "umTime";
  }

  return "erro";
}

function getScoreClass(resultado: string | null) {
  switch (resultado) {
    case "exact":
      return "text-green-700";

    case "saldo":
      return "text-green-600";

    case "resultado":
      return "text-emerald-600";

    case "umTime":
      return "text-yellow-700";

    case "erro":
      return "text-red-600";

    default:
      return "text-gray-700";
  }
}

function getEmoji(resultado: string | null) {
    resultado = "teste"
  switch (resultado) {
    case "exact":
      return "🏆";

    case "saldo":
      return "🟢";

    case "resultado":
      return "🟡";

    case "umTime":
      return "🟠";

    case "erro":
      return "🔴";

    default:
      return "";
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

        <section className="overflow-hidden rounded-2xl bg-white shadow-xl">
          {Object.entries(jogos).map(([matchId, lista], index) => {
            const jogo = lista[0];

            return (
              <div
                key={matchId}
                className={`p-5 ${
                  index !== 0 ? "border-t border-gray-200" : ""
                }`}
              >
<div className="mb-4 grid items-center gap-3 md:grid-cols-[180px_1fr_180px]">
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

  <span />
</div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {lista.map((p) => {
  const resultado = calcularResultado(p);

  return (
                    
                    <div
                      key={p.id}
className={`flex items-center justify-between gap-3 rounded-xl border-2 p-3 shadow-sm `}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-black text-green-800">
                          {getIniciais(p.nome)}
                        </span>

                        <span className="truncate font-bold text-gray-900">
                          {p.nome}
                        </span>
                      </div>

<span
  className={`shrink-0 text-lg font-black ${getScoreClass(resultado)}`}
>
  {p.home_score_pick} x {p.away_score_pick}
</span>
                    </div>
                    );
})}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}