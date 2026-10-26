import { badRequest, AppError } from './errors.js';

function normalize(text) {
  return text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function compactContext(students, selectedStudent) {
  return students.map((student) => ({
    id: student.id,
    nome: student.name,
    curso: student.course,
    matricula: student.registration,
    statusAcademico: student.status === 'active' ? 'ativa' : 'inativa',
    situacaoFinanceira: student.financial.status,
    saldoEmAberto: student.financial.openAmount,
    parcelasEmAtraso: student.financial.overdueCount,
    alunoSelecionado: selectedStudent?.id === student.id
  }));
}

function demoAnswer(question, students, selectedStudent) {
  const normalized = normalize(question);
  const context = compactContext(students, selectedStudent);
  const active = context.filter((student) => student.statusAcademico === 'ativa');
  const overdue = context.filter((student) => student.situacaoFinanceira === 'inadimplente');

  if (normalized.includes('inadimpl') || normalized.includes('atras')) {
    if (!overdue.length) return 'Nenhum aluno está inadimplente nos dados disponíveis.';
    return `Encontrei ${overdue.length} aluno(s) inadimplente(s): ${overdue.map((student) => `${student.nome} (${money(student.saldoEmAberto)} em aberto)`).join(', ')}.`;
  }

  if ((normalized.includes('quantos') || normalized.includes('numero')) && normalized.includes('ativa')) {
    return `${active.length} aluno(s) estão com a matrícula ativa: ${active.map((student) => student.nome).join(', ')}.`;
  }

  if (normalized.includes('resum') && selectedStudent) {
    const statusLabel = selectedStudent.financial.status === 'inadimplente' ? 'inadimplente' : selectedStudent.financial.status === 'pendente' ? 'com vencimentos futuros em aberto' : 'adimplente';
    return `${selectedStudent.name} cursa ${selectedStudent.course} e está com a matrícula ${selectedStudent.status === 'active' ? 'ativa' : 'inativa'}. Na dimensão financeira, está ${statusLabel}, com ${selectedStudent.financial.openCount} parcela(s) em aberto e saldo de ${money(selectedStudent.financial.openAmount)}.`;
  }

  return 'Posso consultar inadimplência, matrículas ativas ou resumir o aluno selecionado. Faça uma pergunta usando os dados disponíveis.';
}

async function callProvider(question, context) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new AppError(503, 'LLM_NOT_CONFIGURED', 'O modo de IA real está selecionado, mas OPENAI_API_KEY não foi configurada.');

  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const timeout = Number(process.env.LLM_TIMEOUT_MS || 12000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 350,
        messages: [
          {
            role: 'system',
            content: 'Você é o assistente da Academix. Responda em português, usando exclusivamente o JSON de dados fornecido. Não invente alunos, valores ou estados. Se a informação não estiver no contexto, diga claramente que não está disponível. Seja breve e cite os nomes relevantes.'
          },
          { role: 'user', content: JSON.stringify({ pergunta: question, dadosDisponiveis: context }) }
        ]
      })
    });

    if (!response.ok) {
      throw new AppError(502, 'LLM_PROVIDER_ERROR', 'O serviço de IA não respondeu corretamente.');
    }

    const payload = await response.json();
    const answer = payload?.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new AppError(502, 'LLM_EMPTY_RESPONSE', 'O serviço de IA retornou uma resposta vazia.');
    return answer;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.name === 'AbortError') throw new AppError(504, 'LLM_TIMEOUT', 'O serviço de IA demorou além do limite configurado.');
    throw new AppError(502, 'LLM_UNAVAILABLE', 'O serviço de IA está indisponível no momento.');
  } finally {
    clearTimeout(timer);
  }
}

export async function answerQuestion({ question, students, selectedStudent }) {
  if (typeof question !== 'string' || question.trim().length < 3) {
    throw badRequest('A pergunta deve ter pelo menos 3 caracteres.', { field: 'question' });
  }
  if (question.trim().length > 500) {
    throw badRequest('A pergunta deve ter no máximo 500 caracteres.', { field: 'question' });
  }

  const context = compactContext(students, selectedStudent);
  const mode = (process.env.LLM_MODE || 'demo').toLowerCase();
  const answer = mode === 'api' ? await callProvider(question.trim(), context) : demoAnswer(question.trim(), students, selectedStudent);

  return { answer, mode: mode === 'api' ? 'api' : 'demo', contextSize: context.length };
}
