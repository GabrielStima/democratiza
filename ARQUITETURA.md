# Democratiza — Arquitetura e Funcionalidades

> Um "Duolingo de política" para brasileiros: lições curtas, gamificadas e acadêmicas sobre política.
> Documento vivo — atualize sempre que uma decisão mudar.
> O que construir, em que ordem e tela a tela está em [`ESPECIFICACAO.md`](ESPECIFICACAO.md).

---

## 1. Visão geral

| Item | Decisão |
|---|---|
| Público | Brasileiros leigos em política, começando do zero |
| Plataforma (v1) | **Desktop primeiro.** Layout responsivo, mas o app pensado para celular fica para depois |
| Proposta | 5 a 7 minutos por dia: primeiro entender o conceito, depois praticar, sempre com fonte específica |
| Custo | ~R$ 40/ano (só o domínio). Site estático em hospedagem gratuita |
| Backend | **Nenhum.** Tudo roda no navegador; progresso salvo localmente |
| Linha editorial | Acadêmica e apartidária. Quem está começando aprende fatos, regras e consensos; debates entre correntes só aparecem nos Módulos (seção 4) |
| Conteúdo | **Dirigido por pastas:** depois que o código estiver pronto, criar curso, unidade ou lição é só adicionar pastas e JSONs em `content/` (seção 6) |
| Mascote | Capi, a capivara (logo atual) |

### Princípios técnicos
1. **Estático primeiro** — o build gera só HTML/CSS/JS/JSON. Qualquer CDN gratuita serve.
2. **Conteúdo é dado** — o código não conhece nenhum curso específico. Ele lê `content/` e monta o site.
3. **Conteúdo quebrado não vai para o ar** — o build valida tudo e falha com uma mensagem clara se algo estiver errado.
4. **Privacidade por padrão** — sem login, sem cookies de rastreamento, sem anúncios.
5. **Leve** — meta de < 150 KB de JS inicial (gzip). Lições baixam sob demanda, então o site não fica pesado quando o conteúdo crescer.

---

## 2. Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Build | **Vite** | Rápido, simples, gera site estático |
| Linguagem | **TypeScript** | Pega erros cedo, ajuda muito no modelo de conteúdo |
| UI | **Preact** (+ `preact-iso` para rotas) | API do React com ~4 KB |
| Estilo | CSS puro com variáveis (tokens do guia de estilo) | Sem dependência extra |
| Estado | Signals (`@preact/signals`) | Simples e reativo |
| Validação do conteúdo | **Zod** | Define o formato de cada JSON uma vez e gera mensagens de erro legíveis |
| Persistência | `localStorage` (progresso) + **IndexedDB** via `idb-keyval` (caderno) | Tudo nativo do navegador |
| Offline/PWA | `vite-plugin-pwa` (Workbox) | Service worker e manifest gerados automaticamente |
| Testes | Vitest (lógica) + Playwright (fluxos) + axe-core (acessibilidade) | Gratuitos, rodam no CI |
| Qualidade do código | ESLint + Prettier + `tsc --noEmit` | Padroniza o código e pega erros antes do CI |
| CI/CD | GitHub Actions | Gratuito para repositório público |
| Hospedagem | **Cloudflare Pages** | Grátis, sem teto de tráfego, permite uso comercial, domínio próprio |

---

## 3. Estrutura de pastas

```
democratiza/
├── ARQUITETURA.md
├── ESPECIFICACAO.md                      # milestones e entregas tela a tela
├── content/                              # TODO O CONTEÚDO (ver seção 6)
│   ├── conceitos/                        # banco único, usado por todos os cursos
│   │   ├── democracia.json
│   │   └── soberania-popular.json
│   └── cursos/
│       ├── 01-comece-por-aqui/           # "01-" = ordem; "comece-por-aqui" = id
│       │   ├── curso.json
│       │   ├── 01-o-que-e-democracia/    # unidade
│       │   │   ├── unidade.json
│       │   │   ├── 01-o-poder-vem-do-povo.json   # lição
│       │   │   └── 02-democracia-direta-e-representativa.json
│       │   └── 02-como-a-democracia-funciona/
│       │       └── ...
│       ├── 02-<um-aprofundamento>/
│       └── 03-<um-modulo>/
├── public/
│   ├── icons/                            # ícones PWA (192, 512, maskable)
│   └── manifest.webmanifest
├── src/
│   ├── main.tsx
│   ├── app/                              # rotas e layout
│   ├── pages/                            # HomeVisitante, HomeAluno, Cursos, Curso, Licao, LicaoFim, Revisar, Caderno, Sobre
│   ├── components/                       # Botao3D, EtapasDaLicao, CardExplicacao, CartaoConceito, Capi...
│   ├── exercises/                        # um componente por tipo de exercício
│   ├── engine/                           # xp.ts, ofensiva.ts, revisao.ts, desbloqueio.ts
│   ├── storage/                          # repositorio.ts, migracoes.ts, exportar.ts
│   ├── content-schema/                   # formatos (Zod) de fonte, conceito, curso, unidade, lição
│   ├── dev/                              # telas só de desenvolvimento: /_estilo e /_dev (seção 7.1)
│   └── styles/tokens.css
├── vite-plugins/conteudo.ts              # lê content/, valida e monta o catálogo (seção 6)
├── scripts/novo.ts                       # cria esqueletos: npm run novo -- licao comece-por-aqui/o-que-e-democracia
└── tests/
```

---

## 4. Método de ensino

No inglês você acumula palavras. Na política você acumula **conceitos**, e o que importa é entender como eles se ligam. Por isso, diferente do Duolingo, toda lição tem uma etapa de **explicação** antes dos exercícios.

### O ciclo de uma lição (5 a 7 minutos)

| # | Etapa | O que acontece | Vale ponto? |
|---|---|---|---|
| 1 | **Situação** (~30 s) | Um caso do dia a dia que gera a pergunta. A pessoa dá um palpite. | Não |
| 2 | **Explicação** (~2 min) | 2 a 4 cards curtos: ideia central, analogia, esquema visual e termos novos destacados com definição. | Não |
| 3 | **Checagem** | 1 pergunta ao fim da explicação (obrigatória) e, se o conteúdo pedir, uma depois de cada card (opcional). Errou? A Capi explica de outro jeito. A checagem final fecha a situação do começo e lembra o palpite. | Não |
| 4 | **Prática** (~3 min) | 5 a 8 exercícios que aplicam o conceito em situações **novas**. Botão "Rever explicação" sempre visível. | Sim (XP) |
| 5 | **Caderno** | Os conceitos da lição viram cartões no Caderno e voltam para revisão em 1, 3, 7, 15 e 30 dias, conforme a pessoa acerta (seção 7.5). | — |

### Três níveis de curso

Os nomes são simples de propósito, porque o público é leigo.

| Nível | Exemplo | Para quem | O que pode ter |
|---|---|---|---|
| **Introdução** | "Comece por aqui" | Quem está começando do zero | Só fatos, regras e consensos acadêmicos |
| **Aprofundamentos** | Um tema mais amplo, visto com mais detalhe | Quem já tem a base | Fatos, regras, consensos e o que cada autor ou corrente defende |
| **Módulos** | "Módulo: Marxismo" | Quem já domina os conceitos daquele tema | Tudo isso, mais os **debates entre correntes** |

O "Comece por aqui" é o ponto de entrada recomendado. Os outros cursos ficam liberados conforme a pessoa aprende os conceitos que eles exigem (seção 7.3), sem precisar terminar cursos inteiros.

### Regras da casa
1. Cada lição ensina **de 1 a 3 conceitos**, nunca mais.
2. Errar na explicação e na checagem **nunca** tira ponto.
3. Toda explicação mostra uma **fonte específica**: obra, autor, ano e página, ou lei e artigo.
4. **Uma pergunta só tem resposta certa quando é sobre fato, consenso acadêmico ou o que um autor ou corrente defende.**
5. **Debates entre correntes só aparecem em Módulos**, quando a pessoa já tem base para entender cada lado. Em Introdução e Aprofundamentos, se um tema tiver debate, o texto pode apenas avisar ("estudiosos discutem isso; você vai ver no Módulo X"), sem explorar. O build bloqueia o tipo de exercício `correntes` fora de Módulos.

### O conceito como unidade de conhecimento
O **conceito** substitui a "palavra" do Duolingo. Os conceitos ficam num **banco único** (`content/conceitos/`), compartilhado por todos os cursos: "democracia" existe uma vez só e qualquer curso pode usá-lo. Cada conceito tem definição em uma frase, exemplo do dia a dia, "não confunda com", pré-requisitos e fonte.

Os conceitos formam um **grafo de pré-requisitos**. O build garante que nenhuma lição usa um conceito que ainda não foi ensinado antes dela.

---

## 5. Modelo de conteúdo

### Hierarquia
**Curso → Unidade → Lição**, com **Conceitos** num banco separado que todos os cursos usam.

### Fonte (campo dentro de cada explicação, conceito e exercício)
A fonte fica **escrita direto no lugar onde é usada**: uma descrição específica e, quando existir, o link. O projeto não guarda o texto das obras, só a referência.

```json
"fonte": {
  "descricao": "Constituição Federal de 1988, art. 1º, parágrafo único",
  "link": "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm"
}
```

```json
"fonte": {
  "descricao": "BOBBIO, N.; MATTEUCCI, N.; PASQUINO, G. Dicionário de Política. 11. ed. Brasília: Editora UnB, 1998, p. <página>."
}
```

- `descricao` é obrigatória e precisa ser específica: lei + artigo, ou obra + autor + ano + página.
- `link` é opcional (livros nem sempre têm).
- A página Sobre junta automaticamente todas as fontes usadas no site numa bibliografia.

### Conceito (`content/conceitos/soberania-popular.json`)

```json
{
  "id": "soberania-popular",
  "nome": "Soberania popular",
  "definicao": "A ideia de que o poder pertence ao povo.",
  "exemplo": "Quando você vota, está exercendo uma parte desse poder.",
  "nao_confunda": "Soberania nacional, que é a independência do país frente a outros países.",
  "requer": ["democracia"],
  "fonte": { "descricao": "Constituição Federal de 1988, art. 1º, parágrafo único", "link": "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" }
}
```

### Curso (`content/cursos/01-comece-por-aqui/curso.json`)

```json
{
  "titulo": "Comece por aqui",
  "nivel": "introducao",
  "descricao": "O básico para entender política: o que é democracia e como ela funciona.",
  "cor": "verde",
  "requer_conceitos": []
}
```

`nivel` aceita `introducao`, `aprofundamento` ou `modulo`. `requer_conceitos` diz o que a pessoa precisa ter no caderno para o curso ser liberado.

### Unidade (`.../01-o-que-e-democracia/unidade.json`)

```json
{ "titulo": "O que é democracia", "descricao": "De onde vem a ideia e o que ela significa hoje." }
```

### Lição (`.../01-o-que-e-democracia/01-o-poder-vem-do-povo.json`)

```json
{
  "titulo": "O poder vem do povo",
  "status": "revisado",
  "ensina": ["soberania-popular"],
  "situacao": {
    "texto": "...",
    "palpites": ["...", "...", "..."]
  },
  "explicacao": [
    {
      "titulo": "...",
      "texto": "Texto com [[termo]] destacado.",
      "analogia": "...",
      "visual": "nome-do-esquema",
      "glossario": { "termo": "Definição curta." },
      "fonte": { "descricao": "Constituição Federal de 1988, art. 1º, parágrafo único", "link": "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" },
      "checagem": {
        "tipo": "multipla_escolha",
        "pergunta": "...",
        "opcoes": ["...", "...", "..."],
        "correta": 1,
        "reexplicacao": "..."
      }
    }
  ],
  "pratica": [
    {
      "tipo": "multipla_escolha",
      "conceitos": ["soberania-popular"],
      "pergunta": "...",
      "opcoes": ["...", "...", "..."],
      "correta": 0,
      "explicacao": "...",
      "fonte": { "descricao": "Constituição Federal de 1988, art. 14", "link": "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" }
    }
  ],
  "revisao": { "por": "Gabriel", "em": "2026-10-28" }
}
```

- **`status`:** `rascunho` ou `revisado`. Rascunhos aparecem só no ambiente local (`npm run dev`); **só lições revisadas vão para o site no ar**. É o fluxo "a IA escreve, o Gabriel valida".
- **`checagem` em cada card:** opcional, **menos no último card, onde é obrigatória**. É essa que fecha a situação e mostra o palpite da pessoa.
- **IDs:** não ficam escritos no JSON. O id de cada curso, unidade e lição é o **nome da pasta ou do arquivo sem o número** (ex.: `comece-por-aqui/o-que-e-democracia/o-poder-vem-do-povo`).

### Tipos de exercício

| Tipo | Quando | Descrição |
|---|---|---|
| `multipla_escolha` | v1 | 1 resposta certa entre 3–4 (usado também nas checagens) |
| `verdadeiro_falso` | v1 | Afirmação + V/F, sempre com o porquê |
| `quem_resolve` | v1 | Situação do dia a dia → qual instituição resolve |
| `classificar` | v1.1 | Arrastar itens para categorias |
| `ordenar` | v1.1 | Ordenar etapas de um processo |
| `mito_ou_fato` | v1.1 | Frases que circulam por aí, com explicação |
| `correntes` | v2, **só em Módulos** | "Qual corrente diria isso?" Associar argumentos a autores ou correntes, sem resposta de opinião |

**Campos de cada tipo.** Todos têm `conceitos`, `explicacao` (por que a resposta é essa), `fonte` e, opcionalmente, `titulo_curto` (o rótulo pequeno acima da pergunta, ex.: "Onde vale?").

| Tipo | Campos próprios |
|---|---|
| `multipla_escolha` | `pergunta`, `opcoes` (3 a 4), `correta` (posição da opção certa, começando em 0) |
| `verdadeiro_falso` | `afirmacao`, `correta` (`true` ou `false`) |
| `quem_resolve` | `situacao`, `opcoes` (instituições ou poderes), `correta` |
| `correntes` | `argumento`, `leituras` (2 ou mais, cada uma com `nome`, `resumo` e `fonte`), `correta` (qual leitura defende o argumento) |

---

## 6. Como o conteúdo vira site

A ideia é: **depois que o código em `src/` estiver pronto, o trabalho do dia a dia é só adicionar pastas e JSONs em `content/`.** O código nunca menciona um curso específico.

### O que o build faz (plugin `vite-plugins/conteudo.ts`)

```
content/ (pastas + JSONs)
   │
   ▼  1. Varre as pastas
   │     · ordem = número no começo do nome ("01-", "02-")
   │     · id    = nome sem o número
   ▼  2. Valida cada arquivo com Zod
   │     · formato certo, campos obrigatórios
   │     · conceitos citados existem
   │     · todo card, conceito e exercício tem fonte com descrição
   │     · o último card de cada lição tem checagem
   │     · nenhuma lição usa conceito ainda não ensinado
   │     · tipo `correntes` só em cursos de nível "modulo"
   │     · se algo falhar: build para e mostra arquivo + problema
   ▼  3. Gera um catálogo leve (títulos, ordem, conceitos de cada lição)
   │     que vai junto com o site
   ▼  4. Cada lição vira um arquivo separado, baixado só quando a pessoa abre
   │
   ▼
Site pronto: menus, Home, lista de cursos e rotas montados a partir do catálogo
```

Exemplo de erro de build:

```
✖ content/cursos/01-comece-por-aqui/01-o-que-e-democracia/02-democracia-direta-e-representativa.json
  pratica[3].conceitos: "representacao-politica" não existe em content/conceitos/
```

### Rotas geradas automaticamente

| Rota | Tela |
|---|---|
| `/cursos` | Todos os cursos, agrupados em Introdução, Aprofundamentos e Módulos |
| `/c/comece-por-aqui` | Página do curso, com unidades e lições |
| `/c/comece-por-aqui/o-que-e-democracia/o-poder-vem-do-povo` | A lição |

### O dia a dia de quem escreve conteúdo

1. `npm run novo -- licao comece-por-aqui/o-que-e-democracia` cria o arquivo da lição com o esqueleto preenchido e `status: "rascunho"`.
2. Escreve (ou pede para a IA escrever) o conteúdo e as fontes.
3. `npm run dev` mostra a lição no navegador e recarrega a cada vez que o arquivo é salvo. Erros aparecem na tela.
4. Confere as fontes, muda para `status: "revisado"` e preenche `revisao`.
5. `git push`. O GitHub Actions valida, o Cloudflare publica e em cerca de 1 minuto está no ar.

### Cuidados
- **Reordenar é livre:** trocar `02-` por `05-` muda só a ordem.
- **Renomear o id quebra o progresso de quem já fez a lição.** Se for preciso, registre a troca em `content/renomeados.json` (`{ "antigo": "novo" }`) e o app migra o progresso sozinho.
- Imagens e esquemas da explicação (`visual`) são componentes prontos em `src/`, chamados pelo nome. Um esquema novo exige código; textos, perguntas, cursos e conceitos não. Se o nome não existir ainda, uma lição `rascunho` mostra um quadro cinza com o nome; uma lição `revisado` faz o build falhar.
- **Rascunhos nas prévias:** o Cloudflare Pages cria uma prévia para cada branch. Nela, e no `npm run dev`, o build roda com `VITE_MOSTRAR_RASCUNHOS=1` e inclui as lições `rascunho`, com uma faixa "Rascunho" na tela. Na `main` a variável fica desligada e só `revisado` entra. Os testes do CI também rodam com ela ligada.
- **Conteúdo de teste:** enquanto o conteúdo real não existe, o projeto usa cursos fictícios em Lorem Ipsum, todos `rascunho` (formato na `ESPECIFICACAO.md`). Quando o conteúdo real entrar, as pastas Lorem são apagadas.

---

## 7. Funcionalidades

### 7.1 Telas (v1, desktop)
| Tela | Rota | Função |
|---|---|---|
| Home · visitante | `/` (sem progresso salvo) | Apresentação, CTA "Começar agora" (leva ao "Comece por aqui") |
| Home · quem já usa | `/` (com progresso salvo) | Menu lateral (Aprender, Cursos, Revisar, Caderno, Sobre); card "Continuar" do **último curso usado**; lista curta "Seus cursos" com o progresso de cada um; ofensiva, meta do dia e revisão de hoje |
| Cursos | `/cursos` | Catálogo em três blocos (Introdução, Aprofundamentos, Módulos); cursos bloqueados mostram quais conceitos faltam |
| Curso | `/c/:curso` | Unidades e lições, com os conceitos de cada lição |
| Lição | `/c/:curso/:unidade/:licao` | Situação → Explicação → Checagem → Prática, indicadas no topo |
| Lição concluída | (dentro da lição) | XP, acertos, tempo, conceitos que foram para o caderno, o que foi desbloqueado; botão "Rever o que errei" |
| Revisar | `/revisar` | Resumo do que vence hoje, agenda das próximas revisões e a sessão de revisão (que reaproveita a tela da Prática), com os conceitos vencidos de **todos** os cursos. Também permite treinar um curso inteiro |
| Caderno | `/caderno` | Conceitos aprendidos, de todos os cursos |
| Sobre | `/sobre` | Princípios, como ensinamos, backup (salvar, abrir, apagar progresso), bibliografia completa (gerada a partir das fontes das lições), como sugerir correção |
| Meta diária | janela sobre `/` na primeira visita | Escolher 20, 50 ou 100 XP antes da primeira lição. **Ainda sem design** |
| Guia de estilo | `/_estilo` | Só em desenvolvimento: tokens e componentes |
| Ferramentas | `/_dev` | Só em desenvolvimento: carregar progresso de demonstração e limpar tudo |

> **Sem tela de perfil na v1.** A rota `/` decide qual Home mostrar olhando se existe progresso no navegador.

### 7.2 Vários cursos ao mesmo tempo
A pessoa pode fazer **vários cursos em paralelo**; sem servidor, isso não custa nada, porque o progresso de cada curso é só um pedaço pequeno do `localStorage`. Para a Home não virar bagunça:
- o destaque é sempre **um curso**, o último usado ("Continuar");
- os outros aparecem numa lista compacta com barra de progresso;
- XP, ofensiva, meta diária, caderno e revisão são **únicos**, somando todos os cursos.

### 7.3 Desbloqueio
- "Comece por aqui" está sempre liberado.
- Um curso é liberado quando todos os `requer_conceitos` estão no caderno da pessoa, venham de onde vierem.
- Dentro de um curso, as lições seguem em ordem.

### 7.4 Gamificação (v1 enxuta, tudo calculado no navegador)
- **XP:** só na Prática e na Revisão. +10 por acerto de primeira, +5 se acertar depois de errar.
- **Erro na Prática:** a pessoa vê a resposta certa e a explicação, e a pergunta volta **uma vez** no fim da fila da lição (acertando, +5). O conceito vai para a caixa 1 da revisão. Na tela final, "Acertos" conta só os de primeira.
- **Ofensiva (dias seguidos):** +1 por dia com ao menos 1 lição ou revisão concluída. Usa a data local do aparelho.
- **Meta diária:** 20 / 50 / 100 XP, escolhida na primeira visita.
- **Caderno de conceitos:** a "coleção" do usuário.
- **Fica para depois:** vidas, níveis, emblemas e perfil.

### 7.5 Revisão espaçada
Por **conceito**, não por pergunta. Sistema Leitner de 5 caixas em IndexedDB, intervalos de 1, 3, 7, 15 e 30 dias. Errou → caixa 1; acertou → sobe uma caixa. "Revisar" sorteia perguntas de prática de lições já feitas, dos conceitos vencidos. A sessão tem no máximo 10 conceitos, um exercício por conceito. O "Treinar este curso" é treino livre: sem XP e sem mexer nas caixas.

### 7.6 Persistência e backup
```ts
// localStorage["democratiza:v1"]
{
  versao: 1,
  xp: 340,
  xpHoje: { dia: "2026-10-28", valor: 30 },
  ofensiva: { atual: 7, recorde: 12, ultimoDia: "2026-10-28" },
  diasEstudados: ["2026-10-26", "2026-10-27", "2026-10-28"],   // últimos 30 dias, para os pontinhos da semana na Home
  cursoAtual: "comece-por-aqui",
  licoesConcluidas: {
    "comece-por-aqui/o-que-e-democracia/o-poder-vem-do-povo": { acertos: 6, total: 6, em: "2026-10-25" }
  },
  licaoEmAndamento: { id: "comece-por-aqui/o-que-e-democracia/democracia-direta-e-representativa", etapa: "explicacao", card: 1 },
  config: { metaDiaria: 50, som: true }
}
// IndexedDB "caderno": { conceitoId, caixa: 1..5, proximaRevisao, ultimaRevisao, aprendidoEm, licaoId }
//   licaoId alimenta o "Aprendido em" do cartão; ultimaRevisao alimenta o "visto há" da tela Revisar
```
- **Migrações versionadas** (`storage/migracoes.ts`) e `content/renomeados.json` para nunca quebrar progresso antigo.
- **Exportar/Importar** progresso como arquivo `.json`: é o jeito de trocar de computador ou navegador sem backend.
- Pedir `navigator.storage.persist()` para reduzir o risco do navegador apagar os dados.

### 7.7 PWA / offline
- Manifest com nome, cores (`theme_color: #12A150`) e ícones da Capi.
- Service worker guarda o app e as lições já abertas; o catálogo fica sempre disponível.
- Lembretes: sem servidor não há push de verdade. Fica para depois.

### 7.8 Sugerir correção
Cada explicação tem um link "Encontrou um erro?" que abre uma issue pré-preenchida no GitHub com o id da lição e do card.

### 7.9 Métricas (opcional)
Cloudflare Web Analytics (grátis, sem cookies). Nunca rastrear respostas individuais.

---

## 8. Design (resumo do guia de estilo)

| Token | Valor | Uso |
|---|---|---|
| `--verde-ipe` | `#12A150` | Botões principais, acertos |
| `--verde-mata` | `#0B6E37` | "Sombra 3D" dos botões, links |
| `--verde-noite` | `#0B3D20` | Títulos, rodapé |
| `--amarelo-ouro` | `#FFC928` | XP, destaques |
| `--azul-anil` | `#1D5FB8` | Informação, botão secundário |
| `--coral` | `#E05454` | Erros |
| `--capivara` | `#9A6236` | Ilustrações |
| `--nevoa` | `#F3F8F1` | Fundos de seção |

- **Fontes:** Baloo 2 (títulos) + Nunito (texto), hospedadas junto com o site.
- **Botões 3D:** `border-bottom: 5px solid <tom escuro>`, raio 16 px, texto em caixa alta.
- **Acessibilidade:** contraste mínimo 4,5:1, alvos de clique ≥ 44 px, navegação por teclado, `prefers-reduced-motion` respeitado, português simples.

**Arquivo de design:** "Democratiza — Design", com duas páginas: *Site (desktop)*, que é a referência visual de cada tela da `ESPECIFICACAO.md`, e *Instagram*, com o material de divulgação.

### 8.1 Material de divulgação (Instagram)
A página *Instagram* traz: foto de perfil, post de lançamento, post "Mito ou fato" (2 imagens), carrossel "Quem faz as leis no Brasil?" (5 imagens) e story de quiz. Vale a mesma regra do site: só fato verificável, com a fonte escrita na própria peça, sem opinião e sem partido. Como os posts reaproveitam conteúdo das lições, as fontes e os números de cada peça precisam ser conferidos antes de publicar.

---

## 9. Qualidade e processo editorial

- **Fontes específicas sempre:** lei + artigo, ou obra + autor + ano + página, com link quando houver. Ficam junto de cada explicação para serem conferidas à mão.
- **Quem escreve e revisa:** Gabriel + IA. A IA rascunha e indica as fontes; o Gabriel confere e muda o `status` para `revisado`.
- Evitar citar políticos em atividade por nome — foco em conceitos, instituições e regras.

---

## 10. Testes e CI

GitHub Actions em todo push:
1. Validação do conteúdo (o mesmo plugin do build)
2. `vitest` — XP, ofensiva (virada de dia e fuso), Leitner, desbloqueio por conceitos, migrações
3. `playwright` — abrir site → fazer lição → ver Home com progresso → exportar/importar
4. Lighthouse CI — performance e acessibilidade ≥ 90
5. Deploy automático da `main` no Cloudflare Pages

---

## 11. Roadmap

Cada fase corresponde a milestones da [`ESPECIFICACAO.md`](ESPECIFICACAO.md).

| Fase | Milestones | O que a pessoa consegue fazer |
|---|---|---|
| **MVP (desktop)** | M0 a M7 | Entrar, fazer lições completas, acompanhar ofensiva e meta, guardar conceitos no Caderno, revisar o que está esquecendo e fazer backup. No ar em democratiza.app.br com as primeiras unidades reais do "Comece por aqui" |
| **v1.1** | M8 a M10 | Catálogo de cursos com desbloqueio por conceitos, exercícios `classificar`, `ordenar` e `mito_ou_fato`, uso offline (PWA), primeiro Aprofundamento |
| **v2** | M11 em diante | Primeiro Módulo com o tipo `correntes`; depois, versão pensada para celular e modo escuro |
| **Depois** | Cursos sobre temas atuais (só depois que a base de conceitos estiver sólida). Sincronizar entre aparelhos exigiria backend (Supabase ou Firebase, plano grátis) |

---

## 12. Limitações conhecidas (por não ter backend)

- Progresso não sincroniza entre aparelhos (mitigado com exportar/importar).
- Limpar dados do navegador apaga o progresso (mitigado com `storage.persist()` e lembrete de backup).
- Sem ranking entre usuários e sem notificações push.
- O conteúdo inteiro é público (ok — é educativo e o repositório é aberto).

---

## 13. Decisões

| Tema | Decisão |
|---|---|
| Framework | ✅ Preact |
| Hospedagem | ✅ Cloudflare Pages |
| Domínio | ✅ democratiza.app.br (registro.br, cerca de R$ 40/ano) |
| Quem revisa o conteúdo | ✅ Gabriel + IA |
| Código aberto | ✅ Repositório público no GitHub |
| Organização | ✅ Curso → Unidade → Lição; cursos em três níveis (Introdução, Aprofundamentos, Módulos); conceitos num banco único |
| Entrada | ✅ "Comece por aqui" (Introdução) |
| Dependência entre cursos | ✅ Por conceito, não por curso inteiro |
| Vários cursos ao mesmo tempo | ✅ Sim, com um curso em destaque na Home |
| Debates entre correntes | ✅ Só em Módulos |
| Cursos de atualidade | ✅ Não por enquanto |
| Fontes | ✅ Campo `fonte` em cada explicação, conceito e exercício: descrição específica + link opcional |
| Conteúdo enquanto não existe o real | ✅ Lorem Ipsum em cursos fictícios, todos `rascunho` |
| Rascunhos nas prévias | ✅ Aparecem no `npm run dev` e nas prévias do Cloudflare; na `main` só `revisado` |
| Revisar no MVP | 🟡 Proposta: entra no MVP (a tela final promete "volta para revisão amanhã"); o catálogo **Cursos** e o desbloqueio ficam para a v1.1 |
| Treino livre de um curso | 🟡 Proposta: sem XP e sem mexer nas caixas de revisão |
| Conteúdo exato e ordem dos cursos | ⏳ A definir com calma |

Legenda: ✅ decidido · 🟡 proposta para você confirmar · ⏳ em aberto.
