import { Pressable, StyleSheet } from "react-native";
import Icone from "./Icone";

/** Botão redondo com um ícone (usado nas barras e no cabeçalho das janelas). */
export default function BotaoIcone({ icone, rotulo, aoTocar, desativado, cor, fundo, fundoAtivo }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: !!desativado }}
      disabled={desativado}
      onPress={aoTocar}
      hitSlop={4}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: pressed && !desativado ? fundoAtivo : fundo },
        desativado && estilos.desativado,
      ]}
    >
      <Icone nome={icone} cor={cor} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  desativado: {
    opacity: 0.38,
  },
});
