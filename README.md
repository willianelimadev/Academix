# Academix — Gestão Acadêmica

Aplicação full stack criada para o desafio prático de Desenvolvedor Full Stack Sênior da Codgo.X. O projeto apresenta uma visão operacional de alunos, situação financeira calculada por vencimentos/pagamentos e um assistente com modo demonstrativo local e integração real opcional com uma API compatível com OpenAI.

## O que foi implementado

O back-end usa Node.js + Express e expõe `GET /api/alunos`, `GET /api/alunos/:id`, `GET /api/alunos/:id/financeiro` e `POST /api/assistente`. Os dados são fictícios e ficam em `server/data/students.js`. A API valida IDs, limita o tamanho da pergunta e do termo de busca, trata recursos inexistentes e mantém um formato consistente de erro.

O front-end usa React + Vite. A tela possui busca por nome, matrícula ou curso, lista de alunos, detalhes, parcelas com status individual, indicadores gerais, situação financeira, feedback de carregamento, estados vazios e mensagens de erro. A aplicação é responsiva: em telas menores, a lista e os detalhes alternam por um controle simples e o assistente ocupa uma seção própria.

## Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Execução local

```bash
cp .env.example .env
npm install
npm test
npm run build
npm start
```

Depois, abra `http://localhost:3000`. O comando `npm run build` gera o React em `frontend/dist`, e o Express serve a SPA e a API na mesma porta. Para desenvolvimento com Vite e recarga rápida, use dois terminais:

```bash
npm run server
npm run frontend:dev
```

Nesse modo, acesse `http://localhost:5173`; o Vite encaminha `/api` para o servidor na porta 3000.

## Assistente de IA

O modo padrão é `LLM_MODE=demo`. Ele responde localmente a perguntas como “Quais alunos estão inadimplentes?”, “Quantos alunos estão com matrícula ativa?” e “Resuma a situação financeira do aluno selecionado.” Esse modo é proposital: torna a entrega reproduzível sem exigir uma credencial externa e está identificado na própria interface como `DEMO`.

Para usar um provedor compatível com OpenAI, configure somente no servidor:

```env
LLM_MODE=api
OPENAI_API_KEY=sua-chave-fora-do-repositorio
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

O cliente nunca acessa `OPENAI_API_KEY`. O servidor monta um contexto mínimo com nome, curso, matrícula, status acadêmico, situação financeira, saldo em aberto e quantidade de parcelas atrasadas. O prompt instrui o modelo a usar exclusivamente esse contexto e a declarar quando a informação não estiver disponível. Há timeout e tratamento específico para credencial ausente, resposta vazia, indisponibilidade e erro do provedor. Nenhuma chave real deve ser adicionada ao Git.

## Regra financeira e correção do bug

### Possível causa-raiz

A causa mais provável do problema descrito no desafio é a interface confiar em um campo estático ou em um `status` calculado somente quando o aluno foi criado. Outra possibilidade é marcar qualquer parcela não paga como atraso, o que também confunde parcelas futuras com vencidas. Em ambos os casos, o estado exibido deixa de refletir os registros de pagamento e vencimento.

### Como a correção foi implementada

`server/lib/financial.js` concentra a regra em uma função pura: cada parcela sem `paidAt` é considerada aberta; ela só recebe `overdue=true` quando seu vencimento já passou em relação à data de referência. A situação geral é `inadimplente` se existir ao menos uma parcela vencida e não paga, `pendente` quando existem somente parcelas futuras em aberto e `adimplente` quando não existe saldo aberto. A API de listagem e a API financeira usam essa mesma função, evitando divergência entre tela e back-end.

### Como o resultado foi validado

O comando `npm test` executa três testes automatizados com o runner nativo do Node: mensalidade vencida sem pagamento vira inadimplente; mensalidade futura sem pagamento vira pendente; parcela paga vira adimplente. O painel também mostra o status de cada parcela e uma observação explícita de que o cálculo usa `paidAt` e vencimento no servidor.

### Como evitar reincidência

A regra deve permanecer isolada e coberta por testes de borda. Em uma evolução de produção, eu adicionaria testes de contrato dos endpoints, validação de datas com timezone definido, testes de integração da tela e monitoramento para comparar a quantidade de parcelas vencidas com os estados exibidos. Também removeria qualquer status financeiro persistido como fonte de verdade: o estado deve ser derivado dos eventos financeiros.

## Decisões técnicas

A escolha por dados locais atende ao enunciado e mantém o desafio executável sem infraestrutura. A escolha por uma API única em Express simplifica o Preview e reduz configuração de CORS. A separação em `data`, `lib` e `routes` deixa a regra de domínio testável sem subir servidor. A interface usa CSS próprio e componentes pequenos para preservar clareza sem adicionar uma biblioteca visual desnecessária.

## Endpoints principais

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Health check do serviço |
| GET | `/api/alunos` | Lista alunos; aceita `?q=` opcional |
| GET | `/api/alunos/:id` | Consulta aluno por ID |
| GET | `/api/alunos/:id/financeiro` | Calcula situação financeira |
| POST | `/api/assistente` | Recebe `{ question, studentId? }` |

Exemplo de chamada ao assistente:

```bash
curl -X POST http://localhost:3000/api/assistente \\
  -H 'Content-Type: application/json' \\
  -d '{"question":"Quais alunos estão inadimplentes?"}'
```

## Uso de ferramentas de IA durante o desenvolvimento

Ferramentas de IA foram usadas como apoio para decompor o escopo, revisar a estrutura de endpoints, sugerir casos de teste e acelerar a escrita inicial de componentes. O código produzido foi validado manualmente contra o enunciado, revisado para remover credenciais, testado com `npm test` e compilado com `npm run build`. A regra financeira, os limites de segurança e o contrato de erro foram definidos e conferidos antes da entrega; a IA não é tratada como fonte de verdade dos dados acadêmicos.

## Estrutura resumida

```text
server/                 API, domínio, dados e testes
frontend/               React, Vite e estilos da interface
public/manus-routes.json
.env.example
plan.md
TODO.md
```
