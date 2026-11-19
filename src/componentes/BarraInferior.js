import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { referencia, useLeitura } from "../estado/leitura";
import { FONTE_MAX, FONTE_MIN, usePreferencias } from "../estado/preferencias";
import { ALTURA_RODAPE } from "../tema";
import BotaoIcone from "./BotaoIcone";

export default function BarraInferior({ aoBuscar }) {
  const { anterior, seguinte, voltar, avancar } = useLeitura();
  const { tema, cores, tamanhoFonte, alternarTema, aumentarFonte, diminuirFonte } = usePreferencias();
  const insets = useSafeAreaInsets();

  const botao = { cor: cores.sobreBarra, fundo: cores.botaoBarra, fundoAtivo: cores.botaoBarraAtivo };

  return (
    <View
      style={[
        estilos.barra,
        {
          backgroundColor: cores.barra,
          height: ALTURA_RODAPE + insets.bottom,
          paddingBottom: insets.bottom,
          paddingLeft: Math.max(12, insets.left),
          paddingRight: Math.max(12, insets.right),
        },
      ]}
    >
      <View style={estilos.conteudo}>
        <View style={estilos.grupo}>
          <BotaoIcone
            {...botao}
            icone="fonteMenor"
            rotulo="Diminuir texto"
            desativado={tamanhoFonte <= FONTE_MIN}
            aoTocar={diminuirFonte}
          />
          <BotaoIcone
            {...botao}
            icone="fonteMaior"
            rotulo="Aumentar texto"
            desativado={tamanhoFonte >= FONTE_MAX}
            aoTocar={aumentarFonte}
          />
        </View>

        <View style={estilos.grupo}>
          <BotaoIcone
            {...botao}
            icone={tema === "escuro" ? "temaClaro" : "temaEscuro"}
            rotulo={tema === "escuro" ? "Usar tema claro" : "Usar tema escuro"}
            aoTocar={alternarTema}
          />
          <BotaoIcone {...botao} icone="buscar" rotulo="Buscar no texto" aoTocar={aoBuscar} />
        </View>

        <View style={estilos.grupo}>
          <BotaoIcone
            {...botao}
            icone="anterior"
            rotulo={anterior ? `Anterior: ${referencia(anterior)}` : "Capítulo anterior"}
            desativado={!anterior}
            aoTocar={voltar}
          />
          <BotaoIcone
            {...botao}
            icone="seguinte"
            rotulo={seguinte ? `Próximo: ${referencia(seguinte)}` : "Próximo capítulo"}
            desativado={!seguinte}
            aoTocar={avancar}
          />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    elevation: 6,
  },
  conteudo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  grupo: {
    flexDirection: "row",
    gap: 8,
  },
});
