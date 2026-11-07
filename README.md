<div align="center">

<img src="public/capi.png" alt="Capi, a capivara mascote do Democratiza" width="150" />

# Democratiza

**Entenda a política do Brasil em poucos minutos por dia.**

Um site gratuito, apartidário e sem cadastro, com lições curtas, prática, revisão e fontes oficiais.

[![CI](https://github.com/GabrielStima/democratiza/actions/workflows/ci.yml/badge.svg)](https://github.com/GabrielStima/democratiza/actions/workflows/ci.yml)
[![Código: MIT](https://img.shields.io/badge/c%C3%B3digo-MIT-0b6e37)](LICENSE)
[![Conteúdo: CC BY-NC-SA 4.0](https://img.shields.io/badge/conte%C3%BAdo-CC%20BY--NC--SA%204.0-1d5fb8)](content/LICENSE)
[![Sem cookies e sem rastreadores](https://img.shields.io/badge/privacidade-sem%20cookies-12a150)](content/legal/privacidade.md)

</div>

---

## O que é

O Democratiza ensina como a política brasileira funciona: instituições, poderes, eleições, direitos. Cada lição parte de uma **situação do dia a dia**, explica com **fonte oficial** e termina com **exercícios**. Quem estuda ganha XP, mantém uma sequência de dias e revisa os conceitos no momento certo, tudo no próprio navegador.

> **Status:** em construção. O site, o motor de ensino e as telas (desktop e celular) estão prontos; o conteúdo real das lições está em produção. Os cursos que aparecem no repositório hoje são de teste (*Lorem Ipsum*, marcados como `rascunho`).

## Princípios

- **Apartidário.** Explica, não opina. Nenhum texto, exemplo ou pergunta toma lado. Debates entre correntes só em Módulos, e nunca pedem que a pessoa escolha a "melhor" leitura.
- **Fonte em tudo.** Todo card, conceito e exercício traz a fonte específica (artigo de lei, obra e capítulo). Sem fonte, o build falha.
- **Sem cadastro, sem rastreio.** Não há conta, cookie nem anúncio. O progresso fica só no seu aparelho, com backup em arquivo. A única medição é o Cloudflare Web Analytics, que não usa cookies.
- **Funciona sem internet.** Instalável no celular e utilizável offline depois da primeira visita.
- **Acessível.** Teclado, leitor de tela, contraste mínimo de 4,5:1 e alvos de toque de 44 px, conferidos com axe-core.
- **Conteúdo é dado.** Cursos, unidades, lições e conceitos são arquivos JSON em `content/`. Um curso novo é só uma pasta nova.

## Como funciona

| Peça | O que faz |
|---|---|
| **Cursos** | Introdução, Aprofundamentos e Módulos, organizados em Curso → Unidade → Lição |
| **Lição** | Situação, explicação em cards com fonte, checagem rápida e prática |
| **Trilha** | Linha do tempo das lições, com a próxima sempre à vista |
| **Sequência e meta** | Dias seguidos estudando e uma meta diária de XP, sem textos de pressão |
| **Revisão espaçada** | Conceitos voltam para revisão em intervalos crescentes (caixas de Leitner) |
| **Caderno** | Os conceitos que você já aprendeu, com busca e filtro por curso |
| **Backup** | Salve e abra seu progresso em um arquivo, sem conta |

## Stack

[Preact](https://preactjs.com) · [Vite](https://vite.dev) · TypeScript estrito · [`preact-iso`](https://github.com/preactjs/preact-iso) · [`@preact/signals`](https://github.com/preactjs/signals) · [Zod](https://zod.dev) · Vitest · Playwright · axe-core · ESLint e Prettier · Cloudflare.

Site estático, sem backend. O conteúdo é lido e validado em tempo de build por um plugin do Vite.

## Rodando localmente

Requer **Node 22.18 ou mais novo**.

```bash
git clone https://github.com/GabrielStima/democratiza.git
cd democratiza
npm install
npm run dev
```

O `npm run dev` mostra também os rascunhos. A página `/_dev` carrega perfis de demonstração, e a `/_estilo` mostra o guia de estilo.

### Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor local, com rascunhos |
| `npm run build` | Build de produção; falha se o conteúdo estiver inválido |
| `npm run typecheck` | Checagem de tipos |
| `npm run lint` | ESLint e Prettier |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes de ponta a ponta (Playwright) |
| `npm run checar-marcas` | Garante que não há marca de terceiros nos textos |
| `npm run novo -- <curso\|unidade\|licao\|conceito> ...` | Cria o esqueleto de conteúdo válido, como `rascunho` |

## Estrutura

```
content/        cursos, unidades, lições e conceitos (JSON) e os textos legais
src/            app: componentes, rotas, motor de ensino, armazenamento
vite-plugins/   plugin que lê, valida e empacota o conteúdo
styles/         tokens.css, a única fonte de cores, raios, sombras e fontes
scripts/        ferramentas de linha de comando
tests/          testes e2e e fixtures de conteúdo inválido de propósito
```

## Como contribuir

- **Encontrou um erro numa lição?** Há um link "Encontrou um erro?" em cada explicação, ou [abra um relato](https://github.com/GabrielStima/democratiza/issues/new/choose). Relatos são públicos: não coloque dados pessoais.
- **Vai mexer no código ou no conteúdo?** Leia o [`AGENTS.md`](AGENTS.md) antes. Ele reúne as regras de ouro, o padrão de commits (Conventional Commits, em português) e a definição de pronto.
- Nenhuma lição é publicada sem revisão humana: só quem mantém o projeto marca uma lição como `revisado`.

## Licenças

| O quê | Licença |
|---|---|
| Código | [MIT](LICENSE) |
| Conteúdo das lições (`content/`) | [CC BY-NC-SA 4.0](content/LICENSE): use, adapte e compartilhe com crédito, sem fins comerciais e sob a mesma licença |
| Fontes Baloo 2 e Nunito | [SIL OFL 1.1](public/fonts/OFL.txt) |
| **Nome, logo e a Capi** | **Todos os direitos reservados**, veja [`MARCA.md`](MARCA.md) |

Quem fizer um *fork* deve trocar o nome, a logo e a Capi por identidade própria.

## Privacidade e termos

Leia a [Política de Privacidade](content/legal/privacidade.md) e os [Termos de Uso](content/legal/termos.md). O Democratiza oferece cursos livres, sem certificado e sem vínculo com o MEC, e não substitui as fontes oficiais.

---

<div align="center">

Feito por [Gabriel Stimamiglio](https://github.com/GabrielStima) com ajuda de IA, e revisado por pessoas.

</div>
