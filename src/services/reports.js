import { invoiceTotals } from '../data/mockData';

export function buildBranchReport(
  passengers = [],
  trips = [],
  invoices = [],
  packages = [],
  services = []
) {
  const branchMap = new Map();

  const ensureBranch = (branchName) => {
    if (!branchMap.has(branchName)) {
      branchMap.set(branchName, {
        branch: branchName,
        passengers: 0,
        activeTrips: 0,
        totalRevenue: 0,
        paid: 0,
        remaining: 0,
        pending: 0,
      });
    }

    return branchMap.get(branchName);
  };

  (passengers || []).forEach((person) => {
    const branchName = person?.branch || 'غير محدد';
    const entry = ensureBranch(branchName);
    entry.passengers += 1;
  });

  (trips || []).forEach((trip) => {
    const branchEntries = [...branchMap.values()];
    if (!branchEntries.length) {
      const fallback = ensureBranch('غير محدد');
      fallback.activeTrips += 1;
      return;
    }

    const count = (trip?.bookedCount ?? 0) >= (trip?.capacity ?? 0) ? 0 : 1;
    if (count > 0) {
      branchEntries.forEach((entry) => {
        entry.activeTrips += 1;
      });
    }
  });

  (invoices || []).forEach((invoice) => {
    const passenger = (passengers || []).find(
      (person) => String(person?.id) === String(invoice?.passengerId)
    );
    const branchName = passenger?.branch || 'غير محدد';
    const entry = ensureBranch(branchName);
    const totals = invoiceTotals(invoice, packages, services);
    entry.totalRevenue += Number(totals.totalAmount) || 0;
    entry.paid += Number(totals.paid) || 0;
    entry.remaining += Number(totals.remaining) || 0;
    if ((totals.remaining || 0) > 0) entry.pending += 1;
  });

  return [...branchMap.values()].filter((entry) => entry.branch !== 'غير محدد');
}

export function buildTripCompletionReport(trips = []) {
  const total = trips.length;
  const active = (trips || []).filter(
    (trip) => (trip?.bookedCount ?? 0) < (trip?.capacity ?? 0)
  ).length;
  const full = (trips || []).filter(
    (trip) => (trip?.bookedCount ?? 0) >= (trip?.capacity ?? 0)
  ).length;
  const completed = (trips || []).filter((trip) => {
    const endDate = trip?.returnDate || trip?.endDate;
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  }).length;

  return { total, active, full, completed };
}

export function buildCustomerReport(passengers = []) {
  const total = passengers.length;
  const active = passengers.filter((person) => person?.status !== 'canceled').length;
  const canceled = passengers.filter((person) => person?.status === 'canceled').length;
  const male = passengers.filter((person) => person?.gender === 'male').length;
  const female = passengers.filter((person) => person?.gender === 'female').length;

  return { total, active, canceled, male, female };
}

export function buildOperationalSummary(passengers = [], trips = [], invoices = []) {
  const branchSummary = buildBranchReport(passengers, trips, invoices, [], []);
  const tripSummary = buildTripCompletionReport(trips);
  const customerSummary = buildCustomerReport(passengers);

  return {
    branches: branchSummary,
    trips: tripSummary,
    customers: customerSummary,
    totalCollected: invoices.reduce((sum, invoice) => sum + Number(invoice?.paid || 0), 0),
  };
}
