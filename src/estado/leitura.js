// Estado da leitura: versão, livro e capítulo abertos, e o texto exibido.
// O texto vem embutido no app (src/dados/biblia), então abrir um capítulo é imediato
// e funciona offline desde a instalação.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BIBLIA } from "../dados/biblia";
import LIVROS from "../dados/livros.json";
import { gravar, lerJson } from "./armazenamento";

export { LIVROS };

export const VERSOES = [
  { sigla: "ARA", nome: "Almeida Revista e Atualizada" },
  { sigla: "NVI", nome: "Nova Versão Internacional" },
  { sigla: "NVT", nome: "Nova Versão Transformadora" },
];

/** Índice do primeiro livro do Novo Testamento (Mateus). */
export const INICIO_NT = 39;

const ULTIMO_LIVRO = LIVROS.length - 1;

export function referencia(posicao) {
  return posicao ? `${LIVROS[posicao.livro].nome} ${posicao.capitulo + 1}` : "";
}

export function nomeVersao(sigla) {
  return VERSOES.find((v) => v.sigla === sigla)?.nome ?? sigla;
}

// ---------- estado salvo ----------

function inteiroEntre(valor, min, max) {
  return Number.isInteger(valor) && valor >= min && valor <= max ? valor : min;
}

function estadoInicial() {
  const salvo = lerJson("leitura");
  const versao = VERSOES.some((v) => v.sigla === salvo.versao) ? salvo.versao : "NVT";
  const livro = inteiroEntre(salvo.livro, 0, ULTIMO_LIVRO);
  const capitulo = inteiroEntre(salvo.capitulo, 0, LIVROS[livro].capitulos - 1);
  return { versao, livro, capitulo };
}

// ---------- navegação ----------

/** Posição anterior, atravessando livros (Êxodo 1 → Gênesis 50). */
function posicaoAnterior({ livro, capitulo }) {
  if (capitulo > 0) return { livro, capitulo: capitulo - 1 };
  if (livro > 0) return { livro: livro - 1, capitulo: LIVROS[livro - 1].capitulos - 1 };
  return null;
}

/** Posição seguinte, atravessando livros (Gênesis 50 → Êxodo 1). */
function posicaoSeguinte({ livro, capitulo }) {
  if (capitulo < LIVROS[livro].capitulos - 1) return { livro, capitulo: capitulo + 1 };
  if (livro < ULTIMO_LIVRO) return { livro: livro + 1, capitulo: 0 };
  return null;
}

// ---------- contexto ----------

const Contexto = createContext(null);

export function LeituraProvider({ children }) {
  const [pos, setPos] = useState(estadoInicial);
  /** Versículo a destacar ao exibir o capítulo (vindo da busca). */
  const [versiculoAlvo, setVersiculoAlvo] = useState(null);

  useEffect(() => gravar("leitura", JSON.stringify(pos)), [pos]);

  const versiculos = useMemo(
    () => BIBLIA[pos.versao][pos.livro]()[pos.capitulo] ?? [],
    [pos.versao, pos.livro, pos.capitulo]
  );

  const irPara = useCallback((p) => {
    if (p) setPos((atual) => ({ ...atual, livro: p.livro, capitulo: p.capitulo }));
  }, []);

  const valor = useMemo(() => {
    const anterior = posicaoAnterior(pos);
    const seguinte = posicaoSeguinte(pos);
    return {
      versao: pos.versao,
      livroId: pos.livro,
      capituloId: pos.capitulo,
      livro: LIVROS[pos.livro],
      versiculos,
      anterior,
      seguinte,
      versiculoAlvo,
      limparAlvo: () => setVersiculoAlvo(null),
      /** Abre o capítulo e rola até o versículo ({ livro, capitulo, versiculo }). */
      irParaVersiculo(r) {
        irPara(r);
        setVersiculoAlvo({ livro: r.livro, capitulo: r.capitulo, versiculo: r.versiculo });
      },
      selecionarVersao: (versao) => setPos((atual) => ({ ...atual, versao })),
      selecionarLivro: (livro) => irPara({ livro, capitulo: 0 }),
      selecionarCapitulo: (capitulo) => setPos((atual) => ({ ...atual, capitulo })),
      voltar: () => irPara(anterior),
      avancar: () => irPara(seguinte),
    };
  }, [pos, versiculos, versiculoAlvo, irPara]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useLeitura() {
  return useContext(Contexto);
}
