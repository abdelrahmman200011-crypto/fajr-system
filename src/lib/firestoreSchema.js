export const FIRESTORE_SCHEMA = {
  collections: {
    passengers: {
      description: 'Client/passenger records and branch assignment',
      fields: ['id', 'fullName', 'documentId', 'phone', 'nationality', 'gender', 'address', 'branch', 'status', 'roomNumber', 'notes'],
    },
    trips: {
      description: 'Trip metadata, capacity, itinerary, and passenger manifests',
      fields: ['id', 'tripNumber', 'destination', 'gatheringPoint', 'departure', 'returnDate', 'time', 'capacity', 'bookedCount', 'branch', 'passengers'],
    },
    invoices: {
      description: 'Financial records and payment history',
      fields: ['id', 'passengerId', 'tripId', 'packageId', 'paid', 'paidAmount', 'paymentMethod', 'paymentHistory', 'coveredCount', 'coveredPassengers', 'branch'],
    },
    hotels: {
      description: 'Hotel master data',
      fields: ['id', 'name', 'location'],
    },
    rooms: {
      description: 'Room inventory by hotel',
      fields: ['id', 'hotelId', 'number', 'category', 'type', 'capacity'],
    },
    clients: {
      description: 'Legacy or backup client registry',
      fields: ['id', 'fullName', 'documentId', 'phone', 'nationality', 'gender', 'address', 'branch'],
    },
    settings: {
      description: 'Global app settings',
      fields: ['appName', 'defaultCurrency', 'branchNames', 'systemStatus'],
    },
  },
};

export const FIREBASE_DEPLOY_CHECKLIST = [
  'Create Firebase project',
  'Enable Authentication',
  'Enable Firestore Database',
  'Enable Hosting',
  'Create admin custom claims with role=admin and branch=الداير or جازان',
  'Upload firestore.rules',
  'Add .env values for Firebase config',
  'Run npm run build',
  'Run firebase deploy --only hosting',
];
