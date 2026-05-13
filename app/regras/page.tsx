import Navbar from "../../components/Navbar";

export default function Regras() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="mx-auto max-w-4xl">
        <Navbar />

        <section className="rounded-2xl bg-white p-6 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-widest text-green-700">
            Bolão Copa do Mundo 2026
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Regras do Bolão
          </h1>

          <p className="mt-3 text-gray-700">
            Confira como funcionam os palpites, prazos e pontuação.
          </p>
        </section>

        <section className="mt-6 grid gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              🕒 Prazo dos palpites
            </h2>
            <p className="mt-2 text-gray-700">
              Os palpites devem ser preenchidos por rodada. Cada rodada fica
              disponível até o início do primeiro jogo daquela rodada.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              🏆 Pontuação
            </h2>

            <ul className="mt-3 space-y-2 text-gray-700">
              <li>
                🎯 <strong>5 pontos</strong> — acertar o placar exato.
              </li>
              <li>
                ✅ <strong>3 pontos</strong> — acertar o vencedor ou empate.
              </li>
              <li>
                ⚽ <strong>+1 ponto</strong> — acertar os gols de uma das
                seleções.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              🔒 Bloqueio
            </h2>
            <p className="mt-2 text-gray-700">
              Depois que a rodada for bloqueada, os palpites daquela etapa não
              poderão mais ser alterados.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              📊 Ranking
            </h2>
            <p className="mt-2 text-gray-700">
              O ranking é atualizado conforme os resultados reais dos jogos são
              cadastrados.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}