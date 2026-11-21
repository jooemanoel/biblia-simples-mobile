# Bíblia Simples (React Native)

Leitura da Bíblia nas versões **ARA**, **NVI** e **NVT** para Android, feita em
React Native com Expo (SDK 58). Equivalente ao [biblia-simples-web](https://github.com/jooemanoel/biblia-simples-web),
com o texto inteiro embutido no app: funciona offline desde a instalação.

## Comandos

```bash
npm install
npm start          # servidor de desenvolvimento: ler o QR code com o app Expo Go no celular
npm run android    # compila e instala no emulador/celular via USB (precisa do Android SDK)
npm run lint       # ESLint (regras do Expo + React Compiler)
npm run dados      # regera src/dados/biblia a partir de ../biblia-simples-web/public/biblia
npm run icones     # regera os ícones e a splash em assets/
```

## Gerar o APK

### Opção 1 — na nuvem com EAS (não precisa de Android SDK)

```bash
npx eas-cli@latest login         # conta gratuita em expo.dev
npm run apk                      # = eas build -p android --profile apk
```

No primeiro build o EAS pergunta se pode criar o projeto e a chave de assinatura;
responda que sim. Ao final, ele mostra um link (e um QR code) para baixar o `.apk`.
O perfil `production` do [eas.json](eas.json) gera `.aab` para a Play Store.

### Opção 2 — local (precisa do Android SDK)

Requisitos (o Android Studio é opcional; bastam as command-line tools):

- JDK 17 a 21 em `JAVA_HOME`
- Android SDK em `ANDROID_HOME` (ex.: `%LOCALAPPDATA%\Android\Sdk`) com:
  `platform-tools`, `platforms/android-37.0`, `build-tools/37.0.0`,
  `ndk/27.1.12297006` e `cmake/3.31.6`
  (`sdkmanager "platforms/android-37.0" "build-tools/37.0.0" ...`)
- No Windows: caminhos longos ativos (`LongPathsEnabled = 1` no registro)

```bash
npm run apk:local
# APK em android/app/build/outputs/apk/release/app-release.apk
```

O primeiro build leva uns 6 minutos (os seguintes são mais rápidos). Como o
`prebuild --clean` apaga a pasta `android/`, copie o APK para outro lugar antes de
gerar outro.

O plugin [plugins/cmake-recente.js](plugins/cmake-recente.js) faz o build usar o
CMake 3.31.6: o ninja do CMake padrão (3.22.1) não aceita caminhos com mais de 260
caracteres no Windows e falha ao compilar o código nativo das bibliotecas.

O `prebuild` gera a pasta `android/` a partir do [app.json](app.json) (ela não é
versionada: não edite à mão). Sem uma chave própria, o release local é assinado com a
chave de depuração — serve para instalar no seu celular, não para publicar na loja.

## Estrutura

```
App.js                          tela única: barras, texto e janelas
src/dados/biblia/<VER>/NN.js    texto de cada livro (gerado por npm run dados)
src/dados/biblia.js             índice de require() preguiçosos (gerado)
src/dados/livros.json           nomes e nº de capítulos (comum às 3 versões)
src/estado/leitura.js           versão/livro/capítulo, texto e navegação
src/estado/preferencias.js      tema e tamanho do texto
src/estado/busca.js             estado da busca textual
src/estado/armazenamento.js     preferências salvas (expo-sqlite/kv-store)
src/busca/                      índice e normalização da busca
src/componentes/                barras, texto, janela de seleção, busca, ícones
src/tema.js                     cores (as mesmas do estilo.css da versão web)
```

## Diferenças em relação à versão Vue

| | Vue (PWA) | React Native |
|---|---|---|
| Texto | baixado por livro; service worker guarda offline | embutido no APK; offline desde o início |
| Busca | Web Worker | indexação em lotes na thread JS, com progresso |
| Janelas | `<dialog>` | `Modal` em forma de folha; botão "voltar" fecha |
| Tema | `localStorage` + `prefers-color-scheme` | `kv-store` + tema do sistema |
| Atalhos | ← → e `/` no teclado | — (botões na barra inferior) |

Detalhes de implementação:

- **Tamanho do texto no bundle.** Cada livro é gerado como `JSON.parse("...")` com
  acentos escapados (`á`), deixando a string só ASCII. Com `require("x.json")`,
  o Hermes gerava ~25 MB de bytecode (objetos montados em código e strings UTF-16);
  assim são ~15 MB.
- **Busca sem `\p{L}` / `normalize("NFD")`.** O suporte do Hermes a esses recursos não
  é garantido, então os acentos são removidos por tabela
  ([normalizar.js](src/busca/normalizar.js)). O resultado é idêntico ao da versão web nos
  93 mil versículos, exceto pelo `ʼ` da NVI ("dʼágua"), que aqui vira separador — assim,
  digitar `d'agua` também encontra.
- Os versículos podem ser selecionados e copiados (toque longo).

## Fonte dos textos

Os textos bíblicos vêm do repositório [damarals/biblias](https://github.com/damarals/biblias), de Daniel Amaral.

As traduções incluídas são protegidas por direitos autorais e pertencem às suas editoras:

| Versão | Editora |
|---|---|
| Almeida Revista e Atualizada (ARA) | Sociedade Bíblica do Brasil (SBB) |
| Nova Versão Internacional (NVI) | Biblica |
| Nova Versão Transformadora (NVT) | Editora Mundo Cristão |

Este é um projeto pessoal, sem fins lucrativos: não tem anúncios e não cobra nada. Os textos
não são cedidos sob nenhuma licença deste repositório. Se você representa uma dessas editoras
e deseja a remoção de algum texto, abra uma [issue](https://github.com/jooemanoel/biblia-simples-mobile/issues) e ele será retirado.
