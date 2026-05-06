"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Navbar from "../../components/Navbar";

export default function Ranking() {
  const supabase = createClient();
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("ranking")
        .select("*");

      console.log(data, error);

      setRanking(data || []);
      setLoading(false);
    }

    load();
  }, []);

  function getMedalha(index: number) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="mx-auto max-w-4xl">
        <Navbar />

        <header className="mb-6 rounded-2xl bg-white p-6 shadow-xl">
          <h1 className="text-3xl font-black text-gray-900">
            Ranking
          </h1>

          <p className="mt-2 text-gray-600">
            Veja quem está liderando o bolão.
          </p>
        </header>

        {loading && (
          <div className="rounded-xl bg-white p-6 text-center font-bold shadow">
            Carregando...
          </div>
        )}

        {!loading && ranking.length === 0 && (
          <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow">
            Nenhum ponto ainda.
          </div>
        )}

        <div className="flex flex-col gap-4">
          {ranking.map((r, index) => (
            <div
              key={r.user_id}
              className={`flex items-center justify-between rounded-2xl p-5 shadow-lg ${
                index === 0
                  ? "bg-yellow-100"
                  : index === 1
                  ? "bg-gray-200"
                  : index === 2
                  ? "bg-orange-100"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black">
                  {getMedalha(index)}
                </span>

                <div>
                  <p className="font-bold text-gray-900">
                    {r.email}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-black text-green-700">
                  {r.pontos} pts
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}