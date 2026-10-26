import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialStatus } from '../lib/financial.js';

const today = new Date('2026-10-25T12:00:00.000Z');

test('classifica mensalidade vencida e sem pagamento como inadimplente', () => {
  const result = calculateFinancialStatus([
    { id: '1', reference: 'Outubro/2026', dueDate: '2026-10-10', amount: 900, paidAt: null }
  ], today);

  assert.equal(result.status, 'inadimplente');
  assert.equal(result.overdueCount, 1);
  assert.equal(result.overdueAmount, 900);
});

test('não confunde parcela futura em aberto com atraso', () => {
  const result = calculateFinancialStatus([
    { id: '1', reference: 'Novembro/2026', dueDate: '2026-11-10', amount: 900, paidAt: null }
  ], today);

  assert.equal(result.status, 'pendente');
  assert.equal(result.overdueCount, 0);
  assert.equal(result.openAmount, 900);
});

test('classifica conjunto pago e sem saldo em aberto como adimplente', () => {
  const result = calculateFinancialStatus([
    { id: '1', reference: 'Outubro/2026', dueDate: '2026-10-10', amount: 900, paidAt: '2026-10-08' }
  ], today);

  assert.equal(result.status, 'adimplente');
  assert.equal(result.openCount, 0);
  assert.equal(result.paidCount, 1);
});
