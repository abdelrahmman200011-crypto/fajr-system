import { useMemo } from 'react';
import { invoiceTotals } from '../data/mockData';
import { calculateTripStatus } from '../services/trips';

export function useDashboardStats(passengers = [], trips = [], invoices = []) {
  return useMemo(() => {
    const totalRevenue = invoices.reduce((acc, inv) => {
      const { paid } = invoiceTotals(inv, [], []);
      return acc + paid;
    }, 0);

    return {
      totalPassengers: passengers.length,
      activeTrips: trips.filter(
        (trip) => calculateTripStatus(trip, trip.bookedCount ?? 0).text !== 'منتهية (مغلقة)'
      ).length,
      totalRevenue,
      aldaer: passengers.filter((p) => p.branch === 'الداير').length,
      jazan: passengers.filter((p) => p.branch === 'جازان').length,
    };
  }, [passengers, trips, invoices]);
}
