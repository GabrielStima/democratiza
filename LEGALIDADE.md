# Democratiza — Legalidade e conformidade

> Documento interno. Explica em que regras o projeto se apoia, quais limites ele respeita e por quê.
> **Não é parecer jurídico.** Foi escrito a partir de um parecer gerado por IA (Gemini) e de uma checagem cruzada com o projeto e com as fontes oficiais, feita em 6 de novembro de 2026. Antes do lançamento (M19), os Termos e a Política de Privacidade passam pela leitura de um advogado.
> O que construir para cumprir cada ponto está nos milestones **M16** e **M17** da [`ESPECIFICACAO.md`](ESPECIFICACAO.md). Leis mudam: revise este documento a cada ano eleitoral e sempre que algum gatilho da seção 12 acontecer.

---

## 1. Resumo

| Tema | Situação | O que fazemos | Base | Onde no projeto |
|---|---|---|---|---|
| Existir como projeto de pessoa física | Pode | Seguir como pessoa física enquanto não houver dinheiro entrando | CF/88, arts. 5º IV e IX, 205, 206 e 209 | — |
| Chamar de "curso" sem o MEC | Pode | Deixar claro que são cursos livres, sem certificado | LDB (Lei 9.394/1996) regula só o ensino formal | Termos (M16) |
| Conteúdo sobre política | Pode | Ficar no "indiferente eleitoral": fatos, regras, instituições | Lei 9.504/1997; Res. TSE 23.610/2019 | Regras da casa (ARQUITETURA, seção 4) |
| Quizzes | Pode, com limites | Só perguntas com resposta certa; nunca levantar opinião sobre eleição | Res. TSE 23.600/2019, art. 23 | Seção 3 e ESPECIFICACAO, seção 8 |
| Impulsionar posts | Arriscado | Não impulsionar sem decisão registrada; nunca no período de campanha | Lei 9.504/1997, art. 57-C | ESPECIFICACAO, seção 8 |
| Escrever com IA | Pode | Revisão humana sempre; aviso de transparência | Não há lei que obrigue (seção 4.4) | Sobre e Termos (M16) |
| Falar de fatos históricos sensíveis | Pode, com cuidado | Narrar com fonte oficial, sem adjetivar pessoas | CP, arts. 138 a 140 | Seção 4.2 |
| Citar leis e obras | Pode | Lei é livre; obra só em trecho curto, com autor e página | Lei 9.610/1998, arts. 8º e 46 | Campo `fonte` |
| Usar marca de outro aplicativo | Não | Nenhuma menção; identidade visual própria | Lei 9.279/1996, art. 195 | M16 e M17 |
| Progresso no navegador e Analytics sem cookies | Pode | Publicar Política de Privacidade | LGPD (Lei 13.709/2018) | `/privacidade` (M16) |
| Adolescentes sem verificação de idade | Pode, com registro | Justificar por escrito; mecânicas sem pressão | ECA Digital (Lei 15.211/2025) | Seção 8 |
| Acessibilidade | Não é obrigatória para nós, mas fazemos | WCAG 2.1, axe-core, Lighthouse ≥ 90 | Lei 13.146/2015, art. 63 | Definição de pronto |
| Cores nacionais | Pode | Uso cívico e respeitoso | Lei 5.700/1971 | Paleta |

---

## 2. Como o projeto existe legalmente

**Liberdade de ensinar.** A Constituição garante a livre expressão da atividade intelectual e científica, sem censura ou licença (art. 5º, IX), e a liberdade de aprender, ensinar e divulgar o saber, com pluralismo de ideias (art. 206, II e III). O ensino é livre à iniciativa privada (art. 209). Uma pessoa física pode criar e manter um site educativo sobre política sem pedir autorização a ninguém.

**Cursos livres.** A LDB e o MEC regulam o ensino formal (educação básica, técnico, graduação, pós). Um curso aberto, gratuito e sem diploma fica fora dessa regulação. Por isso:
- usamos "curso", "unidade" e "lição" sem problema;
- **não** emitimos certificado nem diploma e não usamos palavras que sugiram formação oficial ("certificação", "credenciado", "reconhecido");
- os Termos dizem que são cursos livres, sem relação com o MEC.

**Pessoa física, por enquanto.** Enquanto o único custo for o domínio e não entrar dinheiro, seguir como pessoa física é o mais simples. Se o projeto passar a receber doações ou patrocínio:
- doação para pessoa física pode ser tributada (Imposto de Renda e ITCMD estadual), e os bens pessoais respondem por eventuais processos;
- MEI não serve: é forma de empresa com fins lucrativos, e doação vira receita;
- o caminho indicado é uma **associação civil sem fins econômicos** (Código Civil, art. 53). Ela separa o patrimônio, abre conta própria e pode buscar isenções e editais.

Atenção: se o projeto virar pessoa jurídica, mudam também regras eleitorais (seção 3.6), de guarda de registros (seção 7) e de acessibilidade (seção 9).

---

## 3. Direito eleitoral

Este é o tema mais sensível do projeto. Aqui ficam as regras que valem para o dia a dia e o calendário das próximas eleições.

### 3.1 O princípio: "indiferente eleitoral"
A Justiça Eleitoral só pune como propaganda o conteúdo que busca influenciar a escolha do eleitor numa eleição concreta. A propaganda antecipada se caracteriza, em regra, pelo **pedido explícito de voto** (ou expressões equivalentes, como "apoiem", "elejam", "vamos derrotar") ou pelo uso de meio proibido. Um conteúdo que explica regras, instituições e fatos sem mirar candidato, partido ou eleição específica é um **indiferente eleitoral**: está protegido pela liberdade de expressão e de ensino.

**Enquanto o Democratiza for indiferente eleitoral, quase nenhuma regra eleitoral se aplica a ele.** Todas as regras abaixo existem para que ele continue sendo.

### 3.2 Regras de conteúdo (site e redes)
1. **Não citar** político em atividade, pré-candidato, candidato ou partido por nome, em lição, exercício, exemplo ou peça de divulgação.
2. Nenhum texto avalia governo, partido, candidato ou corrente política como melhor ou pior.
3. Debates entre correntes só nos Módulos, e a pergunta é sempre "quem defende o quê", nunca "quem está certo".
4. Nenhum conteúdo "responde" a um caso que está no noticiário da disputa (por exemplo, uma lição sobre cassação lançada na semana em que um candidato está sendo cassado). Temas atuais estão fora do planejamento por enquanto (ARQUITETURA, decisão "Cursos de atualidade").
5. Conteúdo sobre como votar, urna e apuração segue **só** fontes oficiais (Constituição, leis, TSE). Um erro nesse tema pode ser lido como desinformação sobre o processo eleitoral; por isso a revisão desse tipo de lição é dobrada.

### 3.3 Quizzes e enquetes
- **Quiz** (pergunta com resposta certa, que mede conhecimento) é permitido sempre. É o que o site e a pergunta rápida da Home fazem.
- **Enquete** (sondagem de opinião sem método científico) sobre o processo eleitoral é **proibida** a partir de 16 de agosto do ano da eleição. Enquete apresentada como se fosse pesquisa é tratada como pesquisa sem registro, com multa de R$ 53.205,00 a R$ 106.410,00.
- O **palpite** da etapa Situação não é enquete: é um chute sobre um fato, fica só no aparelho e nunca é somado ou divulgado. Ele nunca pode virar pergunta de opinião sobre eleição.
- No Instagram: só figurinha de quiz. Nada de figurinha de enquete, caixa de perguntas ou votação sobre eleição, candidato, partido ou governo. De 16 de agosto até o fim do 2º turno, nenhuma figurinha de enquete, de tema nenhum.

### 3.4 Impulsionamento (posts pagos)
- A lei proíbe propaganda eleitoral paga na internet, com uma exceção: impulsionamento identificado, contratado **só** por partidos, federações, coligações e candidatos (Lei 9.504/1997, art. 57-C). Pessoa física que impulsiona conteúdo eleitoral leva multa de R$ 5.000,00 a R$ 30.000,00 ou o dobro do gasto, o que for maior.
- Um post educativo indiferente não é propaganda, então em tese pode ser impulsionado. O risco é a Justiça entender o contrário, principalmente se o tema coincidir com a disputa (a jurisprudência do TSE não aceita impulsionamento de mensagem negativa contra adversários, mesmo como "crítica").
- **Regra do projeto:** não impulsionar sem decisão registrada no ARQUITETURA. Se for decidido: só com a autorização de anúncios políticos da Meta (com o rótulo "Pago por…"), nunca de 16 de agosto até o fim do 2º turno, e nunca sobre tema no centro da disputa.

### 3.5 Inteligência artificial nas eleições
As regras do TSE sobre IA (Res. 23.610/2019, com as mudanças das Res. 23.732/2024 e 23.755/2026) valem para **propaganda eleitoral**: rótulo obrigatório em conteúdo sintético e proibição de *deepfake*. Como não fazemos propaganda, elas não nos obrigam diretamente. Mesmo assim, seguimos o espírito delas: toda imagem, áudio ou vídeo gerado por IA leva o rótulo "Feito com IA", e nunca geramos imagem ou voz de pessoa real.

Se um dia o site ganhar um assistente de IA que responde perguntas (por exemplo, "pergunte à Capi"), isso precisa ser reavaliado antes: a Res. 23.755/2026 criou regras para IA generativa usada como fonte de informação eleitoral.

### 3.6 Se o projeto virar pessoa jurídica
A lei proíbe propaganda eleitoral, mesmo gratuita, em sites de pessoas jurídicas (Lei 9.504/1997, art. 57-C, §1º). Se o Democratiza virar associação, o site e os perfis dela não podem hospedar nem repostar propaganda de ninguém. Isso já é a regra do projeto, mas passa a ter multa.

### 3.7 Calendário das próximas eleições
| Data | O que muda |
|---|---|
| Até 5 de março de 2028 | O TSE publica as resoluções das eleições municipais de 2028. **Reler este documento depois delas.** |
| Até 15 de agosto de 2028 | Pré-campanha: enquetes ainda permitidas, mas evitamos qualquer tema eleitoral |
| A partir de 16 de agosto de 2028 | Começa a propaganda eleitoral; **enquetes sobre eleição proibidas**; não impulsionar nada |
| 1º de outubro de 2028 | 1º turno (municipal). No dia, não publicar nada que lembre propaganda |
| 29 de outubro de 2028 | 2º turno, nas cidades com mais de 200 mil eleitores |
| 2030 | Eleições gerais: a mesma lógica, com as resoluções de 2030 |

Eleições suplementares (quando uma eleição é anulada) podem acontecer em qualquer cidade, a qualquer momento. Se uma peça de divulgação for regional, conferir.

---

## 4. Conteúdo: neutralidade, honra, erros e IA

### 4.1 Neutralidade é escolha nossa, não obrigação
Nenhuma lei obriga uma plataforma privada a ser neutra; esse dever é da administração pública (CF, art. 37). O STF derrubou leis que tentavam impor neutralidade ao ensino (como na ADI 5537, de 2020), por violarem a liberdade de ensinar e o pluralismo. Somos apartidários porque é a nossa linha editorial, e isso também nos mantém no "indiferente eleitoral" (seção 3).

### 4.2 Fatos históricos e crimes contra a honra
Calúnia, difamação e injúria (Código Penal, arts. 138 a 140) exigem a intenção de ofender. Narrar um fato de interesse público com base em fonte oficial (*animus narrandi*) não é crime. Para ficar desse lado:
- descrever **o processo** (o que diz a Constituição, quem decidiu, qual foi o resultado), não a pessoa;
- usar fontes oficiais: Diário Oficial, atas do Congresso, decisões do STF e do TSE;
- não usar adjetivos sobre pessoas ("corrupto", "golpista", "herói");
- preferir exemplos com cargos ("o presidente da época") a nomes, sempre que o nome não for indispensável para entender o fato.

### 4.3 Erros factuais
Para alguém ganhar indenização por um erro numa lição gratuita, teria de provar culpa, dano e que o dano veio do erro (Código Civil, arts. 186 e 927), o que é muito improvável. Mesmo assim, os Termos dizem que o conteúdo não substitui as fontes oficiais, é oferecido "no estado em que se encontra" e está sujeito a correção, e o link "Encontrou um erro?" em cada explicação mostra que corrigimos rápido.

### 4.4 Uso de IA na escrita
Hoje nenhuma lei obriga a avisar que um texto foi escrito com apoio de IA. O Marco Legal da IA (PL 2.338/2023) foi aprovado no Senado em dezembro de 2024 e, em novembro de 2026, ainda está na Câmara. As regras do TSE sobre IA valem para propaganda eleitoral (seção 3.5).

Mesmo assim avisamos, por transparência e para nos proteger da acusação de "desinformação automatizada":
- **toda** lição é revisada por uma pessoa antes de virar `revisado` (só o Gabriel marca `revisado`, ver `AGENTS.md`);
- o Sobre tem a seção "Como escrevemos" e cada explicação tem o link "Como este conteúdo é feito" (M16);
- o aviso diz exatamente o que acontece. Não dizemos "revisado por especialistas" enquanto quem revisa não for especialista na área.

---

## 5. Direitos autorais e licenças

**O que podemos usar.** Leis, decretos, decisões judiciais e outros atos oficiais não têm direito autoral (Lei 9.610/1998, art. 8º, I): podemos reproduzi-los à vontade. Obras de autores (livros, artigos) só podem ser **citadas em trechos curtos**, na medida necessária para o estudo, com nome do autor e origem da obra (art. 46, III). É exatamente o que o campo `fonte` faz: o projeto guarda a referência, não o texto da obra. Regras práticas:
- resumir com palavras nossas; citar entre aspas só quando a frase exata importa, e curta;
- nunca copiar parágrafos, tabelas ou esquemas de livros;
- imagens: só as nossas, as de domínio público ou com licença que permita o uso, com crédito.

**Nossas licenças** (arquivos criados no M16):
| O quê | Licença | Arquivo |
|---|---|---|
| Código (`src/`, scripts, plugins) | MIT | `LICENSE` |
| Conteúdo (`content/`: textos, perguntas, esquemas) | Creative Commons BY-NC-SA 4.0 | `content/LICENSE` |
| Fontes Baloo 2 e Nunito | SIL Open Font License 1.1 (a licença precisa ir junto dos arquivos) | `public/fonts/OFL.txt` |
| Nome "Democratiza", logo e a Capi | **Todos os direitos reservados** | `MARCA.md` |

A BY-NC-SA deixa escolas, professores e qualquer pessoa reusarem o conteúdo, com crédito e sob a mesma licença, mas sem uso comercial. A marca fica fora das licenças abertas para que ninguém use a Capi para vender algo ou para fazer propaganda política em nome do projeto.

---

## 6. Marca e identidade visual

**Registro da nossa marca.** No Brasil, quem registra primeiro no INPI tem o direito de uso exclusivo. Sem registro, outra pessoa pode registrar "Democratiza" e nos obrigar a trocar de nome. Tarefa do M16: buscar o nome no INPI (classe 41, educação) e, se estiver livre, pedir o registro da marca mista (nome + Capi).

**Marca de terceiros.** O projeto nasceu inspirado num aplicativo de idiomas muito conhecido. Usar o nome dele para nos apresentar ("somos o … da política") ou copiar o conjunto visual dele pode ser lido como concorrência desleal e aproveitamento parasitário (Lei 9.279/1996, art. 195), com risco de notificação, remoção do site e das redes e pedido de indenização. Por isso:
- **nenhuma menção** ao nome desse aplicativo em texto público: site, repositório (inclusive estes documentos), redes sociais, descrição do GitHub. O CI confere com `npm run checar-marcas` (M16);
- a **mecânica é livre**: XP, sequência de dias, meta diária, revisão espaçada e trilha de lições não pertencem a ninguém e podem continuar;
- o **conjunto visual** precisa ser nosso. Os pontos mais parecidos hoje são a trilha em zigue-zague com balão "Começar" e botão de guia no banner, o rodapé de feedback colorido da Prática, a assinatura do botão 3D e a palavra "ofensiva". Eles são revistos no **M17**.

**Histórico de mudanças de identidade** (preencher no M17):
| Data | O que mudou | Por quê |
|---|---|---|
| — | — | — |

---

## 7. Dados pessoais (LGPD e Marco Civil)

**O que tratamos.**
| Dado | Onde fica | Quem trata | Base legal |
|---|---|---|---|
| Progresso, XP, caderno, configurações | Só no aparelho (`localStorage` e IndexedDB) | Ninguém além da própria pessoa: o dado nunca sai do aparelho | Não há tratamento pelo projeto |
| Arquivo de backup | Onde a pessoa salvar | A própria pessoa | Não há tratamento pelo projeto |
| Endereço IP e dados técnicos de cada acesso | Servidores do Cloudflare, inclusive fora do Brasil | Cloudflare, para hospedar o site e contar visitas sem cookies | Legítimo interesse (LGPD, art. 7º, IX) |
| Relatos de erro | Issues públicas do GitHub | GitHub, sob as regras dele | A pessoa escolhe publicar |

**O que isso significa.**
- O endereço IP é dado pessoal. Como o site é hospedado no Cloudflare, ele passa pelo Cloudflare em todo acesso, com ou sem o Web Analytics. Isso nos coloca como agente de tratamento, em forma simplificada.
- Como pessoa física de pequeno porte, a Resolução CD/ANPD nº 2/2022 dispensa, entre outras coisas, a nomeação formal de encarregado (DPO). **Não** dispensa a transparência: precisamos da Política de Privacidade (`/privacidade`, M16) e de um canal de contato.
- O IP nunca é usado para traçar perfil, e não juntamos dados de fontes diferentes.
- As fontes ficam no próprio site, sem Google Fonts, para não mandar o IP de quem visita para mais ninguém. Nenhum script ou recurso de terceiros entra no site sem passar por este documento.

**Guarda de registros (Marco Civil, art. 15).** A obrigação de guardar registros de acesso por 6 meses vale para provedor de aplicação constituído como **pessoa jurídica**, com atividade organizada, profissional e com fins econômicos. Como pessoa física sem fins econômicos, não nos alcança. Se o projeto virar associação, reavaliar e configurar a retenção.

**Moderação no GitHub.** Issue com propaganda política, ataque pessoal ou dado pessoal (de quem relata ou de terceiros) é ocultada e fechada. O modelo de issue avisa que o relato é público.

---

## 8. Crianças e adolescentes (ECA Digital)

**A lei.** O ECA Digital (Lei 15.211/2025) está em vigor desde 17 de março de 2026 e é regulamentado pelo Decreto 12.880/2026. Ele vale para todo serviço digital **direcionado a crianças e adolescentes ou de acesso provável por eles**, e as consultorias citam plataformas educacionais como exemplo. A ANPD fiscaliza e publicou orientações preliminares sobre aferição de idade (Despacho Decisório CD/ANPD nº 36/2026), baseadas em requisitos como proporcionalidade. A lei não obriga um mecanismo específico.

**Nosso enquadramento (preliminar).** Um site gratuito que ensina política a leigos é atraente para adolescentes de 16 e 17 anos (que já podem votar). Tratamos o Democratiza como **de acesso provável**.

**Por que não verificamos idade.** Verificar idade exigiria coletar data de nascimento, documento ou imagem do rosto, o que vai contra a minimização de dados. O risco do serviço é baixo:
- não tem conta, cadastro nem login;
- não tem anúncio, publicidade nem perfilamento;
- não tem conversa, comentário ou contato entre pessoas;
- não tem conteúdo impróprio, compra ou recompensa aleatória;
- o conteúdo é o mesmo para todo mundo.

Pelo critério de proporcionalidade, a aferição de idade seria desproporcional ao risco. **Conferência com o guia da ANPD** (feita em 6 de novembro de 2026, no guia "Fornecedores de produtos ou serviços de tecnologia da informação: escopo e obrigações gerais do ECA Digital"):
- um serviço de *acesso provável* precisa reunir, **ao mesmo tempo**, três requisitos do art. 1º, parágrafo único: probabilidade de uso e atratividade por crianças e adolescentes, facilidade de acesso e utilização, e **significativo grau de risco** à privacidade, à segurança ou ao desenvolvimento biopsicossocial. O Democratiza atende aos dois primeiros, mas provavelmente não ao terceiro: não coleta dados, não tem conta, anúncio, perfilamento, conversa entre pessoas nem compra;
- o guia avisa que a autoavaliação do fornecedor não vincula a ANPD, que medidas de conformidade (como aferir idade) não servem para afastar os requisitos e que plataformas de natureza educativa podem receber tratamento diferenciado, sem ficar isentas da lei;
- o guia cita notificações, recompensas, rankings e personalização como elementos que aumentam o uso por esse público, e veda interfaces que comprometam a autonomia de quem usa. Por isso as mecânicas foram revisadas (tabela abaixo);
- **conclusão:** mantemos o enquadramento preliminar (tratar como de acesso provável, por prudência), sem aferição de idade, e seguimos as obrigações compatíveis: nada para configurar além do padrão, sem design que pressione, informação compreensível (Política em linguagem simples). Nada além disso foi pedido pelo guia para o nosso caso.
- **Ainda falta:** o guia foi lido por uma ferramenta de resumo automático; conferir os trechos citados (pp. 29 a 42 e 55) no PDF e passar a avaliação pelo advogado, antes do M19.

**Mecânicas de engajamento.** A sequência de dias e a meta diária são mecânicas de engajamento. Para que sigam o melhor interesse de quem é adolescente:
- nenhum texto de culpa, ameaça ou urgência ("você vai perder…");
- nenhuma notificação, contagem regressiva, rolagem infinita, reprodução automática ou recompensa aleatória;
- qualquer mecânica nova passa por este documento antes de entrar.

**Resultado da revisão das mecânicas:**
| Data | O que foi conferido | Resultado |
|---|---|---|
| 06/11/2026 | Textos de ofensiva, meta diária, revisão e Prática (Home, barra do topo, Revisar, Lição concluída, Sobre) | Removido o texto "Estude hoje para manter" da Home (urgência). Os demais são neutros ("Recorde: N dias", "Meta de hoje batida!", "Volta na sua revisão amanhã"). |
| 06/11/2026 | Notificações, contagem regressiva, rolagem infinita, reprodução automática e recompensa aleatória | Nenhum existe. O embaralhamento das opções é repetível (semente fixa) e não dá prêmio. O teste `tests/e2e/mecanicas.spec.ts` trava a volta do texto de pressão e do pedido de notificação. |

**Reavaliar já** se o site ganhar contas, comentários, ranking entre pessoas, notificações ou qualquer forma de anúncio.

---

## 9. Acessibilidade

A Lei Brasileira de Inclusão (Lei 13.146/2015, art. 63) obriga a acessibilidade em sites de empresas com sede ou representação no país e de órgãos de governo. Uma pessoa física, em tese, não está obrigada. Fazemos mesmo assim, porque um projeto de educação cívica que exclui gente não faz sentido: WCAG 2.1, contraste mínimo de 4,5:1, navegação por teclado e leitor de tela, alvos de 44 px, `prefers-reduced-motion`, axe-core no CI e Lighthouse ≥ 90 (ver a definição de pronto da `ESPECIFICACAO.md`). Se o projeto virar associação, isso passa a ser defesa também.

---

## 10. Símbolos nacionais

A Lei 5.700/1971 permite usar os símbolos nacionais em contexto cívico e educativo. Ela proíbe usá-los com desrespeito, mudar suas proporções, cores ou dizeres, ou usá-los como rótulo de produto. O verde e o amarelo da paleta não são símbolo nacional; a bandeira e o brasão, se aparecerem em algum esquema, aparecem inteiros, nas cores oficiais e só para explicar algo. Nunca ao lado de partido, candidato ou governo.

---

## 11. Checklists

### Antes de marcar uma lição como `revisado`
- [ ] Cada frase confere com a fonte citada no card ou no exercício.
- [ ] Toda `fonte.descricao` é específica (lei + artigo, ou obra + autor + ano + página) e o link, quando houver, abre.
- [ ] Nenhum político em atividade, pré-candidato, candidato ou partido citado por nome.
- [ ] Nenhuma avaliação de governo, partido, candidato ou corrente como melhor ou pior.
- [ ] Nenhuma pergunta de opinião; toda pergunta tem resposta certa por fato, consenso acadêmico ou "quem defende o quê".
- [ ] Fatos históricos sensíveis narrados pelo processo, com fonte oficial e sem adjetivo sobre pessoas.
- [ ] Citação de obra: trecho curto, com autor e página; nada copiado além disso.
- [ ] Imagens e esquemas próprios ou com licença que permita o uso, com crédito.
- [ ] Nenhuma marca de terceiros.
- [ ] Lição sobre voto, urna ou apuração: conferida duas vezes, só com fontes oficiais.

### Antes de publicar uma peça nas redes
- [ ] As fontes escritas na peça foram conferidas à mão.
- [ ] Interação só com figurinha de quiz (resposta certa); nenhuma enquete sobre eleição, candidato, partido ou governo.
- [ ] Se for entre 16 de agosto e o fim do 2º turno de um ano eleitoral: nenhuma figurinha de enquete e nada impulsionado.
- [ ] Nenhum político em atividade, partido ou caso do noticiário da disputa.
- [ ] Imagem, áudio ou vídeo feito com IA leva "Feito com IA".
- [ ] Nenhuma marca de terceiros.
- [ ] Não é impulsionada, ou o impulsionamento foi decidido e registrado (seção 3.4).

### Antes do lançamento (M19)
Código (M16 e M17):
- [x] `/privacidade` e `/termos` no ar, linkadas no rodapé, no menu lateral e no Sobre.
- [x] Aviso de IA no Sobre e no pé de cada explicação.
- [x] `LICENSE`, `content/LICENSE`, `public/fonts/OFL.txt` e `MARCA.md` no repositório. (Falta trocar o aviso de `content/LICENSE` pelo texto legal completo da CC BY-NC-SA 4.0.)
- [x] `npm run checar-marcas` no CI e passando.
- [x] Modelo de issue com o aviso de relato público; checklist editorial no modelo de PR.
- [x] Mecânicas revisadas e registradas na seção 8.
- [ ] Identidade própria aplicada (M17) e registrada na seção 6.

Fora do código:
- [ ] Busca no INPI feita e, se livre, pedido de registro da marca enviado.
- [ ] Termos e Política lidos por um advogado.
- [ ] Avaliação do ECA Digital conferida com o guia da ANPD (seção 8). Feita em 06/11/2026 a partir de um resumo; falta conferir o PDF e o advogado.

### Ao entrar num ano eleitoral
- [ ] Ler as resoluções do TSE publicadas até 5 de março e atualizar a seção 3.
- [ ] Marcar no calendário de divulgação o dia 16 de agosto, o 1º e o 2º turno.
- [ ] Rever as peças agendadas para o segundo semestre com o checklist das redes.
- [ ] Rever as lições sobre voto, urna e apuração contra as regras do ano.

---

## 12. Quando reavaliar este documento

Reler e atualizar quando:
- o projeto **receber dinheiro** (doação, patrocínio, edital) ou **virar pessoa jurídica**;
- o site ganhar **contas, login, comentários, ranking, notificações ou anúncios**;
- entrar no site qualquer **script ou serviço de terceiros** (vídeo incorporado, formulário, outro analytics);
- surgir uma **parceria com órgão público** ou escola pública (em ano eleitoral, a publicidade institucional tem limites próprios);
- for decidido **impulsionar** posts;
- o site ganhar um **assistente de IA** que responde perguntas;
- for aprovado o **Marco Legal da IA** ou sair o guia definitivo da ANPD sobre o ECA Digital;
- começar um **ano eleitoral** (2028, 2030…).

---

## 13. Referências

- [Constituição Federal de 1988](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm)
- [Lei 9.504/1997 (Lei das Eleições)](https://www.planalto.gov.br/ccivil_03/leis/l9504.htm)
- [Res. TSE 23.610/2019 (propaganda eleitoral), compilada](https://www.tse.jus.br/legislacao/compilada/res/2019/resolucao-no-23-610-de-18-de-dezembro-de-2019)
- [Res. TSE 23.755/2026 (altera a 23.610)](https://www.tse.jus.br/legislacao/compilada/res/2026/resolucao-no-23-755-de-2-de-marco-de-2026)
- [Res. TSE 23.600/2019 (pesquisas e enquetes), compilada](https://www.tse.jus.br/legislacao/compilada/res/2019/resolucao-no-23-600-de-12-de-dezembro-de-2019)
- [Res. TSE 23.747/2026 (altera a 23.600)](https://www.tse.jus.br/legislacao/compilada/res/2026/resolucao-no-23-747-de-26-de-fevereiro-de-2026)
- [TSE · Temas selecionados: propaganda na internet](https://temasselecionados.tse.jus.br/temas-selecionados/propaganda-eleitoral/internet)
- [Lei 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Lei 12.965/2014 (Marco Civil da Internet)](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm)
- [Resolução CD/ANPD nº 2/2022 (agentes de pequeno porte)](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/regulamentacoes-da-anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022)
- [Lei 15.211/2025 (ECA Digital)](https://www.in.gov.br/web/dou/-/lei-n-15.211-de-17-de-setembro-de-2025-656579619)
- [ANPD · Orientações preliminares sobre aferição de idade](https://www.gov.br/anpd/pt-br/assuntos/eca-digital/mecanismos-confiaveis-de-afericao-de-idade-orientacoes-preliminares.pdf)
- [Lei 9.610/1998 (Direitos Autorais)](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm)
- [Lei 9.279/1996 (Propriedade Industrial)](https://www.planalto.gov.br/ccivil_03/leis/l9279.htm)
- [Lei 13.146/2015 (Lei Brasileira de Inclusão)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm)
- [Lei 5.700/1971 (Símbolos Nacionais)](https://www.planalto.gov.br/ccivil_03/leis/l5700.htm)
- [Código Civil (Lei 10.406/2002)](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm)
- [PL 2.338/2023 (Marco Legal da IA), tramitação](https://www25.senado.leg.br/web/atividade/materias/-/materia/157233)
