# Democratiza — Especificação de execução

> Como construir o site, em ordem, tela a tela. Complementa o [`ARQUITETURA.md`](ARQUITETURA.md), que explica **o quê e por quê**; este documento diz **o que entregar em cada etapa**.
> **Não há fases: todo o planejamento é o MVP.** São 13 milestones (M0 a M12) e o site só é apontado para o domínio no último.
> Todo o conteúdo usado nas etapas é **Lorem Ipsum** (seção 2). O conteúdo real entra por último, só adicionando pastas e JSONs em `content/`.
> Regras de código e de commits: [`AGENTS.md`](AGENTS.md).

---

## 1. Como usar este documento

### Convenções
- **Milestone (M0, M1…):** um bloco de trabalho que termina com algo que dá para abrir, clicar e conferir. Os milestones são sequenciais; cada um só começa quando o anterior está pronto.
- **Design de referência:** cada tela cita o nome da prancha no arquivo de design *"Democratiza — Design"*, página *Site (desktop)*. Ex.: *"Lição · 4. Checagem (pergunta)"*. As telas de apoio (janelas, estados vazios, novos exercícios) estão nas faixas *"Apoio"* abaixo das telas principais.
- **Tamanho:** P ≈ 1 a 2 dias, M ≈ 3 a 5 dias, G ≈ 1 a 2 semanas, para uma pessoa trabalhando com IA. São estimativas grosseiras, só para comparar um milestone com outro.
- **Telas:** o design foi feito em 1440 px de largura. Entregar bem de **1024 px para cima**. Abaixo disso o layout não pode quebrar (nada cortado, sem rolagem horizontal), mas sem acabamento: a versão para celular está fora do planejamento atual.
- **Pranchas interativas:** algumas pranchas funcionam como protótipo (clicar, escolher, verificar). Os estados "certa" e "errada" são alcançados clicando.

### Definição de pronto (vale para toda tela)
1. `tsc --noEmit`, ESLint e Prettier sem erros.
2. A lógica nova tem testes Vitest e o fluxo novo tem ao menos um teste Playwright.
3. A tela confere com a prancha em 1440 px (conferência a olho, não precisa ser idêntica ao pixel) e usa só tokens de `tokens.css`, sem cores soltas no código.
4. Tudo funciona só com o teclado (Tab, Enter, Espaço, Esc), com foco visível, e o axe-core não aponta problema sério.
5. Sem erro no console. JS inicial abaixo de 150 KB (gzip).
6. A prévia do Cloudflare Pages abre e mostra a tela com o conteúdo Lorem.
7. Commits atômicos no padrão do `AGENTS.md`, e `node clean-appledouble.mjs` rodado **antes** de commitar.

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
- **Lição de desafio:** a última de cada unidade do curso 1 é `tipo: "desafio"` (só Prática).
- **Lição do Módulo:** a segunda do curso 3 tem um exercício `correntes`.
- **Exercícios dos tipos novos:** a lição-modelo do curso 2 tem um `classificar`, um `ordenar` e um `mito_ou_fato` (usados a partir do M9).
- **Fontes:** todas com `descricao` preenchida, como `"Lorem Ipsum, fonte de exemplo, cap. 1, p. 10"`. Metade com `link` (`https://example.com`) e metade sem, para testar os dois casos.
- **Textos:** latim de preenchimento (Lorem ipsum dolor sit amet…). Cada texto de tamanho diferente (curto, médio, longo), para ver como as telas se comportam.
- **Visual:** os cards usam `visual: "lorem-esquema"`, um componente cinza de exemplo.

### Perfis de demonstração (tela `/_dev`, criada no M2)
| Perfil | O que carrega | Serve para ver |
|---|---|---|
| Recém-chegado | nada salvo | Home do visitante, janela da meta diária, Caderno vazio |
| Um curso só | 3 dias de ofensiva, curso 1 com 3 de 8 lições feitas, nenhum outro curso liberado | Home com um curso só |
| Em andamento | 7 dias de ofensiva (recorde 12), 30/50 XP hoje, curso 1 com 5 de 8 lições feitas, curso 2 liberado com 1 lição feita, vários conceitos vencidos | Home com progresso, Curso, Caderno, Revisar |
| Tudo em dia | como "Em andamento", mas nenhum conceito vencido | Revisar sem vencidos |
| Curso 1 completo | todo o curso 1 feito, curso 3 ainda bloqueado | Desbloqueios, Cursos, "Para explorar" |

### Testes de conteúdo (separados do Lorem)
`tests/fixtures/` guarda pastas pequenas de conteúdo **inválido**, uma por regra do build (conceito inexistente, fonte ausente, `correntes` fora de Módulo…). Servem para provar que o build falha com a mensagem certa (M1). Também uma fixture `revisado` para testar o filtro de rascunhos.

### Quando o conteúdo real chegar
1. Escrever as pastas reais em `content/` (a decisão "conteúdo exato e ordem dos cursos" ainda está em aberto).
2. Apagar as pastas Lorem.
3. Rodar o build: ele aponta o que sobrou quebrado. O M12 só fecha com ao menos uma unidade real `revisado`.

---

## 3. Visão geral dos milestones

| # | Milestone | Telas entregues | Tam. |
|---|---|---|---|
| **M0** | Fundação | Guia de estilo (`/_estilo`), casca do app, página 404, páginas vazias | M |
| **M1** | Pipeline de conteúdo | Árvore do catálogo em `/_dev` | G |
| **M2** | Motor e armazenamento | Ferramentas de demonstração em `/_dev` | G |
| **M3** | Lição, parte 1 | Situação, Explicação, Checagem, Fim da explicação, confirmação de sair | G |
| **M4** | Lição, parte 2 | Prática (3 estados), Rever explicação, Lição concluída, Rever o que errei | G |
| **M5** | Home e Curso | Home do visitante, meta diária, Home com progresso (e com um curso só), Curso | G |
| **M6** | Caderno e Revisar | Caderno (e vazio), Revisar (e vazio), sessão de revisão e tela final | G |
| **M7** | Sobre e backup | Sobre, janelas de backup e de apagar, avisos | M |
| **M8** | Cursos e desbloqueio | Catálogo de Cursos, "Para explorar", "O que este curso libera" | M |
| **M9** | Novos exercícios | `classificar`, `ordenar`, `mito_ou_fato` | G |
| **M10** | Offline | PWA, instalação, aviso de atualização | M |
| **M11** | Módulos e debate | Prática "debate entre correntes" | M |
| **M12** | Lançamento | Conteúdo real, domínio, qualidade, publicação | M |

### Mapa: prancha de design → milestone
| Prancha | Milestone |
|---|---|
| Guia de estilo | M0 |
| Página não encontrada (404) | M0 |
| Lição · 1. Situação | M3 |
| Lição · 2. Explicação (card 1 de 2) | M3 |
| Lição · 3. Explicação (card 2 de 2) | M3 |
| Lição · 4. Checagem (pergunta) | M3 |
| Lição · 5. Checagem (resposta) | M3 |
| Lição · 6. Fim da explicação | M3 |
| Lição · Sair da lição (confirmação) | M3 |
| Lição · 7a. Prática (sem resposta) | M4 |
| Lição · 7b. Prática (resposta errada) | M4 |
| Lição · Rever explicação (sobre a Prática) | M4 |
| Lição · 8. Concluída | M4 |
| Lição · Rever o que errei | M4 |
| Home · visitante (sem progresso) | M5 |
| Home · escolha da meta diária (primeira visita) | M5 |
| Home · quem já tem progresso | M5 |
| Home · com um curso só | M5 |
| Curso · página do curso | M5 |
| Caderno de conceitos | M6 |
| Caderno · vazio | M6 |
| Revisar | M6 |
| Revisar · nada para revisar hoje | M6 |
| Revisar · revisão concluída | M6 |
| Sobre | M7 |
| Sobre · confirmações e avisos | M7 |
| Cursos · catálogo | M8 |
| Prática · Classificar (novo tipo) | M9 |
| Prática · Ordenar (novo tipo) | M9 |
| Prática · Mito ou fato (novo tipo) | M9 |
| Lição · 7c. Prática (debate entre correntes) | M11 |
| Método de ensino | Só documentação (não vira tela) |

---

## 4. Milestones

### M0 · Fundação  `[M]`
**Objetivo:** o projeto roda, publica sozinho e tem a base visual pronta.

**Entregas**
- Repositório público no GitHub com Vite, TypeScript, Preact, `preact-iso`, `@preact/signals`, ESLint, Prettier, Vitest, Playwright e axe-core.
- Arquivos de projeto: `AGENTS.md`, `CLAUDE.md` (aponta para o `AGENTS.md`), `.gitignore` (inclui os arquivos `._*` e `.DS_Store` do macOS) e o `clean-appledouble.mjs` na raiz. Um script `npm run limpar` que chama `node clean-appledouble.mjs`.
- `styles/tokens.css` com as cores, raios, sombras e tipografia do guia de estilo. Fontes Baloo 2 e Nunito em arquivos `woff2` dentro do projeto (nada de Google Fonts em produção).
- Componentes base: `Botao3D` (primário verde, secundário azul, perigo coral, desativado; borda inferior de 5 px), `Selo` de nível (verde Introdução, azul Aprofundamento, roxo Módulo), `BarraProgresso`, `Cartao` (borda de 2 a 3 px e sombra inferior), `Capi` (a imagem do mascote com tamanhos), `Janela` (caixa de diálogo com fundo escurecido, foco preso dentro e Esc para fechar), `Aviso` (mensagem rápida que some sozinha).
- Três layouts: **app** (menu lateral), **lição** (sem menu, com topo próprio) e **site** (visitante, com cabeçalho e rodapé).
- Todas as rotas da seção 7.1 do ARQUITETURA respondendo com uma página provisória ("Em construção").
- GitHub Actions: lint, `tsc`, Vitest e build a cada push.
- Cloudflare Pages ligado ao repositório: prévia por branch, `main` publica em `*.pages.dev`.

**Tarefas suas (fora do código)**
- Registrar `democratiza.app.br` no Registro.br, se ainda não foi feito. O domínio só é apontado para o site no M12.
- Criar o repositório público e a conta no Cloudflare.

#### Tela · Guia de estilo (só dev)
- **Rota:** `/_estilo` (existe só no `npm run dev` e nas prévias, não na produção). **Design:** *Guia de estilo*.
- **Mostra:** paleta com nome e valor de cada token, escala tipográfica, os botões em todos os estados, selos de nível, cartão, barra de progresso, Capi, janela e aviso.
- **Pronto quando:** cada item do guia de estilo aprovado aparece na página usando o componente real, e trocar um token em `tokens.css` muda a página inteira.

#### Tela · Página não encontrada
- **Rota:** qualquer endereço que não exista. **Design:** *Página não encontrada (404)*.
- **Mostra:** a Capi num círculo, "ERRO 404", "Essa página não existe", o texto "O endereço pode ter mudado, ou essa lição ainda não foi publicada. Seu progresso continua salvo." e os botões **"Ir para o início"** e **"Ver os cursos"**.
- **Regras:** vale também para uma lição que existe só como rascunho quando o rascunho está desligado. Até o M8 o botão "Ver os cursos" leva ao curso "Comece por aqui".
- **Pronto quando:** abrir `/qualquer-coisa` mostra esta tela com o layout do site.

**Pronto quando:** `git push` na `main` publica sozinho; abrir uma branch gera uma prévia; o CI fica verde.

---

### M1 · Pipeline de conteúdo  `[G]`
**Objetivo:** adicionar um JSON em `content/` faz a lição existir no site, e conteúdo quebrado impede o build. É a base de todo o resto.

**Entregas**
- **Formatos (Zod)** em `src/content-schema/`: `fonte`, `conceito`, `curso`, `unidade`, `licao` (incluindo `tipo: "desafio"`) e um formato por tipo de exercício (`multipla_escolha`, `verdadeiro_falso`, `quem_resolve`, `classificar`, `ordenar`, `mito_ou_fato` e `correntes`). As telas dos tipos novos chegam nos M9 e M11, mas o formato já é validado aqui.
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
9. Uma lição com 1 a 3 conceitos em `ensina` (exceto lições `desafio`, que não ensinam conceito novo).

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
  - `xp.ts`: +10 por acerto de primeira, +5 por acerto depois de errar, `xpHoje` zerando na virada do dia, meta de 20/50/100; refazer uma lição já concluída **não dá XP**;
  - `ofensiva.ts`: +1 por dia com lição ou revisão concluída, uso da data local, recorde, e a lista `diasEstudados` dos últimos 30 dias;
  - `revisao.ts`: Leitner de 5 caixas (1, 3, 7, 15 e 30 dias), conceitos vencidos, agenda das próximas revisões; treino livre não altera as caixas;
  - `desbloqueio.ts`: lições e unidades em ordem dentro do curso; curso liberado quando todos os `requer_conceitos` estão no caderno; "o que este curso libera";
  - `progresso.ts`: progresso por curso e unidade, próxima lição, o que mostrar em "Continuar", estimativa de minutos de uma lição (1 min por card + 30 s por exercício, arredondado para cima).
- **Relógio injetável:** nenhuma função chama `Date.now()` direto, tudo usa `agora()`, que os testes e o `/_dev` podem trocar.
- **Stores com signals** que os componentes vão usar (`estado`, `caderno`, `catalogo`).
- **Decisão da Home:** a rota `/` decide entre Home do visitante e Home com progresso olhando se existe estado salvo.

#### Tela · Ferramentas (só dev)
- **Rota:** `/_dev`, seção "Estado".
- **Mostra:** botões para carregar cada perfil de demonstração (seção 2), "limpar tudo", "avançar 1 dia" e "voltar 1 dia" no relógio, e o estado atual em JSON.
- **Pronto quando:** carregar "Em andamento" e recarregar a página mantém tudo; avançar um dia sem estudar zera a ofensiva.

**Testes obrigatórios (Vitest)**
- Ofensiva: dois dias seguidos, pular um dia, virada de dia à meia-noite, mudança de fuso, recorde.
- XP: primeira tentativa, segunda tentativa, virada de dia, meta atingida, lição refeita sem XP.
- Leitner: acertar sobe uma caixa, errar volta para a caixa 1, a data da próxima revisão, o teto na caixa 5, treino livre sem efeito.
- Desbloqueio: curso liberado só com todos os conceitos; lição bloqueada até a anterior; "o que libera".
- Migração e `renomeados.json`; importar arquivo inválido não destrói o estado atual.

**Pronto quando:** os testes passam e é possível reproduzir, só pelo `/_dev`, "estudei 7 dias seguidos" e "tenho 6 conceitos vencidos".

---

### M3 · Lição, parte 1  `[G]`
**Objetivo:** do clique em "Começar" até o fim da explicação, tudo a partir do JSON da lição.

**Casca da lição** (layout sem menu)
- **Topo:** botão fechar (X), título "Unidade N · Lição M" com o nome da lição, e as **fases** em forma de pílulas: *Situação · Explicação · Checagem · Prática*. A fase concluída leva ✓ e fundo verde-claro, a atual é verde forte, as próximas são cinza.
- **Rodapé:** botão **Voltar** (a partir da 2ª etapa) e o botão principal 3D, com o rótulo de cada etapa ("Ver explicação", "Entendi", "Verificar", "Continuar", "Começar prática").
- **Retomar:** a etapa, o card e o palpite ficam em `licaoEmAndamento`. Fechar e voltar leva ao ponto em que parou.
- Em lição `rascunho`, uma faixa "Rascunho" aparece no topo.

#### Janela · Sair da lição
- **Design:** *Lição · Sair da lição (confirmação)*.
- **Mostra:** sobre a lição escurecida, a Capi, "Sair da lição?", "Seu avanço fica salvo. Quando você voltar, continua exatamente de onde parou." e os botões **"Continuar a lição"** (verde) e **"Sair"**.
- **Regras:** abre ao clicar no X ou apertar Esc. "Continuar a lição" fecha a janela; "Sair" grava o avanço e leva à Home. O foco fica preso dentro da janela.

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

**Testes Playwright:** fazer a lição-modelo da Situação até o Fim da explicação; sair no meio pela janela e voltar; errar a checagem e conferir que o XP não mudou.

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
- **Regras:** acertou de primeira, +10 XP. Errou, a pergunta volta **uma vez** no fim da fila (+5 XP se acertar), e o conceito vai para a caixa 1 do Caderno.
- **Tipos disponíveis neste milestone:** `multipla_escolha`, `verdadeiro_falso` e `quem_resolve`, todos com o mesmo esqueleto de tela. Só muda a apresentação das opções; `verdadeiro_falso` mostra "Verdadeiro" e "Falso" como duas opções grandes.
- **Pronto quando:** os três tipos funcionam com os exercícios Lorem; errar e depois acertar dá +5; sair no meio da Prática e voltar retoma na pergunta certa.

#### Janela · Rever explicação
- **Design:** *Lição · Rever explicação (sobre a Prática)*.
- **Mostra:** sobre a pergunta escurecida, a janela "Rever explicação · 1 de 2" com o título e o texto do card, a analogia e a fonte; botões **Anterior** e **Próximo** para andar pelos cards; **"Voltar à pergunta"**; o aviso "Aqui não vale ponto. A sua pergunta continua como estava."; X para fechar.
- **Regras:** abre pelo link "Rever explicação" da Prática. Não altera a pergunta atual, a resposta marcada nem o XP. Esc fecha.

#### Tela · Lição concluída
- **Rota:** dentro da lição. **Design:** *Lição · 8. Concluída*.
- **Mostra:** "Lição concluída!" e o nome da lição; três números: **XP ganho**, **Acertos** (só os de primeira, ex.: "5 de 6") e **Tempo**; "N conceitos novos no seu caderno" com um cartão por conceito (nome, selo "Novo", definição e "Volta para revisão amanhã"); "Desbloqueado: …" com a próxima lição e qualquer curso que foi liberado; botões **"Rever o que errei"** e **"Continuar"**.
- **Regras:**
  - ao chegar nesta tela a lição é gravada como concluída, o XP e a ofensiva são atualizados e os conceitos entram no Caderno (caixa 1, revisão em 1 dia). Conceitos que a pessoa já tinha não aparecem como "Novo";
  - em lição refeita, o XP ganho é 0 e a tela diz "Lição refeita. O XP só conta na primeira vez.";
  - **"Continuar"** leva à próxima lição do curso ou, se acabou, à página do curso;
  - **"Rever o que errei"** só aparece se houve erro;
  - o XP calculado aqui tem de bater com o que apareceu durante a Prática (ex.: 5 acertos de primeira e 1 acerto depois de errar = 55 XP).
- **Pronto quando:** terminar a lição-modelo grava tudo, atualiza o `/_dev` e, ao recarregar, a lição aparece como concluída.

#### Tela · Rever o que errei
- **Design:** *Lição · Rever o que errei*.
- **Mostra:** layout da lição, com o selo "Sem pontos aqui"; título "O que você errou" e "N pergunta(s). É só para fixar: aqui ninguém ganha nem perde ponto."; um cartão por pergunta errada, com o rótulo e o número ("Pergunta 3 de 6"), a pergunta, **"Você marcou"** em coral, **"Resposta certa"** em verde, a explicação, a fonte, a etiqueta do conceito e "Volta na sua revisão amanhã."; botões **"Rever a explicação"** e **"Voltar ao resultado"**.
- **Regras:** é só leitura. Não gera XP e não mexe nas caixas.

**Testes Playwright:** lição completa com 1 erro, conferindo XP, acertos e o conceito no Caderno; lição já concluída refeita (XP 0).

---

### M5 · Home e Curso  `[G]`
**Objetivo:** a pessoa entra, entende, começa e volta para continuar.

#### Tela · Home do visitante
- **Rota:** `/` sem estado salvo. **Design:** *Home · visitante (sem progresso)*.
- **Mostra:** cabeçalho (Como funciona, Cursos, Nossos princípios, **Começar**); apresentação com "Entenda a política do Brasil em 5 minutos por dia." e os botões **"Começar agora"** e **"Como funciona"**; cartão de pergunta rápida que funciona de verdade (escolher mostra se acertou e a explicação); selos de confiança (inclusive "Funciona até sem internet", que passa a ser verdade no M10); "Como funciona" em 3 passos ("Comece pela Introdução", "Entenda, depois pratique", "Mantenha a ofensiva"); "O que você vai aprender" com uma entrada por unidade do "Comece por aqui"; bloco de gamificação (Ofensiva, XP, Revisão, Caderno); princípios; chamada final; rodapé.
- **Regras:** "Começar agora" abre a **janela da meta diária** e depois a primeira lição do "Comece por aqui". O número de unidades e os nomes vêm do catálogo, nunca escritos à mão.
- **Pronto quando:** sem estado salvo mostra esta Home; com estado salvo, a rota `/` mostra a outra.

#### Janela · Meta diária
- **Design:** *Home · escolha da meta diária (primeira visita)*.
- **Mostra:** sobre a Home escurecida, a Capi e "Quanto você quer estudar por dia?", "Você pode mudar isso depois. A meta soma o XP de todos os cursos.", três opções em cartões de escolha única: **Leve · 20 XP** ("Uma prática rápida, cerca de 2 minutos"), **Regular · 50 XP** ("Cerca de 1 lição por dia", já marcada) e **Intenso · 100 XP** ("Cerca de 2 lições por dia"); botão **"Começar a primeira lição"**.
- **Regras:** a escolha vai para `config.metaDiaria`. Aparece uma única vez, na primeira visita. Depois, clicar na meta de hoje, na Home, reabre esta janela.

#### Tela · Home com progresso
- **Rota:** `/`. **Design:** *Home · quem já tem progresso*.
- **Mostra:**
  - **menu lateral** (Aprender, Cursos, Revisar com o número de conceitos vencidos, Caderno, Sobre) e, no pé, "Seu progresso fica salvo só neste navegador" + **Fazer backup**;
  - "Bom te ver de novo!" e "Você está fazendo N cursos. Continue de onde parou.";
  - cartão **Continuar**: selo do nível, curso, nome da lição, "Unidade N · Lição X de Y", pontinhos de progresso da unidade, número de conceitos novos e tempo estimado, botão **Continuar**;
  - **Seus cursos:** lista compacta, com o nível, o título, "em destaque" no curso atual, "x de y lições" com barra e "Próxima: …", mais o link "Ver todos os cursos";
  - **Para explorar:** cursos liberados ("Começar curso") e bloqueados, com a lista dos conceitos que faltam e em que curso se aprende cada um;
  - coluna lateral: **ofensiva** (dias seguidos, recorde, pontinhos da semana), **meta de hoje** ("30 / 50 XP", "Soma o XP de todos os cursos"), **revisão de hoje** (conceitos vencidos e botão "Revisar agora") e **seu caderno** (total e alguns conceitos, "Abrir caderno").
- **Regras:**
  - "Continuar" abre a lição em andamento; sem ela, a próxima lição do curso em destaque;
  - o curso em destaque é o último que a pessoa usou;
  - **"Para explorar"** só aparece quando existem outros cursos no catálogo;
  - sem conceitos vencidos, o cartão de revisão mostra "Nada para revisar hoje" em vez do botão;
  - quando a pessoa faz **um curso só**, usa-se a variante abaixo.
- **Pronto quando:** os perfis de demonstração produzem Homes diferentes e corretas, e a ofensiva e a meta mudam depois de uma lição.

#### Variante · Home com um curso só
- **Design:** *Home · com um curso só*.
- **Diferenças:** o texto é só "Continue de onde parou."; a lista "Seus cursos" dá lugar ao cartão **"Seu progresso no curso"** (barra, "9 de 20 lições", "9 de 22 conceitos no caderno", "Unidade 2 de 4" e o aviso "Outros cursos aparecem aqui quando você aprende os conceitos que eles pedem."); o link é "Ver o curso". O resto (ofensiva, meta, revisão, caderno) é igual.

#### Tela · Curso
- **Rota:** `/c/:curso`. **Design:** *Curso · página do curso*.
- **Mostra:** caminho "Cursos / Comece por aqui"; selo do nível, título, descrição, "9 de 20 lições" com barra e o botão **Continuar**; lista de **unidades** (número, título, "N lições", estado); a unidade atual aberta com as lições (número ou ✓, título, etiquetas dos conceitos, estado); coluna lateral com **Conceitos do curso** ("9 de 22", etiquetas, "+6", link "Ver no caderno") e **O que este curso libera** (cursos que usam esses conceitos).
- **Estados:** lição **Feita** (✓ verde), **Agora** (borda verde), **Bloqueada** (cinza). Unidade **feita**, **atual** ou **bloqueada** ("Libera ao terminar a Unidade 2"). Unidades e lições seguem a ordem da pasta. A lição `desafio` aparece como a última da unidade, com os conceitos "Revisão da unidade".
- **Regras:** clicar numa lição liberada abre a lição; bloqueada não faz nada (e explica por quê ao focar). Lição já feita pode ser refeita, sem XP. O "O que este curso libera" vem do grafo de conceitos calculado no M1 e some se o curso não libera nada.
- **Pronto quando:** o curso 1 Lorem mostra as 3 unidades e 8 lições com os estados corretos conforme o perfil carregado.

**Testes Playwright:** abrir sem estado → Home do visitante → começar → escolher meta → fazer uma lição → voltar à Home e ver "Continuar" na lição seguinte.

---

### M6 · Caderno e Revisar  `[G]`
**Objetivo:** fechar o ciclo de aprendizagem. O conceito aprendido volta na hora certa.

#### Tela · Caderno
- **Rota:** `/caderno`. **Design:** *Caderno de conceitos*.
- **Mostra:** "Seu caderno" e "N conceitos aprendidos. Clique em um para ver o cartão completo."; busca por conceito; filtros em etiquetas (por curso); lista de conceitos (nome, definição curta, curso); **cartão do conceito selecionado:** curso, "Força N de 5", nome, "Em uma frase", "No dia a dia", "Não confunda com", "Aprendido em: <lição>", "Fonte: …", botões **"Rever explicação"** e **"Praticar agora"**.
- **Regras:** a busca ignora acentos e maiúsculas. "Aprendido em" é um link para a lição. "Rever explicação" abre os cards daquela lição (sem valer XP). "Praticar agora" faz uma mini-sessão só com exercícios daquele conceito, **sem XP e sem mexer na caixa**. A força é a caixa do Leitner.
- **Pronto quando:** os conceitos aprendidos nos perfis de demonstração aparecem; busca e filtro funcionam juntos.

#### Variante · Caderno vazio
- **Design:** *Caderno · vazio*.
- **Mostra:** "0 conceitos aprendidos."; cartão tracejado com a Capi, "Seu caderno ainda está vazio" e "Termine sua primeira lição e cada conceito novo aparece aqui, com a definição, um exemplo e a fonte."; botão **"Fazer a primeira lição"**; abaixo, "Como um cartão vai aparecer", com um cartão de exemplo (rotulado "Exemplo").
- **Regras:** aparece quando não há nenhum conceito. Sem busca nem filtros.

#### Tela · Revisar
- **Rota:** `/revisar`. **Design:** *Revisar*.
- **Mostra:**
  - **Revisão de hoje:** "N conceitos para revisar", de quais cursos, tempo estimado ("cada acerto vale XP") e o botão **"Começar revisão"**;
  - **O que entra hoje:** cada conceito com o curso, "visto há N dias" e a força;
  - **Como funciona:** a explicação das 5 forças e "volta em 1, 3, 7, 15 ou 30 dias";
  - **Próximas revisões:** "Amanhã: 3 conceitos", "Sábado: 5", "Semana que vem: 4";
  - **Quer treinar mais?:** escolher um curso e **"Treinar este curso"**.
- **Regras:** o número no menu lateral e na Home é o mesmo desta tela. A sessão tem no máximo 10 conceitos, um exercício por conceito. **"Treinar este curso"** é treino livre: sem XP e sem alterar as caixas.

#### Variante · Revisar sem vencidos
- **Design:** *Revisar · nada para revisar hoje*.
- **Mostra:** o cartão verde "Tudo em dia!" ("Nenhum conceito está vencido agora. O próximo vence amanhã. Quem revisa na hora certa lembra por mais tempo."), sem botão de começar; **Próximas revisões**; **Quer treinar mais?** com o aviso "Esse treino não vale XP e não muda o seu calendário de revisões."; **Como funciona**. O número do menu lateral some.

#### Tela · Sessão de revisão
- **Design:** reaproveita *Lição · 7a/7b. Prática*, sem as fases no topo e com o título "Revisão".
- **Regras:** um exercício por conceito vencido, escolhido entre os exercícios de prática das lições que ensinam aquele conceito. Acertou: sobe uma caixa, +10 XP. Errou: volta para a caixa 1, a pergunta volta uma vez no fim da fila (+5 se acertar).

#### Tela · Revisão concluída
- **Design:** *Revisar · revisão concluída*.
- **Mostra:** a Capi, "Revisão concluída!" e "N conceitos revisados, vindos dos seus M cursos."; três números (**XP ganho**, **Acertos**, **Tempo**); "Como ficaram seus conceitos": uma linha por conceito com a mudança de força ("Força 2 → 3", verde quando sobe, coral quando fica no 1) e "volta em 7 dias"; botões **"Ver o caderno"** e **"Continuar"**.
- **Pronto quando:** avançar o relógio em 1 dia pelo `/_dev` faz os conceitos da lição concluída aparecerem em Revisar; acertar muda a data da próxima revisão, e a tela final mostra as mesmas mudanças.

**Testes Vitest/Playwright:** conceito vence, é revisado, sobe de caixa, some da lista; erro volta à caixa 1; a contagem do menu bate com a da tela.

---

### M7 · Sobre e backup  `[M]`
**Objetivo:** transparência do projeto e o controle do progresso nas mãos da pessoa.

#### Tela · Sobre
- **Rota:** `/sobre`. **Design:** *Sobre*.
- **Mostra:** "Sobre o Democratiza" e a descrição do projeto; **Nossos princípios** (Acadêmico, Apartidário, Fonte em tudo, Seus dados são seus); **Como ensinamos** (as 5 etapas) e os 3 níveis de curso; **Seus dados** com **Salvar backup**, **Abrir backup** e **Apagar meu progresso**; **Bibliografia** gerada automaticamente (referência completa, link quando houver e "usada em N lições"); como sugerir uma correção (link para as issues do GitHub).
- **Regras:** a bibliografia junta fontes iguais (mesma `descricao`) e ordena por ordem alfabética. Os princípios aqui e na Home do visitante dizem a mesma coisa.
- **Pronto quando:** salvar o backup, apagar tudo e abrir o backup devolve exatamente o mesmo progresso.

#### Janelas e avisos
- **Design:** *Sobre · confirmações e avisos*.
- **Abrir backup:** janela "Substituir o seu progresso?", com o nome do arquivo e o resumo ("14 conceitos e 2 cursos"); botões **"Substituir"** (azul) e **"Cancelar"**.
- **Apagar progresso:** janela "Apagar todo o seu progresso?" explicando o que some e que **não dá para desfazer**; link "Salvar backup antes"; botões **"Apagar tudo"** (coral) e **"Cancelar"**.
- **Arquivo inválido:** janela "Não foi possível abrir o arquivo" ("Seu progresso atual não foi alterado."); botão **"Entendi"**.
- **Avisos rápidos** (somem sozinhos): "Backup salvo. Guarde o arquivo em um lugar seguro.", "Progresso restaurado." e "Progresso apagado. Você pode recomeçar quando quiser."
- **Regras:** arquivo inválido nunca altera o estado atual. Apagar volta o app ao estado de visitante. O mesmo componente `Janela` do M0 é usado em todas.

**Pronto quando:** os três caminhos (substituir, apagar, arquivo inválido) têm teste Playwright.

---

### M8 · Cursos e desbloqueio  `[M]`
**Objetivo:** vários cursos, liberados por conceitos.

#### Tela · Cursos
- **Rota:** `/cursos`. **Design:** *Cursos · catálogo*.
- **Mostra:** "Cursos" e o texto "Comece pela Introdução. Os outros cursos são liberados quando você aprende os conceitos que eles pedem, venham de qualquer curso."; busca por curso; três blocos (**Introdução**, **Aprofundamentos**, **Módulos**), cada um com nome, descrição e as cores do nível; cartão por curso com estado, título, descrição, "N unidades · N lições · N conceitos" e botão.
- **Estados do cartão:** *Em andamento* (barra e "Continuar"), *Liberado* ("Começar curso"), *Bloqueado* ("Faltam estes conceitos:" com as etiquetas, cada uma indicando em que curso se aprende) e *Concluído*.
- **Regras:** a busca olha título e descrição, sem acento. Um curso bloqueado não abre a página do curso, mas mostra o que falta. O estado de cada cartão vem de `desbloqueio.ts`.

**Também neste milestone**
- Ligar o item **Cursos** do menu lateral (até aqui escondido).
- Ligar **Para explorar** (Home) e **O que este curso libera** (Curso).
- O primeiro Aprofundamento real é escrito, e o conteúdo Lorem do curso 2 é apagado.

**Pronto quando:** terminar a lição que ensina o último conceito exigido libera o curso na hora, e o "Desbloqueado" da *Lição concluída* o anuncia.

---

### M9 · Novos exercícios  `[G]`
**Objetivo:** `classificar`, `ordenar` e `mito_ou_fato`. Os três seguem o fluxo da Prática do M4 (verificar, certa, errada, XP, volta uma vez) e entram também na Revisão.

#### Tela · Classificar
- **Design:** *Prática · Classificar (novo tipo)*.
- **Mostra:** a pergunta ("Em qual Poder fica cada função?"); as funções soltas como botões; as categorias em dois quadros (nome, dica e as funções já colocadas); o aviso "Escolha uma função e depois toque no Poder onde ela fica. Para trocar, toque na função já colocada."
- **Regras:** escolher uma função a deixa azul; aparece o botão tracejado **"Colocar “…” aqui"** em cada categoria; tocar numa função já colocada a devolve. **"Verificar"** só ativa com tudo colocado. Depois de verificar, cada função fica verde ou coral. Acerta só se **todas** estiverem certas. Arrastar e soltar pode ser somado depois, mas o fluxo por toque é o que vale para teclado e leitor de tela.

#### Tela · Ordenar
- **Design:** *Prática · Ordenar (novo tipo)*.
- **Mostra:** a pergunta ("Coloque na ordem: como uma lei nasce?"); as etapas numeradas, embaralhadas, cada uma com os botões **subir** e **descer**; o aviso "Use as setas para subir ou descer cada etapa. A primeira etapa fica no alto."
- **Regras:** os botões nas pontas ficam desativados. Depois de verificar, cada linha fica verde ou coral e as erradas mostram a posição certa ("era a 3ª"); as setas somem. Acerta só com todas na ordem certa.

#### Tela · Mito ou fato
- **Design:** *Prática · Mito ou fato (novo tipo)*.
- **Mostra:** a Capi com um balão "Uma frase que circula por aí" e a frase entre aspas; dois botões grandes, **Mito** e **Fato**.
- **Regras:** depois de verificar, a certa fica verde e, se a pessoa errou, a escolhida fica coral. A explicação cita a lei e o artigo. O texto de acerto diz "Isso mesmo, é mito!" (ou "é fato!") e o de erro diz "Era mito" (ou "Era fato").

**Também neste milestone:** os três tipos têm uma alternativa só com teclado, formatos Zod já prontos (M1), regras de build, exercícios Lorem e entram na seleção da Revisão.

**Pronto quando:** cada tipo funciona só com o teclado e nas sessões de Prática e de Revisão.

---

### M10 · Offline (PWA)  `[M]`
- `vite-plugin-pwa` com manifest (nome, `theme_color: #12A150`, ícones 192, 512 e maskable da Capi).
- Service worker guarda o app e o catálogo; lições já abertas ficam disponíveis offline; as outras são baixadas quando a pessoa abre.
- Aviso discreto "Nova versão disponível" com botão para atualizar (usa o componente `Aviso`).
- Instalável no desktop pelo botão do navegador.
- A Home do visitante já fala "Funciona até sem internet"; este milestone torna isso verdade.

**Pronto quando:** com a internet desligada, abrir o site, uma lição já aberta e a Home funcionam; a Lighthouse PWA passa.

---

### M11 · Módulos e debate entre correntes  `[M]`
#### Tela · Prática · debate entre correntes
- **Design:** *Lição · 7c. Prática (debate entre correntes, só em Módulos)*.
- **Mostra:** o selo "Debate acadêmico", a pergunta "De qual leitura vem este argumento?", o argumento entre aspas e as opções (as leituras); depois de verificar, o quadro **"As duas leituras, lado a lado"** (nome e ano, resumo e referência completa de cada uma); o aviso "Aqui não existe resposta certa sobre qual leitura está correta: os pesquisadores ainda debatem. O que vale ponto é saber quem defende o quê."; o rodapé de feedback do mesmo jeito da Prática.
- **Regras:** o tipo `correntes` só é aceito em Módulos (já validado no M1). Cada leitura tem `fonte` própria. **Nenhuma pergunta pode pedir que a pessoa escolha qual leitura é a melhor.** A pergunta é sempre "quem defende o quê".
- O primeiro Módulo real é escrito e o Módulo Lorem é apagado.

**Pronto quando:** a lição Lorem do Módulo roda de ponta a ponta, e colocar `correntes` num Aprofundamento falha o build.

---

### M12 · Lançamento  `[M]`
**Objetivo:** o site no ar, em `democratiza.app.br`, com conteúdo real.

**Entregas**
- **Conteúdo real:** ao menos a primeira unidade do "Comece por aqui" escrita, com as fontes conferidas à mão e `status: "revisado"`. As pastas Lorem que restarem são apagadas.
- **Domínio:** apontar `democratiza.app.br` para o Cloudflare Pages.
- **Acessibilidade e desempenho:** Lighthouse CI com nota ≥ 90 em Desempenho e Acessibilidade nas telas principais; revisão com leitor de tela na lição inteira; `prefers-reduced-motion` respeitado.
- **Medição e suporte:** Cloudflare Web Analytics (sem cookies); texto do link "Sugerir correção" revisado.
- **Teste final:** o fluxo completo do ARQUITETURA, seção 10, rodando no Playwright contra o site publicado.
- **Divulgação:** ver seção 8.

**Pronto quando:** qualquer pessoa abre `democratiza.app.br`, faz uma lição real, volta no dia seguinte e revisa.

---

## 5. Ajustes de design feitos

Pontos em que o design aprovado divergia do que ficou decidido, já corrigidos no arquivo de design (prancha *Home · visitante*).

| Onde | Era | Agora |
|---|---|---|
| Cabeçalho | "Trilhas" | "Cursos" |
| Passo 1 de "Como funciona" | "Escolha uma trilha" · "pule direto para o tema que mais te interessa" | "Comece pela Introdução" · "Os outros cursos são liberados conforme você aprende os conceitos que eles pedem" |
| Gamificação | "XP e níveis · De Eleitor a Constituinte" | "XP · Cada acerto na prática vale pontos" |
| Gamificação | "Emblemas · Um por unidade concluída" | "Revisão · A Capi traz o conceito de volta" (com ícone de revisão) |
| Princípio "Explicar, nunca torcer" | "mostramos os principais argumentos de cada lado" | "Os debates entre correntes só aparecem nos Módulos, com cada lado apresentado pelos seus autores" |

Mantidos: o selo "Funciona até sem internet" (o modo offline entra no M10, antes do lançamento) e a lição "Desafio da unidade" na página do Curso (agora faz parte do modelo de conteúdo).

---

## 6. Decisões tomadas

| # | Decisão |
|---|---|
| 1 | **Refazer uma lição já concluída não dá XP.** O XP só vem da primeira vez; a Lição concluída avisa isso. |
| 2 | **"Praticar agora" (Caderno) e "Treinar este curso" (Revisar) não dão XP** e não mexem nas caixas de revisão. |
| 3 | **Revisar faz parte do MVP**, e não há fases: tudo é o MVP. |
| 4 | **"Desafio da unidade"** é uma lição `tipo: "desafio"`, sem situação nem explicação, só Prática com os conceitos da unidade. |
| 5 | **Sair da lição pelo X** pede confirmação ("Seu avanço fica salvo"). |
| 6 | **Estimativa de minutos:** 1 min por card + 30 s por exercício, arredondado para cima. Ajustar depois de medir com pessoas reais. |

---

## 7. Telas novas no arquivo de design

Todas as telas que faltavam foram desenhadas, em faixas *"Apoio"* abaixo das telas principais da página *Site (desktop)*.

| Faixa | Telas | Milestone |
|---|---|---|
| Apoio · Lição | Sair da lição (confirmação); Rever explicação (sobre a Prática); Rever o que errei | M3 e M4 |
| Apoio · Home, Caderno e Revisar | Escolha da meta diária; Home com um curso só; Caderno vazio; Revisar sem vencidos; Revisão concluída | M5 e M6 |
| Apoio · Sobre e erros | Confirmações e avisos do Sobre; Página não encontrada (404) | M7 e M0 |
| Apoio · Novos exercícios | Classificar; Ordenar; Mito ou fato (protótipos clicáveis) | M9 |

Os protótipos dos novos exercícios funcionam por clique/toque. O arrastar e soltar, se for adicionado, é um extra sobre o mesmo fluxo.

---

## 8. Trilha paralela: divulgação

Não depende do código. As peças da página *Instagram* do arquivo de design podem ser publicadas assim que o conteúdo que elas citam estiver conferido.

- Antes de publicar qualquer peça, conferir à mão as fontes escritas nela (no post "Mito ou fato": CF art. 77 §2º, Lei 9.504/1997 art. 2º e Código Eleitoral art. 224; no story: CF art. 46 §1º; no carrossel: CF arts. 27, 29, 44 e 66).
- O link na bio só vale depois do M12.
- Novas peças seguem a mesma regra do site: fato verificável, fonte escrita na peça, sem opinião e sem partido.

---

## 9. Resumo da ordem de trabalho

```
M0 Fundação ─► M1 Pipeline ─► M2 Motor ─► M3 Lição 1 ─► M4 Lição 2 ─► M5 Home/Curso
                                                                           │
   M12 Lançamento ◄─ M11 Módulos ◄─ M10 Offline ◄─ M9 Exercícios ◄─ M8 Cursos ◄─ M7 Sobre ◄─ M6 Caderno/Revisar
        │
   ★ NO AR
```

Por que essa ordem: o M1 e o M2 vêm antes de qualquer tela porque todas dependem do formato do conteúdo e da lógica de progresso. A Lição (M3 e M4) vem antes da Home porque é o coração do produto: se ela não for boa, o resto não importa, e dá para validar com o `/_dev` sem precisar da Home. O Caderno e a Revisão (M6) vêm logo depois porque a promessa do produto é "você não esquece". O M12 fica por último para que o site apareça no domínio já completo.
