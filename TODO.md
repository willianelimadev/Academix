# Entregáveis

- [x] **API REST de alunos e financeiro**
  - Expor `GET /api/alunos` para listar alunos fictícios.
  - Expor `GET /api/alunos/:id` para consultar um aluno.
  - Expor `GET /api/alunos/:id/financeiro` para consultar situação financeira.
  - Cada aluno deve possuir nome, curso, matrícula, status e informações financeiras básicas.
  - Validar entradas, tratar não encontrado e responder com códigos HTTP adequados.

- [x] **Regra financeira confiável**
  - Determinar a situação com base em pagamentos e vencimentos registrados.
  - Mensalidade vencida e não paga deve resultar em `inadimplente`.
  - Mensalidade futura e não paga deve resultar em `pendente`, sem ser tratada como atraso.
  - Incluir teste automatizado para a regra.

- [x] **Experiência React responsiva**
  - Exibir listagem de alunos.
  - Permitir busca por nome ou matrícula, com curso incluído como filtro adicional.
  - Visualizar detalhes do aluno selecionado.
  - Exibir situação financeira e parcelas.
  - Exibir estados de carregamento, ausência e erro.

- [x] **Assistente de IA seguro**
  - Expor `POST /api/assistente` para receber pergunta e responder.
  - Implementar modo demonstrativo local claramente identificado.
  - Implementar integração real opcional no servidor, sem chave no front-end.
  - Enviar somente contexto acadêmico necessário e instruir o modelo a não inventar dados.
  - Tratar indisponibilidade e erro do serviço.

- [x] **Entrega reproduzível**
  - Incluir `README.md` com execução, endpoints e decisões técnicas.
  - Incluir `.env.example` sem credenciais.
  - Explicar causa-raiz, correção, validação, prevenção e uso de IA durante o desenvolvimento.
  - Configurar `manus-routes.json` com a rota da aplicação.
  - Validar build, teste, endpoints e Preview.
