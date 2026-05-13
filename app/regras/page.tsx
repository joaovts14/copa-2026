import Navbar from "../../components/Navbar";

export default function Regras() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-yellow-400 p-6">
      <div className="mx-auto max-w-4xl">
        <Navbar />

        <section className="rounded-2xl bg-white p-6 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-widest text-green-700">
            Bolão da Copa do Mundo 2026
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Regras do Bolão
          </h1>

          <p className="mt-3 text-gray-700">
            Palpite por rodada, pontuação por jogo e bônus especiais para jogos
            do Brasil e fases eliminatórias.
          </p>
        </section>

        <section className="mt-6 grid gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              🥇 Premiação
            </h2>

            <p className="mt-2 text-gray-700">
              O valor final será dividido entre os <strong>3 primeiros colocados</strong>.
              A distribuição final dependerá da quantidade de participantes.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              💰 Inscrição
            </h2>

            <div className="mt-3 rounded-xl bg-green-50 p-4">
              <p className="text-gray-800">
                Valor: <strong>R$ 35,00 por pessoa</strong>
              </p>
              <p className="mt-1 text-gray-800">
                Pagamento até o início do primeiro jogo.
              </p>
              <p className="mt-3 font-black text-green-800">
                Pix: 19993499551
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              📅 Preenchimento dos palpites
            </h2>

            <p className="mt-2 text-gray-700">
              Os palpites devem ser preenchidos <strong>por rodada</strong>.
            </p>

            <p className="mt-2 text-gray-700">
              O prazo para envio de cada rodada é até o início do primeiro jogo
              daquela rodada.
            </p>

            <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-800">
              <strong>Importante:</strong> após o início da rodada, os palpites
              ficam bloqueados e não poderão mais ser alterados.
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              ⚽ Pontuação — Fase de Grupos
            </h2>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl bg-green-50 p-4">
                <strong className="text-green-800">10 pontos</strong>
                <p className="text-gray-700">Placar exato.</p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4">
                <strong className="text-emerald-800">7 pontos</strong>
                <p className="text-gray-700">
                  Acertou vencedor/empate + saldo de gols.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <strong className="text-blue-800">5 pontos</strong>
                <p className="text-gray-700">
                  Acertou apenas vencedor/empate.
                </p>
              </div>

              <div className="rounded-xl bg-yellow-50 p-4">
                <strong className="text-yellow-800">2 pontos</strong>
                <p className="text-gray-700">
                  Acertou os gols de apenas uma das seleções.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              Bônus Brasil
            </h2>

            <p className="mt-2 text-gray-700">
              Todos os jogos da Seleção Brasileira valem{" "}
              <strong>+2 pontos</strong>.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              O bônus é aplicado quando o palpite pontua no jogo.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              🏅 Fases Eliminatórias
            </h2>

            <p className="mt-2 text-gray-700">
              Nas fases eliminatórias, a pontuação normal do placar é mantida.
              Além disso, há bônus por acertar o time classificado.
            </p>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <strong className="text-gray-900">Oitavas de Final</strong>
                <p className="text-gray-700">
                  Acertou o time classificado: <strong>+3 pontos</strong>.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <strong className="text-gray-900">Quartas de Final</strong>
                <p className="text-gray-700">
                  Acertou o time classificado: <strong>+5 pontos</strong>.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <strong className="text-gray-900">Semifinais</strong>
                <p className="text-gray-700">
                  Acertou o time classificado: <strong>+7 pontos</strong>.
                </p>
              </div>

              <div className="rounded-xl bg-yellow-50 p-4">
                <strong className="text-yellow-900">Final</strong>
                <p className="text-gray-700">
                  Acertou o campeão da Copa: <strong>+10 pontos</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-black text-gray-900">
              🏆 Empate em jogo eliminatório
            </h2>

            <p className="mt-2 text-gray-700">
              Caso o palpite em uma fase eliminatória seja empate, será
              necessário escolher qual seleção passa de fase.
            </p>

            <p className="mt-2 text-gray-700">
              Exemplo: <strong>Brasil 1 x 1 França</strong>. Nesse caso, o
              participante deverá indicar se quem passa é Brasil ou França.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}