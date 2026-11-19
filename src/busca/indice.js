// Índice da busca textual de uma versão (~31 mil versículos).
// No React Native não há Web Worker: a indexação é feita em lotes (um livro por vez),
// devolvendo o controle à interface entre os lotes para a tela não travar e para
// mostrar o progresso. Depois de pronto, cada busca leva poucos milissegundos.
import { BIBLIA } from "../dados/biblia";
import { marcarOcorrencias, normalizar } from "./normalizar";

const TOTAL_LIVROS = 66;
const LIVROS_POR_LOTE = 3;

let versaoAtual = null; // sigla da versão indexada (ou em indexação)
let pronto = null; //      Promise do índice da versão atual

// Índice: um item por versículo, em ordem bíblica.
let textos = [];
let normas = [];
let refs = []; // [livro, capitulo, versiculo] (base 0)

// Resultado da última busca (posições no índice), para paginar sem refazer.
let ultimoTermo = null;
let encontrados = [];

const ceder = () => new Promise((r) => setTimeout(r, 0));

/**
 * Indexa a versão (se ainda não indexada).
 * @param aoProgredir chamado com (carregados, total) durante a indexação
 */
export function preparar(sigla, aoProgredir) {
  if (sigla === versaoAtual && pronto) return pronto;
  versaoAtual = sigla;
  ultimoTermo = null;

  pronto = (async () => {
    const t = [];
    const n = [];
    const r = [];
    for (let livro = 0; livro < TOTAL_LIVROS; livro++) {
      if (sigla !== versaoAtual) throw new Error("versão trocada");
      BIBLIA[sigla][livro]().forEach((versiculos, capitulo) =>
        versiculos.forEach((texto, versiculo) => {
          t.push(texto);
          n.push(normalizar(texto));
          r.push([livro, capitulo, versiculo]);
        })
      );
      if ((livro + 1) % LIVROS_POR_LOTE === 0 || livro === TOTAL_LIVROS - 1) {
        aoProgredir?.(livro + 1, TOTAL_LIVROS);
        await ceder();
      }
    }
    if (sigla !== versaoAtual) throw new Error("versão trocada");
    textos = t;
    normas = n;
    refs = r;
  })();

  pronto.catch(() => {
    if (sigla === versaoAtual) pronto = null; // permite tentar de novo
  });
  return pronto;
}

/** Busca o termo na versão; devolve { total, itens } a partir de `inicio`. */
export async function buscar(sigla, termo, inicio, quantidade) {
  await preparar(sigla);
  if (sigla !== versaoAtual) return null;

  const t = normalizar(termo);
  if (t !== ultimoTermo) {
    ultimoTermo = t;
    encontrados = [];
    if (t) for (let i = 0; i < normas.length; i++) if (normas[i].includes(t)) encontrados.push(i);
  }

  const itens = encontrados.slice(inicio, inicio + quantidade).map((i) => {
    const [livro, capitulo, versiculo] = refs[i];
    return { livro, capitulo, versiculo, partes: marcarOcorrencias(textos[i], t) };
  });
  return { total: encontrados.length, itens };
}
