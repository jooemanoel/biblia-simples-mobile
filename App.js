import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BarraInferior from "./src/componentes/BarraInferior";
import BarraSuperior from "./src/componentes/BarraSuperior";
import BuscaTexto from "./src/componentes/BuscaTexto";
import JanelaSeletor from "./src/componentes/JanelaSeletor";
import { GradeCapitulos, GradeLivros, ListaVersoes } from "./src/componentes/Seletores";
import TextoCapitulo from "./src/componentes/TextoCapitulo";
import { BuscaProvider } from "./src/estado/busca";
import { LIVROS, LeituraProvider, useLeitura } from "./src/estado/leitura";
import { PreferenciasProvider, usePreferencias } from "./src/estado/preferencias";

const TITULOS = { versao: "Versão", livro: "Livro", capitulo: "Capítulo", busca: "Buscar" };

function Leitor() {
  const leitura = useLeitura();
  const { cores } = usePreferencias();

  /** Janela aberta: "versao", "livro", "capitulo", "busca" ou null. */
  const [janela, setJanela] = useState(null);
  const fechar = () => setJanela(null);

  // Cor da janela nativa (aparece atrás do app em transições e ao girar a tela).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(cores.fundo).catch(() => {});
  }, [cores.fundo]);

  const titulo = janela === "capitulo" ? leitura.livro.nome : TITULOS[janela] ?? "";

  return (
    <View style={[estilos.app, { backgroundColor: cores.fundo }]}>
      {/* As duas barras são escuras nos dois temas: ícones do sistema sempre claros. */}
      <StatusBar style="light" />
      <NavigationBar style="light" />

      <BarraSuperior aoAbrir={setJanela} />
      <View style={estilos.leitura}>
        <TextoCapitulo />
      </View>
      <BarraInferior aoBuscar={() => setJanela("busca")} />

      <JanelaSeletor titulo={titulo} aberta={janela !== null} alta={janela === "busca"} aoFechar={fechar}>
        {janela === "busca" && (
          <BuscaTexto
            aoEscolher={(r) => {
              leitura.irParaVersiculo(r);
              fechar();
            }}
          />
        )}
        {janela === "versao" && (
          <ListaVersoes
            aoEscolher={(sigla) => {
              leitura.selecionarVersao(sigla);
              fechar();
            }}
          />
        )}
        {janela === "livro" && (
          <GradeLivros
            aoEscolher={(i) => {
              // Depois do livro, já abre a escolha do capítulo (exceto livros de capítulo único).
              leitura.selecionarLivro(i);
              setJanela(LIVROS[i].capitulos > 1 ? "capitulo" : null);
            }}
          />
        )}
        {janela === "capitulo" && (
          <GradeCapitulos
            aoEscolher={(i) => {
              leitura.selecionarCapitulo(i);
              fechar();
            }}
          />
        )}
      </JanelaSeletor>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PreferenciasProvider>
        <LeituraProvider>
          <BuscaProvider>
            <Leitor />
          </BuscaProvider>
        </LeituraProvider>
      </PreferenciasProvider>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  app: {
    flex: 1,
  },
  leitura: {
    flex: 1,
  },
});
