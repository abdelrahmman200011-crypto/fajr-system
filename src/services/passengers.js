export function familyMembers(passengers, familyId) {
  if (!familyId) return [];
  return passengers.filter((p) => p.familyId === familyId);
}

export function familyHead(passengers, familyId) {
  const members = familyMembers(passengers, familyId);
  if (members.length === 0) return null;
  return members.reduce((a, b) => (a.id < b.id ? a : b));
}

export function isCompanionPassenger(passengers, passenger) {
  const head = familyHead(passengers, passenger?.familyId);
  return Boolean(head && head.id !== passenger?.id);
}
