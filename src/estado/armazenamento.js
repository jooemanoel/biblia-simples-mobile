// Armazenamento local (chave → texto). Usa a API síncrona do kv-store do expo-sqlite,
// para o app já abrir no capítulo, tema e tamanho de texto salvos, sem "piscar".
import Storage from "expo-sqlite/kv-store";

export function ler(chave) {
  try {
    return Storage.getItemSync(chave);
  } catch {
    return null;
  }
}

export function gravar(chave, valor) {
  try {
    Storage.setItemSync(chave, valor);
  } catch {}
}

export function lerJson(chave) {
  try {
    return JSON.parse(ler(chave)) ?? {};
  } catch {
    return {};
  }
}
