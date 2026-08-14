export function buildPaymentHistory(existing = [], amount, method) {
  const safeAmount = Number(amount) || 0;
  const history = Array.isArray(existing) ? existing : [];
  const lastId = history.length
    ? Math.max(...history.map((entry) => Number(entry?.id) || 0))
    : 0;

  return [
    ...history,
    {
      id: lastId + 1,
      amount: safeAmount,
      method: method || 'كاش',
      date: new Date().toISOString().slice(0, 10),
    },
  ];
}

export function buildInvoiceFromBooking({ data, trip, nextInvoiceId }) {
  const firstPaid = Number(data.paid) || 0;
  const paymentHistory =
    firstPaid > 0
      ? [
          {
            id: 1,
            amount: firstPaid,
            method: data.paymentMethod || 'كاش',
            date: new Date().toISOString().slice(0, 10),
          },
        ]
      : [];

  const perPerson = Number(trip?.price) || 0;
  const paxCount = Number(data.coveredCount) || data.coveredPassengers?.length || 1;
  const totalAmount = perPerson * paxCount;

  return {
    ...data,
    id: nextInvoiceId,
    createdAt: new Date().toISOString().slice(0, 10),
    perPerson,
    paxCount,
    totalAmount,
    coveredCount: paxCount,
    paid: firstPaid,
    paidAmount: firstPaid,
    paymentMethod: firstPaid > 0 ? data.paymentMethod || 'كاش' : '',
    paymentHistory,
  };
}
