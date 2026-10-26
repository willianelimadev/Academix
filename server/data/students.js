const students = [
  {
    id: 'aluno-001',
    name: 'Marina Costa',
    course: 'Engenharia de Software',
    registration: '2024.1.0187',
    status: 'active',
    email: 'marina.costa@academix.test',
    joinedAt: '2024-02-19',
    installments: [
      { id: 'mar-2026-08', reference: 'Agosto/2026', dueDate: '2026-08-10', amount: 980, paidAt: '2026-08-08', paymentMethod: 'Pix' },
      { id: 'mar-2026-09', reference: 'Setembro/2026', dueDate: '2026-09-10', amount: 980, paidAt: '2026-09-09', paymentMethod: 'Cartão' },
      { id: 'mar-2026-10', reference: 'Outubro/2026', dueDate: '2026-10-10', amount: 980, paidAt: null, paymentMethod: null },
      { id: 'mar-2026-11', reference: 'Novembro/2026', dueDate: '2026-11-10', amount: 980, paidAt: null, paymentMethod: null }
    ]
  },
  {
    id: 'aluno-002',
    name: 'Rafael Nogueira',
    course: 'Administração',
    registration: '2023.2.0421',
    status: 'active',
    email: 'rafael.nogueira@academix.test',
    joinedAt: '2023-08-07',
    installments: [
      { id: 'raf-2026-08', reference: 'Agosto/2026', dueDate: '2026-08-10', amount: 760, paidAt: '2026-08-10', paymentMethod: 'Boleto' },
      { id: 'raf-2026-09', reference: 'Setembro/2026', dueDate: '2026-09-10', amount: 760, paidAt: null, paymentMethod: null },
      { id: 'raf-2026-10', reference: 'Outubro/2026', dueDate: '2026-10-10', amount: 760, paidAt: null, paymentMethod: null },
      { id: 'raf-2026-11', reference: 'Novembro/2026', dueDate: '2026-11-10', amount: 760, paidAt: null, paymentMethod: null }
    ]
  },
  {
    id: 'aluno-003',
    name: 'Joana Martins',
    course: 'Design Digital',
    registration: '2025.1.0064',
    status: 'active',
    email: 'joana.martins@academix.test',
    joinedAt: '2025-02-17',
    installments: [
      { id: 'joa-2026-08', reference: 'Agosto/2026', dueDate: '2026-08-10', amount: 840, paidAt: '2026-08-06', paymentMethod: 'Pix' },
      { id: 'joa-2026-09', reference: 'Setembro/2026', dueDate: '2026-09-10', amount: 840, paidAt: '2026-09-08', paymentMethod: 'Pix' },
      { id: 'joa-2026-10', reference: 'Outubro/2026', dueDate: '2026-10-10', amount: 840, paidAt: '2026-10-09', paymentMethod: 'Pix' },
      { id: 'joa-2026-11', reference: 'Novembro/2026', dueDate: '2026-11-10', amount: 840, paidAt: null, paymentMethod: null }
    ]
  },
  {
    id: 'aluno-004',
    name: 'Caio Almeida',
    course: 'Ciência de Dados',
    registration: '2022.2.1138',
    status: 'inactive',
    email: 'caio.almeida@academix.test',
    joinedAt: '2022-08-15',
    installments: [
      { id: 'cai-2026-08', reference: 'Agosto/2026', dueDate: '2026-08-10', amount: 1120, paidAt: '2026-08-11', paymentMethod: 'Boleto' },
      { id: 'cai-2026-09', reference: 'Setembro/2026', dueDate: '2026-09-10', amount: 1120, paidAt: '2026-09-12', paymentMethod: 'Boleto' },
      { id: 'cai-2026-10', reference: 'Outubro/2026', dueDate: '2026-10-10', amount: 1120, paidAt: null, paymentMethod: null }
    ]
  },
  {
    id: 'aluno-005',
    name: 'Beatriz Souza',
    course: 'Psicologia',
    registration: '2024.2.0892',
    status: 'active',
    email: 'beatriz.souza@academix.test',
    joinedAt: '2024-08-12',
    installments: [
      { id: 'bea-2026-08', reference: 'Agosto/2026', dueDate: '2026-08-10', amount: 920, paidAt: '2026-08-09', paymentMethod: 'Pix' },
      { id: 'bea-2026-09', reference: 'Setembro/2026', dueDate: '2026-09-10', amount: 920, paidAt: '2026-09-10', paymentMethod: 'Pix' },
      { id: 'bea-2026-10', reference: 'Outubro/2026', dueDate: '2026-10-10', amount: 920, paidAt: null, paymentMethod: null },
      { id: 'bea-2026-11', reference: 'Novembro/2026', dueDate: '2026-11-10', amount: 920, paidAt: null, paymentMethod: null }
    ]
  },
  {
    id: 'aluno-006',
    name: 'Lucas Ferreira',
    course: 'Sistemas de Informação',
    registration: '2025.2.0310',
    status: 'active',
    email: 'lucas.ferreira@academix.test',
    joinedAt: '2025-08-18',
    installments: [
      { id: 'luc-2026-08', reference: 'Agosto/2026', dueDate: '2026-08-10', amount: 880, paidAt: '2026-08-07', paymentMethod: 'Cartão' },
      { id: 'luc-2026-09', reference: 'Setembro/2026', dueDate: '2026-09-10', amount: 880, paidAt: '2026-09-07', paymentMethod: 'Cartão' },
      { id: 'luc-2026-10', reference: 'Outubro/2026', dueDate: '2026-10-10', amount: 880, paidAt: '2026-10-08', paymentMethod: 'Cartão' },
      { id: 'luc-2026-11', reference: 'Novembro/2026', dueDate: '2026-11-10', amount: 880, paidAt: null, paymentMethod: null }
    ]
  }
];

export function listStudents() {
  return students;
}

export function findStudentById(id) {
  return students.find((student) => student.id === id);
}
