import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLeitura } from "../estado/leitura";
import { usePreferencias } from "../estado/preferencias";
import { ALTURA_BARRA } from "../tema";
import Icone from "./Icone";

function BotaoBarra({ rotulo, texto, aoTocar, flexivel, cores }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={aoTocar}
      android_ripple={{ color: cores.botaoBarraAtivo, borderless: false }}
      style={({ pressed }) => [
        estilos.botao,
        flexivel && estilos.botaoLivro,
        pressed && { backgroundColor: cores.botaoBarraAtivo },
      ]}
    >
      <Text numberOfLines={1} style={[estilos.texto, { color: cores.sobreBarra }, flexivel && estilos.encolher]}>
        {texto}
      </Text>
      <Icone nome="expandir" cor={cores.sobreBarra} tamanho={20} opacidade={0.8} />
    </Pressable>
  );
}

export default function BarraSuperior({ aoAbrir }) {
  const { versao, livro, capituloId } = useLeitura();
  const { cores } = usePreferencias();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        estilos.barra,
        {
          backgroundColor: cores.barra,
          paddingTop: insets.top,
          height: ALTURA_BARRA + insets.top,
          paddingLeft: Math.max(8, insets.left),
          paddingRight: Math.max(8, insets.right),
        },
      ]}
    >
      <View style={estilos.conteudo}>
        <BotaoBarra rotulo="Escolher versão" texto={versao} aoTocar={() => aoAbrir("versao")} cores={cores} />
        <BotaoBarra
          rotulo="Escolher livro"
          texto={livro.nome}
          aoTocar={() => aoAbrir("livro")}
          flexivel
          cores={cores}
        />
        <BotaoBarra
          rotulo="Escolher capítulo"
          texto={String(capituloId + 1)}
          aoTocar={() => aoAbrir("capitulo")}
          cores={cores}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    elevation: 4,
    zIndex: 10,
  },
  conteudo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 0,
    height: 40,
    paddingLeft: 14,
    paddingRight: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  botaoLivro: {
    flex: 1,
    justifyContent: "center",
  },
  encolher: {
    flexShrink: 1,
  },
  texto: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
