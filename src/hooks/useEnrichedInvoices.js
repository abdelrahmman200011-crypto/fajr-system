import { useMemo } from 'react';
import { invoiceTotals } from '../data/mockData';

export function useEnrichedInvoices({ invoices = [], passengers = [], trips = [], packages = [], services = [] }) {
  return useMemo(
    () =>
      invoices.map((inv) => {
        const totals = invoiceTotals(inv, packages, services);
        return {
          ...inv,
          total: totals.totalAmount,
          paid: totals.paid,
          remaining: totals.remaining,
          passenger: passengers.find((p) => p.id === inv.passengerId) || null,
          trip: trips.find((t) => t.id === inv.tripId) || null,
          package: totals.pkg,
        };
      }),
    [invoices, passengers, trips, packages, services]
  );
}
