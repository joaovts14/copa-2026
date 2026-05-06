"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Navbar from "../../components/Navbar";

export default function Ranking() {
  const supabase = createClient();

  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("ranking")
        .select("*");

      console.log("RANKING:", data);
      console.log("ERROR:", error);

      setRanking(data || []);
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <Navbar />
      <h1 className="text-2xl font-bold">Ranking</h1>

      <div className="mt-6 rounded bg-white shadow">
        {ranking.length === 0 && (
          <p className="p-4 text-gray-600">
            Nenhum ponto ainda.
          </p>
        )}

        {ranking.map((r, index) => (
          <div
            key={r.user_id}
            className="flex items-center justify-between border-b p-4"
          >
            <span className="font-bold">
              #{index + 1} {r.email}
            </span>

            <span className="text-lg font-bold text-green-600">
              {r.pontos} pts
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}