import { memo, useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { TAMANHO_MINIMO, useBusca } from "../estado/busca";
import { LIVROS, useLeitura } from "../estado/leitura";
import { usePreferencias } from "../estado/preferencias";
import { FONTE_TEXTO } from "../tema";

const formatar = (n) => n.toLocaleString("pt-BR");
const referencia = (r) => `${LIVROS[r.livro].nome} ${r.capitulo + 1}:${r.versiculo + 1}`;

const Resultado = memo(function Resultado({ r, cores, aoEscolher }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => aoEscolher(r)}
      style={({ pressed }) => [estilos.resultado, pressed && { backgroundColor: cores.superficie2 }]}
    >
      <Text style={[estilos.referencia, { color: cores.destaque }]}>{referencia(r)}</Text>
      <Text style={[estilos.trecho, { color: cores.texto }]}>
        {r.partes.map(([texto, marcado], i) =>
          marcado ? (
            <Text key={i} style={{ backgroundColor: cores.marca, color: cores.sobreMarca }}>
              {texto}
            </Text>
          ) : (
            texto
          )
        )}
      </Text>
    </Pressable>
  );
});

export default function BuscaTexto({ aoEscolher }) {
  const { versao } = useLeitura();
  const { cores } = usePreferencias();
  const { termo, itens, total, buscando, progresso, erro, preparar, alterarTermo, buscarAgora, carregarMais } =
    useBusca();

  useEffect(preparar, [preparar]);

  const termoValido = termo.trim().length >= TAMANHO_MINIMO;

  let estado;
  if (erro) estado = "Não foi possível preparar a busca. Tente de novo.";
  else if (progresso) estado = `Preparando a busca na ${versao}… ${progresso.carregados}/${progresso.total} livros`;
  else if (!termoValido) estado = "Digite uma palavra ou trecho. Acentos, maiúsculas e pontuação são ignorados.";
  else if (buscando) estado = "Buscando…";
  else if (!total) estado = "Nenhum versículo encontrado.";
  else estado = `${formatar(total)} ${total === 1 ? "versículo encontrado" : "versículos encontrados"}`;

  return (
    <View style={estilos.busca}>
      <View style={estilos.campo}>
        <TextInput
          value={termo}
          onChangeText={alterarTermo}
          onSubmitEditing={buscarAgora}
          autoFocus
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          placeholder={`Buscar na ${versao}…`}
          placeholderTextColor={cores.textoSuave}
          accessibilityLabel="Texto a buscar"
          selectionColor={cores.destaque}
          cursorColor={cores.destaque}
          style={[
            estilos.entrada,
            { backgroundColor: cores.superficie2, borderColor: cores.borda, color: cores.texto },
          ]}
        />
      </View>

      <Text accessibilityLiveRegion="polite" style={[estilos.estado, { color: cores.textoSuave }]}>
        {estado}
      </Text>

      <FlatList
        data={termoValido ? itens : []}
        keyExtractor={(r) => `${r.livro}-${r.capitulo}-${r.versiculo}`}
        renderItem={({ item }) => <Resultado r={item} cores={cores} aoEscolher={aoEscolher} />}
        ItemSeparatorComponent={() => <View style={[estilos.separador, { backgroundColor: cores.borda }]} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={estilos.lista}
        initialNumToRender={12}
        ListFooterComponent={
          termoValido && itens.length < total ? (
            <Pressable
              accessibilityRole="button"
              disabled={buscando}
              onPress={carregarMais}
              style={[estilos.mais, { backgroundColor: cores.destaque }, buscando && { opacity: 0.38 }]}
            >
              <Text style={[estilos.textoMais, { color: cores.sobreDestaque }]}>
                Mostrar mais ({formatar(total - itens.length)} restantes)
              </Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  busca: {
    flex: 1,
  },
  campo: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  entrada: {
    height: 48,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderRadius: 24,
    fontSize: 17,
  },
  estado: {
    marginTop: 4,
    marginBottom: 10,
    marginHorizontal: 20,
    fontSize: 14,
  },
  lista: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  resultado: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  separador: {
    height: StyleSheet.hairlineWidth,
  },
  referencia: {
    marginBottom: 2,
    fontSize: 13,
    fontWeight: "700",
  },
  trecho: {
    fontFamily: FONTE_TEXTO,
    fontSize: 16,
    lineHeight: 24,
  },
  mais: {
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  textoMais: {
    fontWeight: "600",
    fontSize: 16,
  },
});
