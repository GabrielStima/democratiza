# Democratiza — Especificação de execução

> Como construir o site, em ordem, tela a tela. Complementa o [`ARQUITETURA.md`](ARQUITETURA.md), que explica **o quê e por quê**; este documento diz **o que entregar em cada etapa**.
> Todo o conteúdo usado nas etapas é **Lorem Ipsum** (seção 2). O conteúdo real entra por último, só adicionando pastas e JSONs em `content/`.

---

## 1. Como usar este documento

### Convenções
- **Milestone (M0, M1…):** um bloco de trabalho que termina com algo que dá para abrir, clicar e conferir. Os milestones são sequenciais; cada um só começa quando o anterior está pronto.
- **Design de referência:** cada tela cita o nome da prancha no arquivo de design *"Democratiza — Design"*, página *Site (desktop)*. Ex.: *"Lição · 4. Checagem (pergunta)"*.
- **Tamanho:** P ≈ 1 a 2 dias, M ≈ 3 a 5 dias, G ≈ 1 a 2 semanas, para uma pessoa trabalhando com IA. São estimativas grosseiras, só para comparar um milestone com outro.
- **Telas:** o design foi feito em 1440 px de largura. Entregar bem de **1024 px para cima**. Abaixo disso o layout não pode quebrar (nada cortado, sem rolagem horizontal), mas sem acabamento: a versão para celular fica para a v2.

### Definição de pronto (vale para toda tela)
1. `tsc --noEmit`, ESLint e Prettier sem erros.
2. A lógica nova tem testes Vitest e o fluxo novo tem ao menos um teste Playwright.
3. A tela confere com a prancha em 1440 px (conferência a olho, não precisa ser idêntica ao pixel) e usa só tokens de `tokens.css`, sem cores soltas no código.
4. Tudo funciona só com o teclado (Tab, Enter, Espaço, Esc), com foco visível, e o axe-core não aponta problema sério.
5. Sem erro no console. JS inicial abaixo de 150 KB (gzip).
6. A prévia do Cloudflare Pages abre e mostra a tela com o conteúdo Lorem.

---

## 2. Conteúdo de teste (Lorem Ipsum)

Até o conteúdo real existir, o projeto tem cursos fictícios em `content/`, **todos com `status: "rascunho"`**. Eles aparecem em `npm run dev` e nas prévias (ver `VITE_MOSTRAR_RASCUNHOS` no ARQUITETURA, seção 6) e **nunca vão para a `main`** sem serem revisados. Isso garante que o site no ar nunca mostra Lorem Ipsum.

### O que existe
| Curso | Nível | Estrutura | Conceitos | Exige |
|---|---|---|---|---|
| `01-comece-por-aqui` ("Comece por aqui") | Introdução | 3 unidades · 8 lições (3 + 3 + 2) | `lorem-01` a `lorem-12` (1 ou 2 por lição) | nada |
| `02-aprofundamento-lorem` | Aprofundamento | 2 unidades · 3 lições (2 + 1) | `lorem-13` a `lorem-16` | `lorem-05`, `lorem-08` |
| `03-modulo-lorem` | Módulo | 1 unidade · 2 lições | `lorem-17` e `lorem-18` | `lorem-14`, `lorem-16` |

Só o nome "Comece por aqui" é real, porque é a decisão de produto. Todo o resto é Lorem: títulos como "Lorem ipsum dolor", descrições, situações, cards, perguntas.

### Como é cada lição
- **Lição-modelo** (a primeira do curso 1): situação com 3 palpites; 2 cards, cada um com texto com `[[termo]]`, glossário, analogia, `visual` e fonte; checagem final; 6 exercícios (3 `multipla_escolha`, 2 `verdadeiro_falso`, 1 `quem_resolve`). Serve para testar todos os componentes.
- **Lições enxutas** (todas as outras): situação, 1 card, checagem, 3 exercícios.
- **Lição do Módulo:** a segunda do curso 3 tem um exercício `correntes` (a tela só é construída no M11, mas o formato já é validado desde o M1).
- **Fontes:** todas com `descricao` preenchida, como `"Lorem Ipsum, fonte de exemplo, cap. 1, p. 10"`. Metade com `link` (`https://example.com`) e metade sem, para testar os dois casos.
- **Textos:** latim de preenchimento (Lorem ipsum dolor sit amet…). Cada texto de tamanho diferente (curto, médio, longo), para ver como as telas se comportam.
- **Visual:** os cards usam `visual: "lorem-esquema"`, um componente cinza de exemplo.

### Perfis de demonstração (tela `/_dev`, criada no M2)
| Perfil | O que carrega | Serve para ver |
|---|---|---|
| Recém-chegado | nada salvo | Home visitante |
| Em andamento | 7 dias de ofensiva (recorde 12), 30/50 XP hoje, curso 1 com 5 de 8 lições feitas, curso 2 liberado com 1 lição feita, vários conceitos vencidos | Home com progresso, Curso, Caderno, Revisar |
| Curso 1 completo | todo o curso 1 feito, curso 3 ainda bloqueado | Desbloqueios, Cursos, "Para explorar" |

### Testes de conteúdo (separados do Lorem)
`tests/fixtures/` guarda pastas pequenas de conteúdo **inválido**, uma por regra do build (conceito inexistente, fonte ausente, `correntes` fora de Módulo…). Servem para provar que o build falha com a mensagem certa (M1). Também uma fixture `revisado` para testar o filtro de rascunhos.

### Quando o conteúdo real chegar
1. Escrever as pastas reais em `content/` (a decisão "conteúdo exato e ordem dos cursos" ainda está em aberto).
2. Apagar as pastas Lorem.
3. Rodar o build: ele aponta o que sobrou quebrado. O M7 só fecha com ao menos uma unidade real `revisado`.

---

## 3. Visão geral dos milestones

| # | Milestone | Telas entregues | Tam. | Fase |
|---|---|---|---|---|
| **M0** | Fundação | Guia de estilo (`/_estilo`), casca do app, páginas vazias | M | MVP |
| **M1** | Pipeline de conteúdo | Árvore do catálogo em `/_dev` | G | MVP |
| **M2** | Motor e armazenamento | Ferramentas de demonstração em `/_dev` | G | MVP |
| **M3** | Lição, parte 1 | Situação → Explicação → Checagem → Fim da explicação (4 telas + 2 estados) | G | MVP |
| **M4** | Lição, parte 2 | Prática (3 estados) e Lição concluída | G | MVP |
| **M5** | Home e Curso | Home visitante, Home com progresso, Curso, escolha da meta diária | G | MVP |
| **M6** | Caderno e Revisar | Caderno, Revisar, sessão de revisão | G | MVP |
| **M7** | Sobre e lançamento | Sobre, backup, acessibilidade, domínio, conteúdo real mínimo | M | **MVP no ar** |
| **M8** | Cursos e desbloqueio | Catálogo de Cursos, "Para explorar" na Home, "O que este curso libera" | M | v1.1 |
| **M9** | Novos exercícios | `classificar`, `ordenar`, `mito_ou_fato` (sem design ainda) | G | v1.1 |
| **M10** | Offline | PWA, instalação, aviso de atualização | M | v1.1 |
| **M11** | Módulos e debate | Prática "debate entre correntes" | M | v2 |

### Mapa: prancha de design → milestone
| Prancha | Milestone |
|---|---|
| Guia de estilo | M0 |
| Lição · 1. Situação | M3 |
| Lição · 2. Explicação (card 1 de 2) | M3 |
| Lição · 3. Explicação (card 2 de 2) | M3 |
| Lição · 4. Checagem (pergunta) | M3 |
| Lição · 5. Checagem (resposta) | M3 |
| Lição · 6. Fim da explicação | M3 |
| Lição · 7a. Prática (sem resposta) | M4 |
| Lição · 7b. Prática (resposta errada) | M4 |
| Lição · 8. Concluída | M4 |
| Home · visitante (sem progresso) | M5 |
| Home · quem já tem progresso | M5 |
| Curso · página do curso | M5 |
| Caderno de conceitos | M6 |
| Revisar | M6 |
| Sobre | M7 |
| Cursos · catálogo | M8 |
| Lição · 7c. Prática (debate entre correntes) | M11 |
| Método de ensino | Só documentação (não vira tela) |

---

## 4. Milestones

### M0 · Fundação  `[M]`
**Objetivo:** o projeto roda, publica sozinho e tem a base visual pronta.

**Entregas**
- Repositório público no GitHub com Vite, TypeScript, Preact, `preact-iso`, `@preact/signals`, ESLint, Prettier, Vitest, Playwright e axe-core.
- `styles/tokens.css` com as cores, raios, sombras e tipografia do guia de estilo. Fontes Baloo 2 e Nunito em arquivos `woff2` dentro do projeto (nada de Google Fonts em produção).
- Componentes base: `Botao3D` (primário verde, secundário azul, perigo coral, desativado; borda inferior de 5 px), `Selo` de nível (verde Introdução, azul Aprofundamento, roxo Módulo), `BarraProgresso`, `Cartao` (borda de 2 a 3 px e sombra inferior), `Capi` (a imagem do mascote com tamanhos).
- Três layouts: **app** (menu lateral), **lição** (sem menu, com topo próprio) e **site** (visitante, com cabeçalho e rodapé).
- Todas as rotas da seção 7.1 do ARQUITETURA respondendo com uma página provisória ("Em construção"), mais a página 404.
- GitHub Actions: lint, `tsc`, Vitest e build a cada push.
- Cloudflare Pages ligado ao repositório: prévia por branch, `main` publica em `*.pages.dev`.

**Tarefas suas (fora do código)**
- Registrar `democratiza.app.br` no Registro.br, se ainda não foi feito. O domínio só é apontado para o site no M7.
- Criar o repositório público e a conta no Cloudflare.

#### Tela · Guia de estilo (só dev)
- **Rota:** `/_estilo` (existe só no `npm run dev` e nas prévias, não na produção).
- **Design:** *Guia de estilo*.
- **Mostra:** paleta com nome e valor de cada token, escala tipográfica, os botões em todos os estados, selos de nível, cartão, barra de progresso, Capi.
- **Pronto quando:** cada item do guia de estilo aprovado aparece na página usando o componente real, e trocar um token em `tokens.css` muda a página inteira.

**Pronto quando:** `git push` na `main` publica sozinho; abrir uma branch gera uma prévia; o CI fica verde.

---

### M1 · Pipeline de conteúdo  `[G]`
**Objetivo:** adicionar um JSON em `content/` faz a lição existir no site, e conteúdo quebrado impede o build. É a base de todo o resto.

**Entregas**
- **Formatos (Zod)** em `src/content-schema/`: `fonte`, `conceito`, `curso`, `unidade`, `licao` e um formato por tipo de exercício (`multipla_escolha`, `verdadeiro_falso`, `quem_resolve` e `correntes`; os tipos `classificar`, `ordenar` e `mito_ou_fato` só no M9). A lição também aceita `tipo: "desafio"` (ver decisões a confirmar, seção 6).
- **Plugin `vite-plugins/conteudo.ts`:**
  - varre `content/`: ordem pelo número do nome, id pelo nome sem número;
  - valida tudo e gera mensagens no formato do ARQUITETURA (arquivo + campo + problema);
  - gera o **catálogo leve** (cursos, unidades, títulos, conceitos de cada lição) como módulo virtual;
  - transforma cada lição em um arquivo separado, carregado só quando é aberta;
  - gera a **bibliografia** (fontes únicas e em quantas lições cada uma aparece);
  - calcula o **grafo de conceitos** e o "o que cada curso libera";
  - aplica `content/renomeados.json`;
  - inclui ou não os `rascunho`, conforme `VITE_MOSTRAR_RASCUNHOS`.
- **Erros na tela:** em `npm run dev`, um erro de conteúdo aparece como camada sobre o site, com o arquivo e o problema; no terminal, no mesmo formato.
- **`npm run novo`** com `curso`, `unidade`, `licao` e `conceito`, criando o esqueleto válido com `status: "rascunho"`.
- O **conteúdo Lorem** da seção 2 e as **fixtures** de erro.

**Regras do build (cada uma com um teste usando uma fixture)**
1. Formato e campos obrigatórios de cada arquivo.
2. Todo conceito citado (`requer`, `ensina`, `conceitos`, `requer_conceitos`) existe em `content/conceitos/`.
3. Nenhuma lição usa um conceito que ainda não foi ensinado antes dela.
4. Todo card, conceito e exercício tem `fonte.descricao`.
5. O último card de cada lição tem `checagem`.
6. `correntes` só em curso de nível `modulo`.
7. Sem ids repetidos e sem ciclo no grafo de conceitos.
8. Lição `revisado` com `visual` inexistente falha o build.
9. Uma lição com 1 a 3 conceitos em `ensina`.

#### Tela · Catálogo (só dev)
- **Rota:** `/_dev`, seção "Catálogo".
- **Mostra:** a árvore curso → unidade → lição com o status de cada uma, os conceitos que ela ensina e os erros de validação, se houver.
- **Pronto quando:** abrir a página lista as 13 lições Lorem da seção 2 e editar um JSON recarrega a lista.

**Pronto quando:** as 9 regras têm teste; `npm run novo -- licao comece-por-aqui/<unidade>` gera um arquivo que passa na validação; o build de produção sem `VITE_MOSTRAR_RASCUNHOS` não contém nenhuma lição Lorem.

---

### M2 · Motor e armazenamento  `[G]`
**Objetivo:** toda a lógica do app funciona e está testada, antes de existir tela que dependa dela.

**Entregas**
- **`storage/`:** `repositorio.ts` (estado em `localStorage["democratiza:v1"]` validado por Zod; caderno em IndexedDB via `idb-keyval`), `migracoes.ts` (versão do estado e `renomeados.json`), `exportar.ts` (salvar e abrir backup `.json`, validando o arquivo antes de aplicar) e apagar tudo. Pedir `navigator.storage.persist()` ao concluir a primeira lição.
- **`engine/`:**
  - `xp.ts`: +10 por acerto de primeira, +5 por acerto depois de errar, `xpHoje` zerando na virada do dia, meta de 20/50/100;
  - `ofensiva.ts`: +1 por dia com lição ou revisão concluída, uso da data local, recorde, e a lista `diasEstudados` dos últimos 30 dias;
  - `revisao.ts`: Leitner de 5 caixas (1, 3, 7, 15 e 30 dias), conceitos vencidos, agenda das próximas revisões;
  - `desbloqueio.ts`: lições e unidades em ordem dentro do curso; curso liberado quando todos os `requer_conceitos` estão no caderno; "o que este curso libera";
  - `progresso.ts`: progresso por curso e unidade, próxima lição, o que mostrar em "Continuar", estimativa de minutos de uma lição (1 min por card + 30 s por exercício, arredondado para cima).
- **Relógio injetável:** nenhuma função chama `Date.now()` direto, tudo usa `agora()`, que os testes e o `/_dev` podem trocar.
- **Stores com signals** que os componentes vão usar (`estado`, `caderno`, `catalogo`).
- **Decisão da Home:** a rota `/` decide entre Home visitante e Home com progresso olhando se existe estado salvo.

#### Tela · Ferramentas (só dev)
- **Rota:** `/_dev`, seção "Estado".
- **Mostra:** botões para carregar cada perfil de demonstração (seção 2), "limpar tudo", "avançar 1 dia" e "voltar 1 dia" no relógio, e o estado atual em JSON.
- **Pronto quando:** carregar "Em andamento" e recarregar a página mantém tudo; avançar um dia sem estudar zera a ofensiva.

**Testes obrigatórios (Vitest)**
- Ofensiva: dois dias seguidos, pular um dia, virada de dia à meia-noite, mudança de fuso, recorde.
- XP: primeira tentativa, segunda tentativa, virada de dia, meta atingida.
- Leitner: acertar sobe uma caixa, errar volta para a caixa 1, a data da próxima revisão, o teto na caixa 5.
- Desbloqueio: curso liberado só com todos os conceitos; lição bloqueada até a anterior; "o que libera".
- Migração e `renomeados.json`; importar arquivo inválido não destrói o estado atual.

**Pronto quando:** os testes passam e é possível reproduzir, só pelo `/_dev`, "estudei 7 dias seguidos" e "tenho 6 conceitos vencidos".

---

### M3 · Lição, parte 1  `[G]`
**Objetivo:** do clique em "Começar" até o fim da explicação, tudo a partir do JSON da lição.

**Casca da lição** (layout sem menu)
- **Topo:** botão fechar (X), título "Unidade N · Lição M" com o nome da lição, e as **fases** em forma de pílulas: *Situação · Explicação · Checagem · Prática*. A fase concluída leva ✓ e fundo verde-claro, a atual é verde forte, as próximas são cinza.
- **Rodapé:** botão **Voltar** (a partir da 2ª etapa) e o botão principal 3D, com o rótulo de cada etapa.
- **Retomar:** a etapa, o card e o palpite ficam em `licaoEmAndamento`. Fechar e voltar leva ao ponto em que parou.
- **Fechar:** pede confirmação ("Sair da lição? Seu avanço fica salvo"). **Esta confirmação ainda não tem design.**
- Em lição `rascunho`, uma faixa "Rascunho" aparece no topo.

#### Tela · Situação
- **Rota:** `/c/:curso/:unidade/:licao`, etapa 1. **Design:** *Lição · 1. Situação*.
- **Mostra:** "Primeiro, uma situação. Dê seu palpite, ele não vale ponto.", o texto da situação e 3 palpites de escolha única (o escolhido fica azul).
- **Regras:** o botão **"Ver explicação"** fica desativado até haver um palpite. O palpite é guardado para a checagem final.
- **Pronto quando:** escolher, trocar de ideia, fechar e reabrir mantém o palpite.

#### Telas · Explicação (um card por vez)
- **Design:** *Lição · 2. Explicação (card 1 de 2)* e *Lição · 3. Explicação (card 2 de 2)*. O número de cards vem do JSON (1 a 4).
- **Mostra:** "Explicação · N de M"; título com o trecho em destaque; texto com `[[termo]]` destacado, que abre a definição do glossário ao passar o mouse, clicar ou focar com o teclado; bloco de **analogia** com a Capi; o **esquema visual** pelo nome em `visual`; "Fonte: …" no pé (com link, quando houver, abrindo em outra aba); link **"Encontrou um erro?"** que abre uma issue do GitHub já preenchida com o id da lição e o número do card.
- **Regras:** botão **"Entendi"** avança. **Voltar** volta ao card anterior. Se o card tiver `checagem`, ela vem logo depois dele, com o mesmo comportamento da checagem final.
- **Pronto quando:** a lição-modelo passa pelos 2 cards; um `[[termo]]` sem entrada no `glossario` mostra erro de build; `visual` desconhecido aparece como quadro cinza em rascunho.

#### Telas · Checagem (pergunta e resposta)
- **Design:** *Lição · 4. Checagem (pergunta)* e *Lição · 5. Checagem (resposta)*.
- **Mostra (pergunta):** "Checagem · não vale ponto", a pergunta e 3 a 4 opções (a escolhida fica azul). **"Verificar"** só ativa depois de escolher.
- **Mostra (resposta certa):** opção em verde, "Isso!", a explicação, e a frase "Seu palpite no começo foi: …" quando a pessoa deu um palpite.
- **Mostra (resposta errada):** a escolhida em **amarelo** (não coral, porque aqui errar é normal), a certa em verde, "Quase! E tudo bem, aqui não perde ponto." e a `reexplicacao` da Capi. Sem segunda tentativa; o botão vira "Continuar".
- **Regras:** nenhuma checagem gera XP nem mexe nas caixas de revisão. Respostas da checagem não ficam salvas.
- **Pronto quando:** certa e errada funcionam, a resposta errada nunca altera XP, e o palpite aparece só na checagem final.

#### Tela · Fim da explicação
- **Design:** *Lição · 6. Fim da explicação*.
- **Mostra:** "Agora é praticar!", "Você viu N conceitos. Na prática, cada acerto vale XP.", os conceitos da lição como etiquetas, e os botões **Voltar** e **"Começar prática"**.
- **Pronto quando:** o número e os nomes dos conceitos vêm de `ensina`, e "Começar prática" abre a etapa do M4.

**Testes Playwright:** fazer a lição-modelo da Situação até o Fim da explicação; sair no meio e voltar; errar a checagem e conferir que o XP não mudou.

---

### M4 · Lição, parte 2  `[G]`
**Objetivo:** a Prática, a única etapa que vale XP, e a tela final.

#### Tela · Prática
- **Design:** *Lição · 7a. Prática (sem resposta)* e *7b. Prática (resposta errada)*. O estado "certa" é o 7a depois de verificar.
- **Mostra:** as fases no topo com a Prática ativa; contador "3 de 6" e barra de progresso; rótulo curto do exercício (`titulo_curto`); botão **"Rever explicação"** sempre visível; pergunta; opções com a borda inferior grossa.
- **Fluxo de uma pergunta:**
  1. Nenhuma opção marcada: **"Verificar"** desativado (cinza).
  2. Opção marcada (azul): "Verificar" ativo (verde).
  3. Depois de verificar, o rodapé inteiro muda de cor. **Certa:** rodapé verde-claro, "Mandou bem! +10 XP", explicação, fonte. **Errada:** rodapé coral-claro, opção escolhida em coral e a certa em verde, "Resposta certa: …", explicação, fonte e a frase "Essa pergunta volta na sua revisão.", com o botão **"Continuar"** em coral.
- **Regras:** acertou de primeira, +10 XP. Errou, a pergunta volta **uma vez** no fim da fila (+5 XP se acertar), e o conceito vai para a caixa 1 do Caderno. **"Rever explicação"** abre os cards numa janela sobre a Prática, sem perder a pergunta atual (essa janela **ainda não tem design**).
- **Tipos (v1):** `multipla_escolha`, `verdadeiro_falso` e `quem_resolve`, todos com o mesmo esqueleto de tela. Só muda a apresentação das opções; `verdadeiro_falso` mostra "Verdadeiro" e "Falso" como duas opções grandes.
- **Pronto quando:** os três tipos funcionam com os exercícios Lorem; errar e depois acertar dá +5; sair no meio da Prática e voltar retoma na pergunta certa.

#### Tela · Lição concluída
- **Rota:** dentro da lição. **Design:** *Lição · 8. Concluída*.
- **Mostra:** "Lição concluída!" e o nome da lição; três números: **XP ganho**, **Acertos** (só os de primeira, ex.: "5 de 6") e **Tempo**; "N conceitos novos no seu caderno" com um cartão por conceito (nome, selo "Novo", definição e "Volta para revisão amanhã"); "Desbloqueado: …" com a próxima lição e qualquer curso que foi liberado; botões **"Rever o que errei"** e **"Continuar"**.
- **Regras:**
  - ao chegar nesta tela a lição é gravada como concluída, o XP e a ofensiva são atualizados e os conceitos entram no Caderno (caixa 1, revisão em 1 dia). Conceitos que a pessoa já tinha não aparecem como "Novo";
  - **"Continuar"** leva à próxima lição do curso ou, se acabou, à página do curso;
  - **"Rever o que errei"** só aparece se houve erro e mostra as perguntas erradas com a explicação, sem valer XP. **Esta tela ainda não tem design.**
  - o XP calculado aqui tem de bater com o que apareceu durante a Prática (ex.: 5 acertos de primeira e 1 acerto depois de errar = 55 XP).
- **Pronto quando:** terminar a lição-modelo grava tudo, atualiza o `/_dev` e, ao recarregar, a lição aparece como concluída.

**Testes Playwright:** lição completa com 1 erro, conferindo XP, acertos e o conceito no Caderno; lição já concluída refeita (decisão: refazer vale XP? **a confirmar**, ver seção 6).

---

### M5 · Home e Curso  `[G]`
**Objetivo:** a pessoa entra, entende, começa e volta para continuar.

#### Tela · Home do visitante
- **Rota:** `/` sem estado salvo. **Design:** *Home · visitante (sem progresso)*.
- **Mostra:** cabeçalho (Como funciona, Cursos, Nossos princípios, **Começar**); apresentação com "Entenda a política do Brasil em 5 minutos por dia." e os botões **"Começar agora"** e **"Como funciona"**; cartão de pergunta rápida que funciona de verdade (escolher mostra se acertou e a explicação); selos de confiança; "Como funciona" em 3 passos; "O que você vai aprender" com uma entrada por unidade do "Comece por aqui"; bloco de gamificação; princípios; chamada final; rodapé.
- **Regras:**
  - "Começar agora" abre a **janela da meta diária** (abaixo) e depois a primeira lição do "Comece por aqui";
  - o número de unidades e os nomes vêm do catálogo, nunca escritos à mão;
  - **este design precisa de ajustes antes de codar** (seção 5).
- **Pronto quando:** sem estado salvo mostra esta Home; com estado salvo, a rota `/` mostra a outra.

#### Janela · Meta diária (primeira visita)
- **Design:** nenhum ainda.
- **Proposta:** janela simples sobre a Home com a Capi, "Quanto você quer estudar por dia?" e 3 opções em cartões: **20 XP** (leve), **50 XP** (regular), **100 XP** (intenso), com botão "Começar". A escolha vai para `config.metaDiaria` e pode ser mudada depois na Home (clique na meta do dia).

#### Tela · Home com progresso
- **Rota:** `/`. **Design:** *Home · quem já tem progresso*.
- **Mostra:**
  - **menu lateral** (Aprender, Cursos, Revisar com o número de conceitos vencidos, Caderno, Sobre) e, no pé, "Seu progresso fica salvo só neste navegador" + **Fazer backup**;
  - "Bom te ver de novo!" e "Você está fazendo N cursos. Continue de onde parou.";
  - cartão **Continuar**: selo do nível, curso, nome da lição, "Unidade N · Lição X de Y", número de conceitos novos e tempo estimado, botão **Continuar**;
  - **Seus cursos:** lista compacta, com o nível, o título, "em destaque" no curso atual, "x de y lições" com barra e "Próxima: …", mais o link "Ver todos os cursos";
  - **Para explorar:** cursos liberados ("Começar curso") e bloqueados, com a lista dos conceitos que faltam e em que curso se aprende cada um;
  - coluna lateral: **ofensiva** (dias seguidos, recorde, pontinhos da semana), **meta de hoje** ("30 / 50 XP", "Soma o XP de todos os cursos"), **revisão de hoje** (conceitos vencidos e botão "Revisar agora") e **seu caderno** (total e alguns conceitos, "Abrir caderno").
- **Regras:**
  - "Continuar" abre a lição em andamento; sem ela, a próxima lição do curso em destaque;
  - o curso em destaque é o último que a pessoa usou;
  - quando a pessoa faz **um curso só**, some a frase "N cursos" e a lista "Seus cursos";
  - **"Para explorar"** só aparece quando existem outros cursos no catálogo (no MVP, não aparece; entra no M8);
  - sem conceitos vencidos, o cartão de revisão mostra "Nada para revisar hoje" em vez do botão;
  - o item **Cursos** do menu fica escondido até o M8, e o **Revisar** só fica visível a partir do M6.
- **Pronto quando:** os 3 perfis de demonstração produzem Homes diferentes e corretas, e a ofensiva e a meta mudam depois de uma lição.

#### Tela · Curso
- **Rota:** `/c/:curso`. **Design:** *Curso · página do curso*.
- **Mostra:** caminho "Cursos / Comece por aqui"; selo do nível, título, descrição, "9 de 20 lições" com barra e o botão **Continuar**; lista de **unidades** (número, título, "N lições", estado); a unidade atual aberta com as lições (número ou ✓, título, etiquetas dos conceitos, estado); coluna lateral com **Conceitos do curso** ("9 de 22", etiquetas, "+6", link "Ver no caderno") e **O que este curso libera** (cursos que usam esses conceitos).
- **Estados:** lição **Feita** (✓ verde), **Agora** (borda verde), **Bloqueada** (cinza). Unidade **feita**, **atual** ou **bloqueada** ("Libera ao terminar a Unidade 2"). Unidades e lições seguem a ordem da pasta.
- **Regras:** clicar numa lição liberada abre a lição; bloqueada não faz nada (e explica por quê ao focar). Lição já feita pode ser refeita. O "O que este curso libera" vem do grafo de conceitos calculado no M1 e some se o curso não libera nada.
- **Pronto quando:** o curso 1 Lorem mostra as 3 unidades e 8 lições com os estados corretos conforme o perfil carregado.

**Testes Playwright:** abrir sem estado → Home visitante → começar → escolher meta → fazer uma lição → voltar à Home e ver "Continuar" na lição seguinte.

---

### M6 · Caderno e Revisar  `[G]`
**Objetivo:** fechar o ciclo de aprendizagem. O conceito aprendido volta na hora certa.

#### Tela · Caderno
- **Rota:** `/caderno`. **Design:** *Caderno de conceitos*.
- **Mostra:** "Seu caderno" e "N conceitos aprendidos. Clique em um para ver o cartão completo."; busca por conceito; filtros em etiquetas (por curso); lista de conceitos (nome, definição curta, curso); **cartão do conceito selecionado:** curso, "Força N de 5", nome, "Em uma frase", "No dia a dia", "Não confunda com", "Aprendido em: <lição>", "Fonte: …", botões **"Rever explicação"** e **"Praticar agora"**.
- **Regras:** a busca ignora acentos e maiúsculas. "Aprendido em" é um link para a lição. "Rever explicação" abre os cards daquela lição (sem valer XP). "Praticar agora" faz uma mini-sessão só com exercícios daquele conceito (sem XP e sem mexer na caixa; **a confirmar**, seção 6). A força é a caixa do Leitner.
- **Estado vazio:** "Seu caderno ainda está vazio. Termine sua primeira lição e os conceitos aparecem aqui." **Ainda sem design.**
- **Pronto quando:** os conceitos aprendidos nos perfis de demonstração aparecem; busca e filtro funcionam juntos.

#### Tela · Revisar
- **Rota:** `/revisar`. **Design:** *Revisar*.
- **Mostra:**
  - **Revisão de hoje:** "N conceitos para revisar", de quais cursos, tempo estimado ("cada acerto vale XP") e o botão **"Começar revisão"**;
  - **O que entra hoje:** cada conceito com o curso, "visto há N dias" e a força;
  - **Como funciona:** a explicação das 5 forças e "volta em 1, 3, 7, 15 ou 30 dias";
  - **Próximas revisões:** "Amanhã: 3 conceitos", "Sábado: 5", "Semana que vem: 4";
  - **Quer treinar mais?:** escolher um curso e **"Treinar este curso"** (treino livre).
- **Regras:** o número no menu lateral e na Home é o mesmo desta tela. A sessão tem no máximo 10 conceitos. **"Treinar este curso"** não dá XP e não altera as caixas (a confirmar).
- **Estado vazio** (nenhum conceito vencido): mostra só a agenda das próximas revisões e o treino livre. **Ainda sem design.**

#### Tela · Sessão de revisão
- **Design:** reaproveita *Lição · 7a/7b. Prática*, sem as fases no topo e com o título "Revisão".
- **Regras:** um exercício por conceito vencido, escolhido entre os exercícios de prática das lições que ensinam aquele conceito. Acertou: sobe uma caixa, +10 XP. Errou: volta para a caixa 1, a pergunta volta uma vez no fim da fila (+5 se acertar). Ao terminar, uma tela de resumo (XP, acertos, próxima revisão), que é uma versão curta da *Lição concluída*. **Esta tela final ainda não tem design.**
- **Pronto quando:** avançar o relógio em 1 dia pelo `/_dev` faz os conceitos da lição concluída aparecerem em Revisar; acertar muda a data da próxima revisão.

**Testes Vitest/Playwright:** conceito vence, é revisado, sobe de caixa, some da lista; erro volta à caixa 1; a contagem do menu bate com a da tela.

---

### M7 · Sobre e lançamento  `[M]`
**Objetivo:** o MVP no ar, em `democratiza.app.br`, com conteúdo real.

#### Tela · Sobre
- **Rota:** `/sobre`. **Design:** *Sobre*.
- **Mostra:** "Sobre o Democratiza" e a descrição do projeto; **Nossos princípios** (Acadêmico, Apartidário, Fonte em tudo, Seus dados são seus); **Como ensinamos** (as 5 etapas) e os 3 níveis de curso; **Seus dados** com **Salvar backup**, **Abrir backup** e **Apagar meu progresso**; **Bibliografia** gerada automaticamente (referência completa, link quando houver e "usada em N lições"); como sugerir uma correção (link para as issues do GitHub).
- **Regras:**
  - *Salvar backup* baixa o `.json` com o estado e o caderno; *Abrir backup* valida o arquivo e pede confirmação antes de substituir o progresso atual; arquivo inválido mostra um erro claro e não muda nada;
  - *Apagar meu progresso* pede confirmação com texto explícito ("Isso não pode ser desfeito"). **As confirmações e os avisos de sucesso/erro ainda não têm design.**
  - a bibliografia junta fontes iguais (mesma `descricao`) e ordena por ordem alfabética;
  - os princípios aqui e na Home visitante dizem a mesma coisa (seção 5).
- **Pronto quando:** salvar o backup, apagar tudo e abrir o backup devolve exatamente o mesmo progresso.

#### Lançamento
- **Conteúdo real:** ao menos a primeira unidade do "Comece por aqui" escrita, com as fontes conferidas à mão e `status: "revisado"`. As pastas Lorem são apagadas.
- **Domínio:** apontar `democratiza.app.br` para o Cloudflare Pages.
- **Acessibilidade e desempenho:** Lighthouse CI com nota ≥ 90 em Desempenho e Acessibilidade nas telas principais; revisão com leitor de tela na lição inteira; `prefers-reduced-motion` respeitado.
- **Divulgação:** Cloudflare Web Analytics (sem cookies); página de erro 404 com a Capi; texto do link "Sugerir correção" revisado.
- **Teste final:** o fluxo completo do ARQUITETURA, seção 10, rodando no Playwright contra o site publicado.

**Pronto quando:** qualquer pessoa abre `democratiza.app.br`, faz uma lição real, volta no dia seguinte e revisa.

---

### M8 · Cursos e desbloqueio  `[M]` (v1.1)
**Objetivo:** vários cursos, liberados por conceitos. Entra quando existir o primeiro Aprofundamento real.

#### Tela · Cursos
- **Rota:** `/cursos`. **Design:** *Cursos · catálogo*.
- **Mostra:** "Cursos" e o texto "Comece pela Introdução. Os outros cursos são liberados quando você aprende os conceitos que eles pedem, venham de qualquer curso."; busca por curso; três blocos (**Introdução**, **Aprofundamentos**, **Módulos**), cada um com nome, descrição e as cores do nível; cartão por curso com estado, título, descrição, "N unidades · N lições · N conceitos" e botão.
- **Estados do cartão:** *Em andamento* (barra e "Continuar"), *Liberado* ("Começar curso"), *Bloqueado* ("Faltam estes conceitos:" com as etiquetas, cada uma indicando em que curso se aprende) e *Concluído*.
- **Regras:** a busca olha título e descrição, sem acento. Um curso bloqueado não abre a página do curso, mas mostra o que falta. O estado de cada cartão vem de `desbloqueio.ts`.

**Também neste milestone**
- Ligar o item **Cursos** do menu lateral.
- Ligar **Para explorar** e **O que este curso libera**, que já estavam prontos desde o M5, mas escondidos.
- O primeiro Aprofundamento real é escrito, e o conteúdo Lorem do curso 2 é apagado.

**Pronto quando:** terminar a lição que ensina o último conceito exigido libera o curso na hora, e o "Desbloqueado" da *Lição concluída* o anuncia.

---

### M9 · Novos exercícios  `[G]` (v1.1)
**Objetivo:** `classificar`, `ordenar` e `mito_ou_fato`. **Nenhum dos três tem design ainda; precisam ser desenhados antes de começar.**

- **`classificar`:** arrastar itens para 2 a 4 categorias; alternativa com clique (escolher o item e depois a categoria), obrigatória para o teclado e para leitor de tela.
- **`ordenar`:** reordenar etapas de um processo; alternativa com botões "subir" e "descer".
- **`mito_ou_fato`:** frase que circula por aí, com dois botões (Mito, Fato) e a explicação; é o mesmo formato dos posts "Mito ou fato" do Instagram.
- Os três seguem o fluxo da Prática do M4 (verificar, certa, errada, XP, volta uma vez) e entram na Revisão.
- Formatos Zod, regras de build e um exercício Lorem de cada tipo.

**Pronto quando:** cada tipo funciona só com o teclado e nas sessões de Prática e de Revisão.

---

### M10 · Offline (PWA)  `[M]` (v1.1)
- `vite-plugin-pwa` com manifest (nome, `theme_color: #12A150`, ícones 192, 512 e maskable da Capi).
- Service worker guarda o app e o catálogo; lições já abertas ficam disponíveis offline; as outras são baixadas quando a pessoa abre.
- Aviso discreto "Nova versão disponível" com botão para atualizar.
- Instalável no desktop pelo botão do navegador.
- **Só a partir deste milestone** o selo "Funciona até sem internet" da Home visitante pode aparecer (antes, ele fica escondido).

**Pronto quando:** com a internet desligada, abrir o site, uma lição já aberta e a Home funcionam; a Lighthouse PWA passa.

---

### M11 · Módulos e debate entre correntes  `[M]` (v2)
#### Tela · Prática · debate entre correntes
- **Design:** *Lição · 7c. Prática (debate entre correntes, só em Módulos)*.
- **Mostra:** o selo "Debate acadêmico", a pergunta "De qual leitura vem este argumento?", o argumento entre aspas e as opções (as leituras); depois de verificar, o quadro **"As duas leituras, lado a lado"** (nome e ano, resumo e referência completa de cada uma); o aviso "Aqui não existe resposta certa sobre qual leitura está correta: os pesquisadores ainda debatem. O que vale ponto é saber quem defende o quê."; o rodapé de feedback do mesmo jeito da Prática.
- **Regras:** o tipo `correntes` só é aceito em Módulos (já validado no M1). Cada leitura tem `fonte` própria. **Nenhuma pergunta pode pedir que a pessoa escolha qual leitura é a melhor.** A pergunta é sempre "quem defende o quê".
- O primeiro Módulo real é escrito e o Módulo Lorem é apagado.

**Pronto quando:** a lição Lorem do Módulo roda de ponta a ponta, e colocar `correntes` num Aprofundamento falha o build.

---

## 5. Ajustes de design antes de codar

Pontos em que o design aprovado diverge do que ficou decidido. **Nenhum foi alterado no arquivo de design**; é você quem decide.

| Prancha | Hoje diz | Decidido | Sugestão |
|---|---|---|---|
| Home visitante | "XP e níveis · De Eleitor a Constituinte" | Sem níveis na v1 | Trocar por "XP · cada acerto vale pontos" |
| Home visitante | "Emblemas · Um por unidade concluída" | Sem emblemas na v1 | Trocar por "Revisão · a Capi traz o conceito de volta" |
| Home visitante | "Trilhas" no cabeçalho; "Escolha uma trilha" no passo 1 | O nome é **Cursos** | Renomear para "Cursos" e "Escolha um curso" |
| Home visitante | "pule direto para o tema que mais te interessa" | Cursos só liberam depois dos conceitos | "Comece do zero ou siga para o curso que for liberado" |
| Home visitante | "Funciona até sem internet" | Só a partir do M10 | Manter o selo no design, mas escondido até o M10 |
| Home visitante | Princípio "Explicar, nunca torcer: mostramos os principais argumentos de cada lado" | Debates só nos Módulos | Usar o texto da página Sobre ("Apartidário") |
| Curso | Lição "Desafio da unidade" | Não existe no modelo de conteúdo | Ver seção 6, decisão 4 |

---

## 6. Decisões a confirmar

Cada uma tem uma sugestão. Se não responder, a spec segue a sugestão.

1. **Refazer uma lição já concluída vale XP?** Sugestão: **não**. O XP só vem da primeira vez, para a meta diária não virar jogo de repetir lição fácil. Refazer ainda funciona como treino.
2. **"Praticar agora" (Caderno) e "Treinar este curso" (Revisar):** sugestão: **sem XP e sem mexer nas caixas**, para não distorcer o Leitner.
3. **Revisar entra no MVP.** O design da tela final promete "volta para revisão amanhã". Sugestão: sim, M6 faz parte do MVP; o catálogo **Cursos** fica para o M8.
4. **"Desafio da unidade":** o design do Curso mostra uma lição de fechamento por unidade. Sugestão: um tipo de lição `tipo: "desafio"`, sem situação nem explicação, só uma Prática com exercícios dos conceitos da unidade. Precisa de formato novo no M1 e entra em cada unidade quando houver conteúdo.
5. **Fechar a lição pelo X:** sugestão de confirmação simples "Sair da lição? Seu avanço fica salvo".
6. **Estimativa de minutos** (1 min por card + 30 s por exercício): ajustar depois de medir com pessoas reais.

---

## 7. Telas e estados que ainda não têm design

Desenhar cada uma **antes** do milestone indicado.

| Milestone | O que falta desenhar |
|---|---|
| M3 | Confirmação de sair da lição |
| M4 | Janela "Rever explicação" sobre a Prática; "Rever o que errei" |
| M5 | Janela da meta diária (primeira visita); Home com um curso só (sem "Seus cursos") |
| M6 | Caderno vazio; Revisar sem conceitos vencidos; tela final da sessão de revisão |
| M7 | Confirmações de abrir backup e apagar progresso; mensagens de sucesso e erro; página 404 |
| M9 | `classificar`, `ordenar` e `mito_ou_fato`, cada um em 3 estados (sem resposta, certa, errada) |

---

## 8. Trilha paralela: divulgação

Não depende do código. As peças da página *Instagram* do arquivo de design podem ser publicadas assim que o conteúdo que elas citam estiver conferido.

- Antes de publicar qualquer peça, conferir à mão as fontes escritas nela (no post "Mito ou fato": CF art. 77 §2º, Lei 9.504/1997 art. 2º e Código Eleitoral art. 224; no story: CF art. 46 §1º; no carrossel: CF arts. 27, 29, 44 e 66).
- O link na bio só vale depois do M7.
- Novas peças seguem a mesma regra do site: fato verificável, fonte escrita na peça, sem opinião e sem partido.

---

## 9. Resumo da ordem de trabalho

```
M0 Fundação ─► M1 Pipeline ─► M2 Motor ─► M3 Lição 1 ─► M4 Lição 2
                                                              │
                                  M7 Sobre + lançamento ◄─ M6 Caderno/Revisar ◄─ M5 Home/Curso
                                          │
                                     ★ MVP NO AR
                                          │
                       M8 Cursos ─► M9 Exercícios ─► M10 Offline ─► M11 Módulos
```

Por que essa ordem: o M1 e o M2 vêm antes de qualquer tela porque todas dependem do formato do conteúdo e da lógica de progresso. A Lição (M3 e M4) vem antes da Home porque é o coração do produto: se ela não for boa, o resto não importa, e dá para validar com o `/_dev` sem precisar da Home. O Caderno e a Revisão (M6) vêm antes do lançamento porque a promessa do produto é "você não esquece".
