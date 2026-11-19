// Cores do app (as mesmas do estilo.css da versão web), inspiradas no Material 3.
import { Platform } from "react-native";

export const CORES = {
  claro: {
    escuro: false,
    fundo: "#f5fafa",
    superficie: "#ffffff",
    superficie2: "#e9efee",
    texto: "#171d1d",
    textoSuave: "#4a5655",
    destaque: "#006a6a",
    sobreDestaque: "#ffffff",
    realce: "#b8ebe9",
    sobreRealce: "#002020",
    borda: "#d4dedd",
    barra: "#006a6a",
    sobreBarra: "#ffffff",
    botaoBarra: "rgba(255,255,255,0.14)",
    botaoBarraAtivo: "rgba(255,255,255,0.26)",
    marca: "#ffe27a",
    sobreMarca: "#1d1b00",
  },
  escuro: {
    escuro: true,
    fundo: "#0e1415",
    superficie: "#182122",
    superficie2: "#212b2c",
    texto: "#dde4e3",
    textoSuave: "#a9b6b5",
    destaque: "#80d5d4",
    sobreDestaque: "#003737",
    realce: "#004f50",
    sobreRealce: "#b8ebe9",
    borda: "#2c3839",
    barra: "#1b2627",
    sobreBarra: "#cfe7e6",
    botaoBarra: "rgba(255,255,255,0.07)",
    botaoBarraAtivo: "rgba(255,255,255,0.16)",
    marca: "#8a6d00",
    sobreMarca: "#fff8de",
  },
};

export const ALTURA_BARRA = 56;
export const ALTURA_RODAPE = 64;

/** Serifada para o texto bíblico (no Android, "serif" é a Noto Serif). */
export const FONTE_TEXTO = Platform.select({ ios: "Georgia", default: "serif" });
