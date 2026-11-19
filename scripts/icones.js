// Gera os ícones do app Android a partir do mesmo símbolo do PWA (projeto Vue):
// "book_2" do Material Symbols com uma cruz recortada na capa.
// Uso: npm run icones   (grava em assets/)
const { writeFileSync } = require("node:fs");
const { join } = require("node:path");
const sharp = require("sharp");

const COR_FUNDO = "#006a6a";
const COR_SIMBOLO = "#ffffff";

const SIMBOLO_LIVRO =
  "M290-80q-54 0-92-38t-38-92v-540q0-54 38-92t92-38h450q25 0 42.5 17.5T800-820v515q0 9-5 16.5T781-277q-19 8-30 26t-11 41q0 23 11 40.5t30 25.5q9 4 14 13t5 21q0 12-8.5 21T770-80H290Zm81.5-268.5Q380-357 380-370v-420q0-13-8.5-21.5T350-820q-13 0-21.5 8.5T320-790v420q0 13 8.5 21.5T350-340q13 0 21.5-8.5ZM290-140h409q-9-15-14-33t-5-37q0-20 5-37.5t15-32.5H290q-29 0-49.5 20.5T220-210q0 29 20.5 49.5T290-140Z";

// Cruz na capa: recortada com máscara, para funcionar também com fundo transparente.
const CRUZ = `
  <rect x="566" y="-740" width="48" height="320" rx="16" fill="#000"/>
  <rect x="486" y="-668" width="208" height="48" rx="16" fill="#000"/>`;

/**
 * @param tamanho   lado em pixels
 * @param proporcao fração do lado ocupada pelo símbolo
 * @param fundo     cor do fundo ou null (transparente)
 * @param cantos    raio dos cantos do fundo
 * @param cor       cor do símbolo
 */
function svg(tamanho, proporcao, fundo, cantos = 0, cor = COR_SIMBOLO) {
  const lado = tamanho * proporcao;
  const margem = (tamanho - lado) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 ${tamanho} ${tamanho}">
  ${fundo ? `<rect width="${tamanho}" height="${tamanho}" rx="${cantos}" fill="${fundo}"/>` : ""}
  <svg x="${margem}" y="${margem}" width="${lado}" height="${lado}" viewBox="0 -960 960 960">
    <defs><mask id="m"><rect x="0" y="-960" width="960" height="960" fill="#fff"/>${CRUZ}</mask></defs>
    <path d="${SIMBOLO_LIVRO}" fill="${cor}" mask="url(#m)"/>
  </svg>
</svg>`;
}

const ICONES = {
  // Ícone geral (iOS / lojas): quadrado cheio, o sistema arredonda.
  "icon.png": svg(1024, 0.6, COR_FUNDO),
  // Ícone adaptativo do Android: só ~66% central fica sempre visível.
  "android-icon-foreground.png": svg(1024, 0.42, null),
  "android-icon-background.png": svg(1024, 0, COR_FUNDO),
  "android-icon-monochrome.png": svg(1024, 0.42, null, 0, "#000000"),
  // Splash: símbolo branco sobre o fundo verde-azulado (definido no app.json).
  "splash-icon.png": svg(512, 0.9, null),
  "favicon.png": svg(48, 0.74, COR_FUNDO, 10),
};

(async () => {
  for (const [nome, conteudo] of Object.entries(ICONES)) {
    const destino = join(__dirname, "../assets", nome);
    writeFileSync(destino, await sharp(Buffer.from(conteudo)).png().toBuffer());
    console.log(`Gerado assets/${nome}`);
  }
})();
