# AGENTS.md — Democratiza

Guia para quem escreve código neste repositório (pessoas e agentes de IA). Leia antes de mexer em qualquer coisa.

**Democratiza** é um site gratuito, no estilo Duolingo, que ensina política a brasileiros. É estático, sem backend; o progresso fica no navegador. Mascote: Capi. Domínio: democratiza.app.br.

Documentos de referência (leia na ordem):
1. [`ARQUITETURA.md`](ARQUITETURA.md): o quê e por quê (stack, conteúdo, regras de ensino, rotas, armazenamento).
2. [`ESPECIFICACAO.md`](ESPECIFICACAO.md): o que entregar em cada milestone (M0 a M12), tela a tela, e a definição de pronto.

Não há fases: todo o planejamento é o MVP. Trabalhe um milestone por vez, em ordem.

---

## 1. Stack e comandos

Preact + Vite + TypeScript, `preact-iso`, `@preact/signals`, Zod, Vitest, Playwright, axe-core, ESLint + Prettier. Hospedagem: Cloudflare Pages.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor local, com rascunhos (`VITE_MOSTRAR_RASCUNHOS=1`) |
| `npm run build` | Build de produção; falha se o conteúdo estiver inválido |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint + Prettier (verificação) |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run novo -- <curso\|unidade\|licao\|conceito> ...` | Cria o esqueleto de conteúdo válido, como `rascunho` |
| `npm run limpar` | Roda `node clean-appledouble.mjs` (ver seção 5) |

Os scripts nascem no M0. Se algum ainda não existir, crie-o no milestone certo em vez de contornar.

## 2. Estrutura essencial

```
content/        cursos, unidades, lições e conceitos (JSON). Conteúdo é dado.
src/            app (componentes, rotas, engine, storage, content-schema)
vite-plugins/   plugin que lê, valida e empacota o conteúdo
styles/         tokens.css (única fonte de cores, raios, sombras, fontes)
tests/          unitários, e2e e tests/fixtures/ (conteúdo inválido de propósito)
clean-appledouble.mjs   remove arquivos ._* criados pelo macOS
```

## 3. Regras de ouro

- **Conteúdo é dado.** Nada específico de um curso ou lição entra no código. Para um curso novo, só se adicionam pastas e JSONs em `content/`.
- **Apartidário.** Nenhum texto, exemplo ou pergunta toma lado político. Debates entre correntes só em Módulos, e nunca pedem que a pessoa escolha a "melhor" leitura.
- **Fonte em tudo.** Todo card, conceito e exercício tem `fonte.descricao` específica (obra, capítulo, artigo de lei). Sem fonte, o build falha.
- **Nunca invente** leis, artigos, obras, datas ou números. Se não tiver certeza, deixe o campo marcado como pendente e avise.
- **Lorem Ipsum só como `rascunho`.** Conteúdo de teste nunca vai para a `main` com status diferente de `rascunho`.
- **Só o Gabriel marca `revisado`.** Agentes nunca mudam o status de uma lição para `revisado`.
- **Sem dados pessoais.** Nada de cookies, contas ou rastreadores. Analytics apenas o Cloudflare Web Analytics.

## 4. Boas práticas de desenvolvimento

**Código**
- TypeScript estrito. Sem `any` (use `unknown` e estreite); sem `@ts-ignore` sem comentário explicando.
- Funções do `engine/` são puras e testáveis. Nada de `Date.now()` direto: use `agora()` (relógio injetável).
- Dados que vêm de fora (JSON de conteúdo, `localStorage`, arquivo de backup) são validados com Zod antes de usar.
- Só tokens de `tokens.css` para cor, raio, sombra e fonte. Nenhuma cor solta no código.
- Nomes do domínio em português (`licao`, `conceito`, `caderno`, `ofensiva`); nomes técnicos genéricos podem ficar em inglês. Texto da interface em pt-BR.
- Componentes pequenos e com uma responsabilidade. Prefira composição a configuração.
- Sem dependência nova sem necessidade clara; justifique no commit. JS inicial abaixo de 150 KB (gzip).
- Sem `console.log` esquecido, código comentado ou TODO sem dono.

**Acessibilidade**
- Tudo funciona só com teclado (Tab, Enter, Espaço, Esc), com foco visível.
- Janelas prendem o foco e fecham com Esc. Estados não dependem só de cor.
- axe-core sem problema sério; respeitar `prefers-reduced-motion`.

**Testes**
- Lógica nova ganha teste Vitest; fluxo novo ganha ao menos um teste Playwright.
- Cada regra de validação do build tem uma fixture em `tests/fixtures/`.
- Escreva o teste junto com a mudança, no mesmo commit.

**Design**
- A referência visual é o arquivo *"Democratiza — Design"*. Confira a tela em 1440 px; entregue bem de 1024 px para cima.
- Se o código e o design divergirem, pergunte antes de decidir.

## 5. Git: commits atômicos

Cada commit é **uma mudança lógica**, completa e pequena o bastante para ser entendida (e revertida) sozinha.

- **Um motivo por commit.** Não misture refatoração com funcionalidade, nem formatação com lógica, nem duas telas.
- **Sempre verde.** Em cada commit, `typecheck`, `lint`, `test` e `build` passam. Nada de "conserto no próximo commit".
- **Teste junto.** O teste da mudança entra no mesmo commit dela.
- **Monte o commit com cuidado.** Use `git add -p` para separar mudanças que não pertencem juntas. Antes de commitar, leia `git diff --staged`.
- **Mensagem** no padrão Conventional Commits, em português, no imperativo, até 72 caracteres na primeira linha, com escopo:
  - `feat(licao): mostra a etapa de situação`
  - `fix(engine): zera o xpHoje na virada do dia`
  - `test(conteudo): cobre conceito inexistente`
  - `refactor(storage): extrai a migração de versão`
  - `docs(spec): atualiza o M5`
  - `chore(deps): atualiza o Vite`
  - Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `ci`, `build`. Corpo opcional explica o *porquê*, não o *como*.
- **Branches.** Uma branch por milestone ou fluxo (`m3-licao-situacao`). A `main` está sempre publicável: cada push nela publica no Cloudflare Pages.
- **Nunca** use `--no-verify`, `git push --force` na `main`, nem reescreva histórico já publicado.
- **Commits feitos por agente** terminam com o trailer de coautoria indicado pela ferramenta (`Co-Authored-By: ...`).
- Não commite segredos, `node_modules`, `dist`, nem arquivos do macOS (ver abaixo).

### Ao finalizar um fluxo, antes de commitar

O Mac do Gabriel cria arquivos AppleDouble (`._*`) ao copiar arquivos para discos externos. Eles não podem entrar no repositório. Por isso, **ao terminar um fluxo e antes de cada commit**:

1. Rode as verificações: `npm run typecheck && npm run lint && npm test`.
2. Rode **`node clean-appledouble.mjs`** na raiz do repositório (ou `npm run limpar`). Ele remove recursivamente tudo que começa com `._`, ignorando `.git`, `node_modules` e `coverage`. Aceita pastas como argumento: `node clean-appledouble.mjs src content`.
3. Confira com `git status` que não há nenhum `._*` listado.
4. Só então monte os commits atômicos (`git add -p`) e commite.

O `.gitignore` também ignora esses arquivos como segunda barreira, mas não dispense o script: os `._*` atrapalham ferramentas e o build mesmo sem serem commitados.

## 6. Definição de pronto

Vale a lista da seção "Definição de pronto" da `ESPECIFICACAO.md`. Em resumo: tipos, lint e testes passando; tela conferida contra o design; teclado e axe-core ok; sem erro no console; prévia do Cloudflare funcionando; commits atômicos; `clean-appledouble.mjs` rodado.

## 7. Quando tiver dúvida

- Dúvida de produto, conteúdo ou design: pergunte ao Gabriel; não decida sozinho.
- Decisão ainda aberta no `ARQUITETURA.md` (marcada ⏳): não implemente; pergunte.
- Ao tomar uma decisão nova, registre-a na tabela de decisões do `ARQUITETURA.md` no mesmo PR.
