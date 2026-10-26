function endOfDay(dateString) {
  return new Date(`${dateString}T23:59:59.999Z`);
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Calcula a situação financeira usando somente registros de parcelas.
 * Uma parcela sem paidAt só é atraso quando o vencimento já passou.
 */
export function calculateFinancialStatus(installments, today = new Date()) {
  const referenceDate = today instanceof Date ? today : new Date(today);
  const normalized = installments.map((installment) => {
    const dueDate = endOfDay(installment.dueDate);
    const paid = Boolean(installment.paidAt);
    const overdue = !paid && dueDate < referenceDate;
    const open = !paid;

    return {
      ...installment,
      paid,
      overdue,
      open,
      computedStatus: paid ? 'paid' : overdue ? 'overdue' : 'pending'
    };
  });

  const overdueInstallments = normalized.filter((item) => item.overdue);
  const openInstallments = normalized.filter((item) => item.open);
  const paidInstallments = normalized.filter((item) => item.paid);
  const totalAmount = normalized.reduce((sum, item) => sum + item.amount, 0);
  const openAmount = openInstallments.reduce((sum, item) => sum + item.amount, 0);
  const overdueAmount = overdueInstallments.reduce((sum, item) => sum + item.amount, 0);

  let status = 'adimplente';
  if (overdueInstallments.length > 0) status = 'inadimplente';
  else if (openInstallments.length > 0) status = 'pendente';

  return {
    status,
    label: status === 'inadimplente' ? 'Inadimplente' : status === 'pendente' ? 'Pendente' : 'Adimplente',
    asOf: toIsoDate(referenceDate),
    totalAmount,
    openAmount,
    overdueAmount,
    paidCount: paidInstallments.length,
    openCount: openInstallments.length,
    overdueCount: overdueInstallments.length,
    installmentCount: normalized.length,
    installments: normalized
  };
}

export function getStudentFinancial(student, today = new Date()) {
  return {
    studentId: student.id,
    studentName: student.name,
    course: student.course,
    ...calculateFinancialStatus(student.installments, today)
  };
}
