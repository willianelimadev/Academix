import { useEffect, useMemo, useState } from 'react';

const statusLabels = {
  adimplente: 'Adimplente',
  inadimplente: 'Inadimplente',
  pendente: 'Pendente'
};

const iconPaths = {
  search: 'M11 19a8 8 0 1 1 5.293-14.043A8 8 0 0 1 11 19Zm0-14a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm5.65 10.236 4.557 4.557-1.414 1.414-4.557-4.557 1.414-1.414Z',
  grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  spark: 'm12 2 1.55 6.45L20 10l-6.45 1.55L12 18l-1.55-6.45L4 10l6.45-1.55L12 2Zm7 14 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z',
  users: 'M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-7.5a3.5 3.5 0 0 1 0 7M18 15h.5a3.5 3.5 0 0 1 3.5 3.5V20',
  trend: 'M4 19V5m0 14h16M7 15l3-4 3 2 5-7',
  arrow: 'M5 12h13m-5-5 5 5-5 5',
  close: 'm6 6 12 12M18 6 6 18',
  mail: 'M4 6h16v12H4V6Zm0 1 8 6 8-6',
  calendar: 'M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z',
  wallet: 'M4 7h16v12H4V7Zm0 0V5h13v2m3 5h-4a2 2 0 1 0 0 4h4v-4Z',
  check: 'm5 12 4 4L19 6',
  alert: 'M12 4 21 20H3L12 4Zm0 5v5m0 3v.01',
  chevron: 'm9 18 6-6-6-6',
  send: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13',
  menu: 'M4 6h16M4 12h16M4 18h16',
  pulse: 'M3 12h4l2-7 4 14 2-7h6',
  info: 'M12 16v-4m0-4h.01M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Z'
};

function Icon({ name, size = 18, stroke = 1.8 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}

async function request(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || 'Não foi possível concluir a solicitação.');
  return payload;
}

function formatCurrency(value = 0) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`)).replace('.', '');
}

function StatusPill({ status }) {
  const icon = status === 'inadimplente' ? 'alert' : status === 'adimplente' ? 'check' : 'calendar';
  return <span className={`status-pill status-${status}`}><Icon name={icon} size={13} />{statusLabels[status] || status}</span>;
}

function Avatar({ initials, large = false, tone = '' }) {
  return <div className={`avatar ${large ? 'avatar-large' : ''} ${tone}`}>{initials || 'AC'}</div>;
}

function LoadingLines({ compact = false }) {
  return <div className={`loading-lines ${compact ? 'compact' : ''}`}><span /><span /><span /></div>;
}

function EmptyState({ title, description }) {
  return <div className="empty-state"><div className="empty-icon"><Icon name="search" size={20} /></div><strong>{title}</strong><span>{description}</span></div>;
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [search, setSearch] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantMode, setAssistantMode] = useState('demo');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState('');
  const [messages, setMessages] = useState([
    { id: 'intro', role: 'assistant', text: 'Olá. Eu consulto os dados acadêmicos disponíveis e sinalizo quando uma informação não está no contexto.' }
  ]);
  const [mobilePanel, setMobilePanel] = useState('detail');

  useEffect(() => {
    let mounted = true;
    request('/health').then((payload) => mounted && setAssistantMode(payload.assistantMode || 'demo')).catch(() => {});
    setListLoading(true);
    request('/api/alunos')
      .then((payload) => {
        if (!mounted) return;
        setStudents(payload.data || []);
        setSelectedId(payload.data?.[0]?.id || null);
      })
      .catch((error) => mounted && setGlobalError(error.message))
      .finally(() => mounted && setListLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let mounted = true;
    setDetailLoading(true);
    setDetailError('');
    Promise.all([request(`/api/alunos/${selectedId}`), request(`/api/alunos/${selectedId}/financeiro`)]).then(([detailPayload, financialPayload]) => {
      if (!mounted) return;
      setStudentDetail(detailPayload.data);
      setFinancial(financialPayload.data);
    }).catch((error) => mounted && setDetailError(error.message)).finally(() => mounted && setDetailLoading(false));
    return () => { mounted = false; };
  }, [selectedId]);

  const filteredStudents = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return students;
    return students.filter((student) => `${student.name} ${student.registration} ${student.course}`.toLocaleLowerCase('pt-BR').includes(normalized));
  }, [students, search]);

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter((student) => student.status === 'active').length,
    overdue: students.filter((student) => student.financialStatus === 'inadimplente').length,
    openAmount: students.reduce((sum, student) => sum + (student.openAmount || 0), 0)
  }), [students]);

  async function submitQuestion(question = assistantQuestion) {
    const trimmed = question.trim();
    if (!trimmed || assistantLoading) return;
    setAssistantQuestion('');
    setAssistantError('');
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', text: trimmed }]);
    setAssistantLoading(true);
    try {
      const payload = await request('/api/assistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, studentId: selectedId })
      });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: payload.data.answer, mode: payload.data.mode }]);
    } catch (error) {
      setAssistantError(error.message);
    } finally {
      setAssistantLoading(false);
    }
  }

  const selectedStudent = studentDetail || students.find((student) => student.id === selectedId);
  const paidPercent = financial?.installmentCount ? Math.round((financial.paidCount / financial.installmentCount) * 100) : 0;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><span /><span /><span /></div>
          <div><strong>ACADEMIX</strong><small>ACADEMIC OPERATIONS</small></div>
        </div>
        <div className="topbar-meta"><span className="live-dot" /> <span>Dados de demonstração</span><span className="topbar-divider" /><span className="date-stamp">25 OUT 2026</span></div>
        <button className="mobile-menu" type="button" aria-label="Alternar painel" onClick={() => setMobilePanel(mobilePanel === 'list' ? 'detail' : 'list')}><Icon name="menu" /></button>
      </header>

      <div className="workspace">
        <aside className={`sidebar panel ${mobilePanel === 'list' ? 'mobile-visible' : ''}`}>
          <div className="sidebar-heading"><div><span className="eyebrow">01 / REGISTRO</span><h2>Alunos</h2></div><span className="count-badge">{stats.total.toString().padStart(2, '0')}</span></div>
          <label className="search-box"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou matrícula" aria-label="Buscar aluno por nome ou matrícula" /><kbd>⌘ K</kbd></label>
          <div className="list-toolbar"><span>{filteredStudents.length} resultados</span><button type="button" onClick={() => setSearch('')} disabled={!search}>Limpar</button></div>
          <div className="student-list" aria-live="polite">
            {listLoading && <><LoadingLines compact /><LoadingLines compact /></>}
            {!listLoading && globalError && <div className="inline-error"><Icon name="alert" size={16} />{globalError}</div>}
            {!listLoading && !globalError && filteredStudents.map((student, index) => (
              <button key={student.id} type="button" className={`student-row ${student.id === selectedId ? 'selected' : ''}`} onClick={() => { setSelectedId(student.id); setMobilePanel('detail'); }}>
                <Avatar initials={student.initials} tone={`tone-${index % 4}`} />
                <span className="student-row-copy"><strong>{student.name}</strong><small>{student.registration} · {student.course}</small></span>
                <span className={`row-signal ${student.financialStatus}`} />
              </button>
            ))}
            {!listLoading && !globalError && filteredStudents.length === 0 && <EmptyState title="Nenhum aluno localizado" description="Tente buscar por outro nome ou matrícula." />}
          </div>
          <div className="sidebar-footer"><div className="legend"><span className="legend-dot healthy" /> Em dia <span className="legend-dot attention" /> Exige atenção</div><span className="sync-label"><Icon name="pulse" size={13} /> sync ativo</span></div>
        </aside>

        <main className={`main-panel ${mobilePanel === 'detail' ? 'mobile-visible' : ''}`}>
          <section className="hero-row"><div><span className="eyebrow">PAINEL DE CONTROLE <i>↗</i></span><h1>Acompanhe a saúde<br /><em>da sua base.</em></h1></div><div className="hero-note"><span className="note-line" /><p>Visão consolidada de matrícula,<br />presença financeira e próximos passos.</p></div></section>

          <section className="stat-grid" aria-label="Indicadores da base">
            <div className="stat-card"><div className="stat-card-head"><span>BASE TOTAL</span><Icon name="users" size={17} /></div><strong>{stats.total.toString().padStart(2, '0')}</strong><small><span className="positive">+{stats.active}</span> matrículas ativas</small></div>
            <div className="stat-card accent"><div className="stat-card-head"><span>MATRÍCULAS ATIVAS</span><Icon name="trend" size={17} /></div><strong>{stats.active.toString().padStart(2, '0')}</strong><small><span className="positive">83,3%</span> da base total</small></div>
            <div className="stat-card warning"><div className="stat-card-head"><span>EM ATENÇÃO</span><Icon name="alert" size={17} /></div><strong>{stats.overdue.toString().padStart(2, '0')}</strong><small><span className="warning-text">requer ação</span> financeira</small></div>
            <div className="stat-card"><div className="stat-card-head"><span>SALDO EM ABERTO</span><Icon name="wallet" size={17} /></div><strong className="currency-stat">{formatCurrency(stats.openAmount)}</strong><small><span className="muted">vencido + previsto</span></small></div>
          </section>

          <section className="content-card detail-card">
            {detailLoading && <div className="detail-loading"><LoadingLines /></div>}
            {!detailLoading && detailError && <div className="content-error"><Icon name="alert" /> <strong>Não foi possível carregar este aluno.</strong><span>{detailError}</span></div>}
            {!detailLoading && !detailError && selectedStudent && financial && <>
              <div className="detail-header"><div className="identity"><Avatar initials={selectedStudent.initials} large tone="tone-identity" /><div><span className="eyebrow">ALUNO SELECIONADO</span><h2>{selectedStudent.name}</h2><p>{selectedStudent.course} <span className="separator">/</span> matrícula <strong>{selectedStudent.registration}</strong></p></div></div><StatusPill status={financial.status} /></div>
              <div className="detail-meta"><span><Icon name="mail" size={15} />{selectedStudent.email}</span><span><Icon name="calendar" size={15} />Desde {formatDate(selectedStudent.joinedAt)} de {new Date(`${selectedStudent.joinedAt}T12:00:00`).getFullYear()}</span><span className={selectedStudent.status === 'active' ? 'meta-active' : 'meta-inactive'}><i /> Matrícula {selectedStudent.status === 'active' ? 'ativa' : 'inativa'}</span></div>
              <div className="finance-overview"><div className="finance-copy"><span className="eyebrow">RADAR FINANCEIRO · {financial.asOf}</span><h3>{financial.status === 'inadimplente' ? 'Há parcelas pedindo atenção.' : financial.status === 'pendente' ? 'Tudo certo por enquanto.' : 'Situação financeira saudável.'}</h3><p>{financial.status === 'inadimplente' ? `Encontramos ${financial.overdueCount} parcela(s) vencida(s) e sem pagamento registrado.` : financial.status === 'pendente' ? 'Os valores em aberto ainda estão dentro do prazo de vencimento.' : 'Todas as parcelas vencidas estão pagas e sem saldo pendente.'}</p></div><div className="finance-metric"><div className="ring" style={{ '--progress': `${paidPercent * 3.6}deg` }}><div><strong>{paidPercent}%</strong><small>pago</small></div></div></div><div className="finance-numbers"><div><span>EM ABERTO</span><strong>{formatCurrency(financial.openAmount)}</strong></div><div><span>PAGO</span><strong className="positive">{formatCurrency(financial.totalAmount - financial.openAmount)}</strong></div></div></div>
              <div className="table-heading"><div><span className="eyebrow">LINHA DO TEMPO</span><h3>Parcelas recentes</h3></div><span className="table-caption">{financial.paidCount}/{financial.installmentCount} quitadas</span></div>
              <div className="installment-table"><div className="table-row table-labels"><span>REFERÊNCIA</span><span>VENCIMENTO</span><span>VALOR</span><span>STATUS</span></div>{financial.installments.map((installment) => <div className="table-row" key={installment.id}><span className="reference-cell"><i className={installment.computedStatus} />{installment.reference}</span><span>{formatDate(installment.dueDate)}</span><span className="amount-cell">{formatCurrency(installment.amount)}</span><span><span className={`mini-status ${installment.computedStatus}`}>{installment.computedStatus === 'paid' ? 'Pago' : installment.computedStatus === 'overdue' ? 'Em atraso' : 'Previsto'}</span></span></div>)}</div>
              <div className="detail-footnote"><Icon name="info" size={15} /> A situação é calculada no servidor com base em `paidAt` e no vencimento de cada parcela.</div>
            </>}
          </section>
        </main>

        <aside className="assistant-panel panel">
          <div className="assistant-heading"><div className="assistant-title"><div className="assistant-orb"><Icon name="spark" size={19} /></div><div><span className="eyebrow">02 / INTELIGÊNCIA</span><h2>Assistente</h2></div></div><span className="mode-label"><i /> {assistantMode.toUpperCase()}</span></div>
          <div className="assistant-intro"><p>Faça perguntas sobre sua base e eu respondo usando apenas os dados disponíveis.</p><div className="suggestions"><button type="button" onClick={() => submitQuestion('Quais alunos estão inadimplentes?')}>Inadimplentes <Icon name="arrow" size={13} /></button><button type="button" onClick={() => submitQuestion('Quantos alunos estão com matrícula ativa?')}>Matrículas ativas <Icon name="arrow" size={13} /></button><button type="button" onClick={() => submitQuestion('Resuma a situação financeira do aluno selecionado.')}>Resumo selecionado <Icon name="arrow" size={13} /></button></div></div>
          <div className="conversation" aria-live="polite">{messages.map((message) => <div className={`message ${message.role}`} key={message.id}><div className="message-meta">{message.role === 'assistant' ? <><span className="assistant-mini"><Icon name="spark" size={11} /></span> ACADEMIX AI {message.mode === 'demo' && <small>· modo demonstrativo</small>}</> : 'VOCÊ'}</div><p>{message.text}</p></div>)}{assistantLoading && <div className="message assistant"><div className="message-meta"><span className="assistant-mini"><Icon name="spark" size={11} /></span> ACADEMIX AI</div><div className="typing"><i /><i /><i /></div></div>}</div>
          {assistantError && <div className="assistant-error"><Icon name="alert" size={14} />{assistantError}</div>}
          <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); submitQuestion(); }}><input value={assistantQuestion} onChange={(event) => setAssistantQuestion(event.target.value)} placeholder="Pergunte à sua base..." aria-label="Pergunte ao assistente" maxLength={500} /><button type="submit" aria-label="Enviar pergunta" disabled={assistantLoading || !assistantQuestion.trim()}><Icon name="send" size={17} /></button></form><div className="assistant-disclaimer"><span className="secure-mark"><Icon name="check" size={12} /></span> Respostas limitadas ao contexto acadêmico disponível.</div>
        </aside>
      </div>
    </div>
  );
}
