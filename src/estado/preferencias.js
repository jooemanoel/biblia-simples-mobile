// Preferências visuais: tema (claro/escuro) e tamanho do texto. Ambas ficam salvas.
// Sem tema salvo, segue o tema do sistema.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import { CORES } from "../tema";
import { gravar, ler } from "./armazenamento";

export const FONTE_MIN = 12;
export const FONTE_MAX = 48;
const PASSO = 2;

function temaInicial() {
  const salvo = ler("tema");
  if (salvo === "claro" || salvo === "escuro") return salvo;
  return Appearance.getColorScheme() === "dark" ? "escuro" : "claro";
}

function fonteInicial() {
  const salvo = Number(ler("tamanhoFonte"));
  return salvo >= FONTE_MIN && salvo <= FONTE_MAX ? salvo : 18;
}

const Contexto = createContext(null);

export function PreferenciasProvider({ children }) {
  const [tema, setTema] = useState(temaInicial);
  const [tamanhoFonte, setTamanhoFonte] = useState(fonteInicial);

  useEffect(() => gravar("tamanhoFonte", String(tamanhoFonte)), [tamanhoFonte]);

  const valor = useMemo(
    () => ({
      tema,
      cores: CORES[tema],
      tamanhoFonte,
      alternarTema() {
        const novo = tema === "escuro" ? "claro" : "escuro";
        setTema(novo);
        gravar("tema", novo); // só grava quando o usuário escolhe
      },
      aumentarFonte: () => setTamanhoFonte((t) => Math.min(t + PASSO, FONTE_MAX)),
      diminuirFonte: () => setTamanhoFonte((t) => Math.max(t - PASSO, FONTE_MIN)),
    }),
    [tema, tamanhoFonte]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePreferencias() {
  return useContext(Contexto);
}
