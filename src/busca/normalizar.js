// Normalização usada na busca: ignora maiúsculas, acentos e pontuação.
//   "Não matarás!"        -> "nao mataras"
//   "No princípio, Deus"  -> "no principio deus"
//   "bem-aventurados"     -> "bem aventurados"
// Pontuação e espaços viram um único espaço; letras e números são mantidos.
//
// Diferente da versão web, não usa String.normalize("NFD") nem /\p{L}/u: o suporte
// do Hermes (motor JS do React Native) a esses recursos não é garantido. Os acentos
// são removidos por uma tabela, que cobre todos os caracteres latinos do texto.

const ACENTOS = {
  a: "àáâãäåāăą",
  c: "çćĉċč",
  d: "ď",
  e: "èéêëēĕėęě",
  g: "ĝğġģ",
  h: "ĥ",
  i: "ìíîïĩīĭįı",
  j: "ĵ",
  k: "ķ",
  l: "ĺļľ",
  n: "ñńņňŉ",
  o: "òóôõöøōŏő",
  r: "ŕŗř",
  s: "śŝşš",
  t: "ţť",
  u: "ùúûüũūŭůűų",
  w: "ŵ",
  y: "ýÿŷ",
  z: "źżž",
  ae: "æ",
  oe: "œ",
  ss: "ß",
};

/** Caractere (já em minúsculas) → base sem acento. */
const BASE = new Map();
for (const [base, letras] of Object.entries(ACENTOS)) for (const c of letras) BASE.set(c, base);

const ASCII_PALAVRA = /[a-z0-9]/;

/**
 * Converte um caractere (em minúsculas) no que ele vira no texto normalizado:
 * letras/números (sem acento), " " (separador) ou "" (acento solto, ignorado).
 */
function converter(c) {
  if (ASCII_PALAVRA.test(c)) return c;
  const base = BASE.get(c);
  if (base) return base;
  const codigo = c.charCodeAt(0);
  if (codigo >= 0x300 && codigo <= 0x36f) return ""; // marca combinante isolada
  // Outras letras (grego, hebraico…): mantidas; o resto é separador.
  return c.toUpperCase() !== c.toLowerCase() ? c : " ";
}

const NAO_ASCII_PALAVRA = /[^a-z0-9 ]/g;
const ESPACOS = / {2,}/g;

/** Versão rápida, usada para indexar todos os versículos e o termo buscado. */
export function normalizar(texto) {
  return texto.toLowerCase().replace(NAO_ASCII_PALAVRA, converter).replace(ESPACOS, " ").trim();
}

/**
 * Versão caractere a caractere, que também devolve onde cada caractere normalizado
 * está no texto original. Gera exatamente o mesmo texto que normalizar(), e é usada
 * só nos versículos encontrados, para marcar o trecho certo no texto original.
 */
export function normalizarComMapa(texto) {
  let norm = "";
  const inicio = []; // inicio[i] = posição no original do caractere que gerou norm[i]
  const fim = []; //    fim[i]    = posição seguinte ao fim desse caractere
  for (let i = 0; i < texto.length; ) {
    const ponto = texto.codePointAt(i);
    const largura = ponto > 0xffff ? 2 : 1;
    const c = texto.slice(i, i + largura).toLowerCase();
    const base = c.length === 1 ? converter(c) : c.toUpperCase() !== c ? c : " ";
    if (!base) {
      // acento solto: ignorado
    } else if (base !== " ") {
      for (const ch of base) {
        norm += ch;
        inicio.push(i);
        fim.push(i + largura);
      }
    } else if (norm && norm[norm.length - 1] !== " ") {
      norm += " ";
      inicio.push(i);
      fim.push(i + largura);
    }
    i += largura;
  }
  if (norm.endsWith(" ")) {
    norm = norm.slice(0, -1);
    inicio.pop();
    fim.pop();
  }
  return { norm, inicio, fim };
}

/**
 * Divide o texto original em partes [texto, marcado] com todas as ocorrências
 * do termo (já normalizado) marcadas.
 */
export function marcarOcorrencias(texto, termo) {
  const { norm, inicio, fim } = normalizarComMapa(texto);
  const partes = [];
  let cursor = 0;
  for (let p = norm.indexOf(termo); p !== -1; p = norm.indexOf(termo, p + termo.length)) {
    const de = inicio[p];
    const ate = fim[p + termo.length - 1];
    if (de > cursor) partes.push([texto.slice(cursor, de), false]);
    partes.push([texto.slice(de, ate), true]);
    cursor = ate;
  }
  if (cursor < texto.length) partes.push([texto.slice(cursor), false]);
  return partes;
}
