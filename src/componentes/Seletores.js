// Conteúdo das janelas de versão, livro e capítulo.
import { useCallback, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { INICIO_NT, LIVROS, VERSOES, useLeitura } from "../estado/leitura";
import { usePreferencias } from "../estado/preferencias";
import { LARGURA_MAXIMA } from "./JanelaSeletor";

const ESPACO = 6;
const PADDING = 12;

/** Largura de cada célula de uma grade com colunas de pelo menos `minimo` px. */
function useLarguraCelula(minimo) {
  const { width } = useWindowDimensions();
  const util = Math.min(width, LARGURA_MAXIMA) - PADDING * 2;
  const colunas = Math.max(1, Math.floor((util + ESPACO) / (minimo + ESPACO)));
  return Math.floor((util - ESPACO * (colunas - 1)) / colunas);
}

/**
 * Rolagem que, ao abrir, já mostra o item atual centralizado
 * (ex.: Salmos, capítulo 119) sem precisar rolar.
 */
function useCentralizar() {
  const rolagem = useRef(null);
  const altura = useRef(0);
  const posicionado = useRef(false);

  const aoMedirLista = useCallback((e) => {
    altura.current = e.nativeEvent.layout.height;
  }, []);

  const centralizar = useCallback((y, h) => {
    if (posicionado.current) return;
    posicionado.current = true;
    rolagem.current?.scrollTo({ y: Math.max(0, y + h / 2 - altura.current / 2), animated: false });
  }, []);

  return { rolagem, aoMedirLista, centralizar };
}

function Celula({ texto, atual, largura, aoTocar, cores, estilo, aoMedirAtual }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: atual }}
      onPress={aoTocar}
      onLayout={atual ? aoMedirAtual : undefined}
      style={({ pressed }) => [
        estilos.celula,
        estilo,
        { width: largura, backgroundColor: atual ? cores.realce : pressed ? cores.borda : cores.superficie2 },
      ]}
    >
      <Text
        numberOfLines={2}
        style={[
          estilos.textoCelula,
          estilo === estilos.capitulo && estilos.textoCapitulo,
          { color: atual ? cores.sobreRealce : cores.texto },
          atual && estilos.textoAtual,
        ]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}

export function ListaVersoes({ aoEscolher }) {
  const { versao } = useLeitura();
  const { cores } = usePreferencias();
  return (
    <ScrollView contentContainerStyle={[estilos.corpo, { paddingVertical: 12 }]}>
      {VERSOES.map((v) => {
        const atual = v.sigla === versao;
        return (
          <Pressable
            key={v.sigla}
            accessibilityRole="button"
            accessibilityState={{ selected: atual }}
            onPress={() => aoEscolher(v.sigla)}
            style={({ pressed }) => [
              estilos.versao,
              { backgroundColor: atual ? cores.realce : pressed ? cores.superficie2 : "transparent" },
            ]}
          >
            <Text style={[estilos.siglaVersao, { color: atual ? cores.sobreRealce : cores.texto }]}>{v.sigla}</Text>
            <Text style={[estilos.nomeVersao, { color: atual ? cores.sobreRealce : cores.textoSuave }]}>{v.nome}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const TESTAMENTOS = [
  { nome: "Antigo Testamento", livros: LIVROS.slice(0, INICIO_NT).map((l, i) => ({ ...l, i })) },
  { nome: "Novo Testamento", livros: LIVROS.slice(INICIO_NT).map((l, i) => ({ ...l, i: i + INICIO_NT })) },
];

export function GradeLivros({ aoEscolher }) {
  const { livroId } = useLeitura();
  const { cores } = usePreferencias();
  const largura = useLarguraCelula(140);
  const secoes = useRef({});
  const { rolagem, aoMedirLista, centralizar } = useCentralizar();

  return (
    <ScrollView ref={rolagem} contentContainerStyle={estilos.corpo} onLayout={aoMedirLista}>
      {TESTAMENTOS.map((t, s) => (
        <View key={t.nome} onLayout={(e) => (secoes.current[s] = e.nativeEvent.layout.y)}>
          <Text style={[estilos.subtitulo, { color: cores.destaque }]}>{t.nome.toUpperCase()}</Text>
          <View style={estilos.grade}>
            {t.livros.map((l) => (
              <Celula
                key={l.i}
                texto={l.nome}
                atual={l.i === livroId}
                largura={largura}
                cores={cores}
                estilo={estilos.livro}
                aoTocar={() => aoEscolher(l.i)}
                aoMedirAtual={(e) => {
                  // y da célula é relativo à grade; soma o topo da seção e do título
                  const { y, height } = e.nativeEvent.layout;
                  requestAnimationFrame(() => centralizar((secoes.current[s] ?? 0) + 40 + y, height));
                }}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export function GradeCapitulos({ aoEscolher }) {
  const { livro, capituloId } = useLeitura();
  const { cores } = usePreferencias();
  const largura = useLarguraCelula(52);
  const { rolagem, aoMedirLista, centralizar } = useCentralizar();

  return (
    <ScrollView ref={rolagem} contentContainerStyle={estilos.corpo} onLayout={aoMedirLista}>
      <View style={[estilos.grade, { paddingTop: 8 }]}>
        {Array.from({ length: livro.capitulos }, (_, n) => (
          <Celula
            key={n}
            texto={String(n + 1)}
            atual={n === capituloId}
            largura={largura}
            cores={cores}
            estilo={estilos.capitulo}
            aoTocar={() => aoEscolher(n)}
            aoMedirAtual={(e) => {
              const { y, height } = e.nativeEvent.layout;
              requestAnimationFrame(() => centralizar(8 + y, height));
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  corpo: {
    paddingHorizontal: PADDING,
    paddingTop: 8,
    paddingBottom: 16,
  },
  subtitulo: {
    marginTop: 14,
    marginBottom: 8,
    marginHorizontal: 8,
    height: 18,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ESPACO,
  },
  celula: {
    minHeight: 46,
    borderRadius: 12,
    justifyContent: "center",
  },
  livro: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  capitulo: {
    alignItems: "center",
  },
  textoCelula: {
    fontSize: 16,
  },
  textoCapitulo: {
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  textoAtual: {
    fontWeight: "700",
  },
  versao: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  siglaVersao: {
    minWidth: 48,
    fontSize: 17,
    fontWeight: "700",
  },
  nomeVersao: {
    flexShrink: 1,
    fontSize: 16,
  },
});
