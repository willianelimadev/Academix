# Plano de implementação — Academix

## Escopo
Construir uma aplicação de gestão acadêmica para o desafio da Codgo.X com Node.js, Express, React.js e integração opcional com LLM. O produto deve permitir consultar alunos, analisar a situação financeira calculada a partir de vencimentos e pagamentos, e conversar com um assistente que responde apenas com base no conjunto de dados fictícios.

## Arquitetura
- **Servidor:** Node.js + Express, com rotas REST em `server/routes/api.js`, dados locais em `server/data/students.js` e regras de domínio em `server/lib`.
- **Cliente:** React + Vite em `frontend/src`, servido pelo Express em produção e acessível via proxy no modo de desenvolvimento.
- **Contrato:** respostas padronizadas no formato `{ data }` para sucesso e `{ error: { code, message, details? } }` para falhas.
- **IA:** modo demonstrativo local por padrão; adaptador OpenAI-compatible no servidor quando `LLM_MODE=api` e `OPENAI_API_KEY` estiver configurada. O navegador nunca recebe credenciais.
- **Persistência:** dados fictícios versionados em memória/arquivo JavaScript, conforme o enunciado.
- **Testes:** `node:test` cobrindo a regra crítica de inadimplência e uma variação de pagamento em dia.

## Estrutura
```text
server/
  app.js                 # Express, middleware, rotas e fallback do SPA
  index.js               # inicialização do listener
  data/students.js       # dataset fictício e projeções de leitura
  lib/financial.js       # regra financeira pura e determinística
  lib/assistant.js       # modo demo e integração LLM segura
  lib/errors.js          # AppError e tratamento consistente
  routes/api.js          # endpoints /api
  tests/financial.test.js
frontend/
  index.html
  src/App.jsx            # composição da experiência
  src/main.jsx
  src/styles.css         # design system responsivo
public/manus-routes.json
```

## Direção visual escolhida

### Alternativas consideradas
- **Editorial acadêmico contemporâneo** — 0,07: tipografia expressiva, papel claro e blocos de informação.
- **Dashboard SaaS genérico** — 0,05: cards previsíveis, azul corporativo e foco em densidade.
- **Observatório operacional** — 0,08: interface escura, azul elétrico, painéis de controle e sinais de status.

### Escolha: Observatório operacional em branco-gelo

**Movimento:** interfaces de observabilidade e command centers, reinterpretadas para contexto acadêmico.

**Princípios:** leitura rápida; hierarquia por estado; profundidade sem excesso de ornamento; ações com feedback imediato.

**Filosofia de cor:** base branco-gelo para ampliar a sensação de clareza e leitura; azul-petróleo no texto para preservar contraste; ciano como assinatura de navegação e confiança; verde e coral apenas para estados financeiros que exigem ação.

**Paradigma de layout:** shell assimétrico com navegação lateral, coluna principal de análise e rail contextual do assistente; no mobile as colunas se empilham mantendo a ordem de decisão.

**Elementos assinatura:** marca com símbolo de órbita; eyebrow monoespaçado para contexto; barras e anéis de progresso com brilho discreto.

**Interação:** selecionar um aluno atualiza contexto e financeiro sem perder a conversa; busca filtra instantaneamente; estados de carregamento preservam a estrutura do painel.

**Animação:** entradas curtas em fade/slide; skeletons sutis; nenhum movimento essencial para compreender o dado.

**Tipografia:** `Space Grotesk` para títulos e labels de produto; `DM Mono` para matrículas, datas, valores e sinais técnicos.

**Essência:** um observatório financeiro-acadêmico para transformar dados escolares em decisões claras. Personalidade: preciso, humano, confiável.

**Voz:** títulos objetivos e microcopy que explica a próxima ação. Exemplos: “Acompanhe a saúde da sua base.” e “O saldo está calculado a partir de vencimentos e pagamentos — sem atalhos.”

**Wordmark:** “ACADEMIX” em caixa alta com um pequeno anel orbital substituindo o ponto do I, reforçando a ideia de visão sistêmica.

**Cor proprietária:** `#58E6E6`, um ciano elétrico levemente esverdeado, usado apenas para marca, foco e dados positivos.

## Critérios de implementação
A aplicação será entregue funcionando localmente com `npm run build && npm start`, com `npm test` cobrindo o bug financeiro, `.env.example` documentando o modo de IA, `README.md` explicando causa-raiz, correção, validação, prevenção e uso de ferramentas de IA.
