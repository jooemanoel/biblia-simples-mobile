// Janela de seleção (versão, livro, capítulo ou busca): "folha" vinda de baixo no
// celular, centralizada em telas largas. Fecha no botão X, tocando no fundo
// escurecido ou com o botão "voltar" do Android.
import { useEffect, useState } from "react";
import { Keyboard, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePreferencias } from "../estado/preferencias";
import BotaoIcone from "./BotaoIcone";

export const LARGURA_MAXIMA = 640;
const LARGURA_CENTRALIZADA = 700;

/** Altura do teclado virtual (com edge-to-edge, a janela não encolhe sozinha). */
function useAlturaTeclado() {
  const [altura, setAltura] = useState(0);
  useEffect(() => {
    const abrir = Keyboard.addListener("keyboardDidShow", (e) => setAltura(e.endCoordinates.height));
    const fechar = Keyboard.addListener("keyboardDidHide", () => setAltura(0));
    return () => {
      abrir.remove();
      fechar.remove();
    };
  }, []);
  return altura;
}

export default function JanelaSeletor({ titulo, aberta, alta, aoFechar, children }) {
  const { cores } = usePreferencias();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const teclado = useAlturaTeclado();

  const centralizada = width >= LARGURA_CENTRALIZADA;
  const alturaMaxima = Math.min((height - teclado) * 0.85, 760);

  return (
    <Modal
      visible={aberta}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={aoFechar}
    >
      <View
        style={[
          estilos.fundo,
          centralizada ? estilos.fundoCentralizado : null,
          { paddingBottom: centralizada ? 0 : teclado },
        ]}
      >
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.45)" }]}
          onPress={aoFechar}
          accessibilityLabel="Fechar"
        />
        <View
          accessibilityViewIsModal
          style={[
            estilos.janela,
            centralizada ? estilos.janelaCentralizada : null,
            {
              backgroundColor: cores.superficie,
              maxHeight: alturaMaxima,
              height: alta ? alturaMaxima : undefined,
              paddingBottom: centralizada || teclado ? 0 : insets.bottom,
            },
          ]}
        >
          <View style={[estilos.cabecalho, { borderBottomColor: cores.borda }]}>
            <Text accessibilityRole="header" style={[estilos.titulo, { color: cores.texto }]}>
              {titulo}
            </Text>
            <BotaoIcone
              icone="fechar"
              rotulo="Fechar"
              aoTocar={aoFechar}
              cor={cores.texto}
              fundo="transparent"
              fundoAtivo={cores.superficie2}
            />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  fundoCentralizado: {
    justifyContent: "center",
  },
  janela: {
    width: "100%",
    maxWidth: LARGURA_MAXIMA,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    elevation: 24,
  },
  janelaCentralizada: {
    borderRadius: 24,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 6,
    paddingLeft: 20,
    paddingRight: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "600",
  },
});
