import { Router } from 'express';
import { findStudentById, listStudents } from '../data/students.js';
import { getStudentFinancial } from '../lib/financial.js';
import { answerQuestion } from '../lib/assistant.js';
import { badRequest, notFound } from '../lib/errors.js';

const router = Router();

function parseStudentId(id) {
  if (!/^aluno-\d{3}$/.test(id)) throw badRequest('O identificador do aluno é inválido.', { field: 'id' });
  return id;
}

function studentView(student) {
  const financial = getStudentFinancial(student);
  return {
    id: student.id,
    name: student.name,
    course: student.course,
    registration: student.registration,
    status: student.status,
    email: student.email,
    joinedAt: student.joinedAt,
    initials: student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
    financialStatus: financial.status,
    openAmount: financial.openAmount,
    overdueCount: financial.overdueCount
  };
}

router.get('/alunos', (req, res, next) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim().toLocaleLowerCase('pt-BR') : '';
    if (query.length > 100) throw badRequest('O termo de busca deve ter no máximo 100 caracteres.', { field: 'q' });

    const result = listStudents()
      .filter((student) => !query || `${student.name} ${student.registration} ${student.course}`.toLocaleLowerCase('pt-BR').includes(query))
      .map(studentView);

    res.json({ data: result, meta: { count: result.length, query: query || null } });
  } catch (error) {
    next(error);
  }
});

router.get('/alunos/:id', (req, res, next) => {
  try {
    const student = findStudentById(parseStudentId(req.params.id));
    if (!student) throw notFound('Aluno');
    res.json({ data: studentView(student) });
  } catch (error) {
    next(error);
  }
});

router.get('/alunos/:id/financeiro', (req, res, next) => {
  try {
    const student = findStudentById(parseStudentId(req.params.id));
    if (!student) throw notFound('Aluno');
    res.json({ data: getStudentFinancial(student) });
  } catch (error) {
    next(error);
  }
});

router.post('/assistente', async (req, res, next) => {
  try {
    const { question, studentId } = req.body || {};
    let selectedStudent;
    if (studentId !== undefined) {
      selectedStudent = findStudentById(parseStudentId(studentId));
      if (!selectedStudent) throw notFound('Aluno selecionado');
      selectedStudent = { ...selectedStudent, financial: getStudentFinancial(selectedStudent) };
    }

    const students = listStudents().map((student) => ({ ...student, financial: getStudentFinancial(student) }));
    const result = await answerQuestion({ question, students, selectedStudent });
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
