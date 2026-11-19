// Estado da busca textual. O termo e os resultados ficam guardados enquanto o app
// está aberto: ao voltar à busca depois de abrir um versículo, a lista continua lá.
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as indice from "../busca/indice";
import { useLeitura } from "./leitura";

const POR_PAGINA = 100;
export const TAMANHO_MINIMO = 2;

const Contexto = createContext(null);

export function BuscaProvider({ children }) {
  const { versao } = useLeitura();
  const [termo, setTermo] = useState("");
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [buscando, setBuscando] = useState(false);
  /** Indexação da versão: { carregados, total } ou null quando pronta. */
  const [progresso, setProgresso] = useState(null);
  const [erro, setErro] = useState(false);

  const usada = useRef(false); // a busca já foi aberta alguma vez
  const ultimoId = useRef(0);
  const espera = useRef(null);
  // Valores atuais, lidos pelas funções assíncronas abaixo.
  const atual = useRef({ termo, itens, versao });
  useLayoutEffect(() => {
    atual.current = { termo, itens, versao };
  });

  /** Começa a indexar a versão atual (chamado ao abrir a janela de busca). */
  const preparar = useCallback(() => {
    usada.current = true;
    const sigla = atual.current.versao;
    const vigente = () => sigla === atual.current.versao;
    indice
      .preparar(sigla, (carregados, totalLivros) => {
        if (!vigente()) return;
        setErro(false);
        setProgresso(carregados < totalLivros ? { carregados, total: totalLivros } : null);
      })
      .then(() => {
        if (!vigente()) return;
        setErro(false);
        setProgresso(null);
      })
      .catch(() => {
        if (!vigente()) return;
        setProgresso(null);
        setErro(true);
      });
  }, []);

  const pedir = useCallback(async (inicio, termoPedido) => {
    const t = (termoPedido ?? atual.current.termo).trim();
    const id = ++ultimoId.current; // descarta respostas pendentes
    if (t.length < TAMANHO_MINIMO) {
      setItens([]);
      setTotal(0);
      setBuscando(false);
      return;
    }
    setBuscando(true);
    try {
      const r = await indice.buscar(atual.current.versao, t, inicio, POR_PAGINA);
      if (id !== ultimoId.current || !r) return;
      setItens(inicio === 0 ? r.itens : [...atual.current.itens, ...r.itens]);
      setTotal(r.total);
      setBuscando(false);
    } catch {
      if (id !== ultimoId.current) return;
      setBuscando(false);
      setErro(true);
    }
  }, []);

  /** Atualiza o termo e busca com um pequeno atraso enquanto o usuário digita. */
  const alterarTermo = useCallback(
    (novo) => {
      setTermo(novo);
      clearTimeout(espera.current);
      // Já indica "Buscando…" durante a espera, em vez de "Nenhum versículo encontrado".
      if (novo.trim().length >= TAMANHO_MINIMO) setBuscando(true);
      espera.current = setTimeout(() => pedir(0, novo), 250);
    },
    [pedir]
  );

  const buscarAgora = useCallback(() => {
    clearTimeout(espera.current);
    pedir(0);
  }, [pedir]);

  const carregarMais = useCallback(() => pedir(atual.current.itens.length), [pedir]);

  // Trocou a versão: refaz a busca no novo texto (se a busca já foi usada).
  // Roda depois que atual.current já reflete a nova versão.
  useEffect(() => {
    if (!usada.current) return;
    const t = setTimeout(() => {
      preparar();
      if (atual.current.termo.trim().length >= TAMANHO_MINIMO) buscarAgora();
    }, 0);
    return () => clearTimeout(t);
  }, [versao, preparar, buscarAgora]);

  useEffect(() => () => clearTimeout(espera.current), []);

  const valor = useMemo(
    () => ({ termo, itens, total, buscando, progresso, erro, preparar, alterarTermo, buscarAgora, carregarMais }),
    [termo, itens, total, buscando, progresso, erro, preparar, alterarTermo, buscarAgora, carregarMais]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useBusca() {
  return useContext(Contexto);
}
