// Copia o texto bíblico do projeto Vue (um JSON por livro) e gera, em src/dados/biblia/,
// um módulo JS por livro e o índice src/dados/biblia.js.
//
// O texto vai inteiro dentro do APK (funciona offline desde a instalação), mas cada
// livro só é lido quando aberto (require preguiçoso).
//
// Formato de cada módulo: module.exports = JSON.parse("...") com os caracteres
// não-ASCII escapados como \uXXXX dentro do JSON. Motivo: o Hermes (motor JS do app)
// compila um require("x.json") como código que monta os objetos, e guarda strings
// com acentos em UTF-16 (2 bytes por caractere). Com o JSON numa string só ASCII,
// o bytecode cai de ~25 MB para ~13 MB, e o JSON.parse ao abrir um livro é rápido.
//
// Uso: npm run dados [-- caminho/para/biblia]
//      (padrão: ../biblia-simples-vue/public/biblia — pastas ARA, NVI, NVT com 01..66.json)
const { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { join, resolve } = require("node:path");

const VERSOES = ["ARA", "NVI", "NVT"];
const TOTAL_LIVROS = 66;

const raiz = resolve(__dirname, "..");
const origem = resolve(process.argv[2] ?? join(raiz, "../biblia-simples-vue/public/biblia"));
const destino = join(raiz, "src/dados/biblia");

if (!existsSync(origem)) {
  console.error(`Pasta não encontrada: ${origem}`);
  process.exit(1);
}

const NAO_ASCII = /[^\x00-\x7f]/g;
const escapar = (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");

rmSync(destino, { recursive: true, force: true });

let indice = `// Gerado por scripts/dados.js — não editar à mão.
// BIBLIA[versao][livro]() devolve string[][] (capítulos → versículos).
/* eslint-disable */
export const BIBLIA = {\n`;

for (const versao of VERSOES) {
  mkdirSync(join(destino, versao), { recursive: true });
  indice += `  ${versao}: [\n`;
  for (let i = 1; i <= TOTAL_LIVROS; i++) {
    const nome = String(i).padStart(2, "0");
    const capitulos = JSON.parse(readFileSync(join(origem, versao, `${nome}.json`), "utf8"));
    const valido =
      Array.isArray(capitulos) && capitulos.every((c) => Array.isArray(c) && c.every((v) => typeof v === "string"));
    if (!valido) throw new Error(`${versao}/${nome}.json não é string[][]`);

    const json = JSON.stringify(capitulos).replace(NAO_ASCII, escapar);
    writeFileSync(join(destino, versao, `${nome}.js`), `module.exports = JSON.parse(${JSON.stringify(json)});\n`);
    indice += `    () => require("./biblia/${versao}/${nome}.js"),\n`;
  }
  indice += `  ],\n`;
}
indice += `};\n`;

writeFileSync(join(raiz, "src/dados/biblia.js"), indice);
console.log(`Gerado a partir de ${origem}: ${VERSOES.length * TOTAL_LIVROS} livros e src/dados/biblia.js`);
