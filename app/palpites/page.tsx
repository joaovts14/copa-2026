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

  const jogos = palpites.reduce<Record<number, PublicPick[]>>((acc, p) => {
    if (!acc[p.match_id]) acc[p.match_id] = [];
    acc[p.match_id].push(p);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="mx-auto max-w-5xl">
        <Navbar />

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-xl">
          <h1 className="text-3xl font-black text-gray-900">
            Palpites
          </h1>
 
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

        <div className="flex flex-col gap-5">
          {Object.entries(jogos).map(([matchId, lista]) => {
            const jogo = lista[0];

            return (
              <section key={matchId} className="rounded-2xl bg-white p-5 shadow-xl">
                <div className="mb-4 text-sm font-bold text-gray-500">
                  {new Date(jogo.match_date).toLocaleString("pt-BR")}
                </div>

                <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="flex items-center gap-2 font-black text-gray-900">
                    {jogo.home_flag && (
                      <img src={jogo.home_flag} className="h-5 w-7 rounded object-cover" />
                    )}
                    {jogo.home_team}
                  </div>

                  <span className="font-black text-gray-500">x</span>

                  <div className="flex items-center justify-end gap-2 font-black text-gray-900">
                    {jogo.away_team}
                    {jogo.away_flag && (
                      <img src={jogo.away_flag} className="h-5 w-7 rounded object-cover" />
                    )}
                  </div>
                </div>

               <div className="divide-y rounded-xl border border-gray-200">
  {lista.map((p) => (
    <div
      key={p.id}
      className="flex items-center justify-between p-4"
    >
      <span className="font-semibold text-gray-900">
        {p.nome}
      </span>

      <span className="rounded-lg bg-green-50 px-4 py-2 text-lg font-black text-green-700">
        {p.home_score_pick} x {p.away_score_pick}
      </span>
    </div>
  ))}
</div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}