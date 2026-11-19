import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLeitura, LIVROS, nomeVersao } from "../estado/leitura";
import { usePreferencias } from "../estado/preferencias";
import { FONTE_TEXTO } from "../tema";

const Versiculo = memo(function Versiculo({ numero, texto, destacado, tamanho, cores, aoMedir }) {
  return (
    <View
      onLayout={(e) => aoMedir(numero - 1, e.nativeEvent.layout)}
      style={[estilos.versiculo, destacado && { backgroundColor: cores.realce }]}
    >
      <Text
        selectable
        style={{
          fontFamily: FONTE_TEXTO,
          fontSize: tamanho,
          lineHeight: Math.round(tamanho * 1.65),
          color: destacado ? cores.sobreRealce : cores.texto,
        }}
      >
        <Text style={[estilos.numero, { fontSize: Math.round(tamanho * 0.62), color: cores.destaque }]}>
          {numero}
          {" "}
        </Text>
        {texto}
      </Text>
    </View>
  );
});

export default function TextoCapitulo() {
  const { versao, livroId, capituloId, versiculos, versiculoAlvo, limparAlvo } = useLeitura();
  const { cores, tamanhoFonte } = usePreferencias();

  const rolagem = useRef(null);
  const posicoes = useRef([]); //    layout de cada versículo (relativo ao conteúdo)
  const alturaTela = useRef(0);
  const [destacado, setDestacado] = useState(null);

  // Ao trocar de capítulo (não de versão), volta ao topo.
  useEffect(() => {
    posicoes.current = [];
    rolagem.current?.scrollTo({ y: 0, animated: false });
  }, [livroId, capituloId]);

  // Valores atuais em ref: aoMedir fica estável e o memo dos versículos funciona.
  // Declarado antes dos outros efeitos: eles já leem os valores deste render.
  const atual = useRef({ versiculoAlvo, livroId, capituloId, limparAlvo });
  useLayoutEffect(() => {
    atual.current = { versiculoAlvo, livroId, capituloId, limparAlvo };
  });

  // Versículo vindo da busca: rola até ele (quando já medido) e o destaca por alguns segundos.
  const tentarRolarAteAlvo = useCallback(() => {
    const { versiculoAlvo: alvo, livroId: l, capituloId: c, limparAlvo: limpar } = atual.current;
    if (!alvo || alvo.livro !== l || alvo.capitulo !== c) return;
    const p = posicoes.current[alvo.versiculo];
    if (!p) return; // ainda não medido: tenta de novo em aoMedir
    limpar();
    const y = Math.max(0, p.y + p.height / 2 - alturaTela.current / 2);
    rolagem.current?.scrollTo({ y, animated: false });
    setDestacado(alvo.versiculo);
  }, []);

  useEffect(tentarRolarAteAlvo, [versiculoAlvo, livroId, capituloId, tentarRolarAteAlvo]);

  useEffect(() => {
    if (destacado === null) return;
    const t = setTimeout(() => setDestacado(null), 2500);
    return () => clearTimeout(t);
  }, [destacado]);

  const aoMedir = useCallback(
    (indice, layout) => {
      posicoes.current[indice] = layout;
      if (atual.current.versiculoAlvo?.versiculo === indice) tentarRolarAteAlvo();
    },
    [tentarRolarAteAlvo]
  );

  return (
    <ScrollView
      ref={rolagem}
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={estilos.conteudo}
      onLayout={(e) => (alturaTela.current = e.nativeEvent.layout.height)}
    >
      <View style={estilos.titulo}>
        <Text style={[estilos.tituloTexto, { color: cores.texto, fontSize: Math.round(tamanhoFonte * 1.35) }]}>
          {LIVROS[livroId].nome} {capituloId + 1}
        </Text>
        <Text
          accessibilityLabel={nomeVersao(versao)}
          style={[
            estilos.selo,
            { color: cores.destaque, borderColor: cores.destaque, fontSize: Math.round(tamanhoFonte * 0.68) },
          ]}
        >
          {versao}
        </Text>
      </View>

      {versiculos.map((texto, i) => (
        <Versiculo
          key={`${versao}-${livroId}-${capituloId}-${i}`}
          numero={i + 1}
          texto={texto}
          destacado={destacado === i}
          tamanho={tamanhoFonte}
          cores={cores}
          aoMedir={aoMedir}
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 28,
  },
  titulo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  tituloTexto: {
    fontFamily: FONTE_TEXTO,
    fontWeight: "600",
    textAlign: "center",
  },
  selo: {
    fontWeight: "600",
    letterSpacing: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  versiculo: {
    marginBottom: 6,
    marginHorizontal: -6,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  numero: {
    fontWeight: "700",
  },
});
