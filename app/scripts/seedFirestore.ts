// @ts-nocheck
// scripts/seedFirestore.ts
import admin from 'firebase-admin';
import serviceAccount from '../../firebase-credentials.json' assert { type: 'json' };

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();

// ---------- DROPDOWNS DATA ----------
const dropdowns: Record<string, { label: string; placeholder: string; options: string[] }> = {
  componentSpec: {
    label: 'Component Specification',
    placeholder: 'e.g. Fuel Injector Valving',
    options: ['Main Engine Fuel Injector', 'Aux Gen O-Ring', 'Purifier Seal Ring'],
  },
  vesselName: {
    label: 'Vessel Registry Name',
    placeholder: 'e.g. Oceanic Explorer',
    options: ['Vessel Alpha', 'Vessel Beta', 'Vessel Horizon Pro'],
  },
  department: {
    label: 'Department Allocation',
    placeholder: 'e.g. Navigation Bridge',
    options: ['Engine Room', 'Electrical Systems', 'Deck Machinery', 'Galley'],
  },
  assistant: {
    label: 'Assistants Required',
    placeholder: 'e.g. 2 Crew Engineers',
    options: ['None / Solo', '1 Assistant', '2+ Assistants Required'],
  },
  requisitionStatus: {
    label: 'Requisition Status',
    placeholder: 'e.g. Pending Clearance',
    options: ['Open Ticket', 'Awaiting Spare Parts', 'Testing Phase'],
  },
  sparesUsed: {
    label: 'No. of Spares Used',
    placeholder: 'e.g. 4 units',
    options: ['0 / None Used', '1-2 Units', '3-5 Units', 'Bulk Order Custom'],
  },
  completedBy: {
    label: 'Completed By (Personnel)',
    placeholder: 'e.g. Chief Engineer',
    options: ['M. Chief Engineer', 'Lead Electrical Hand', 'Deck Master Specialist'],
  },
  testedCriteria: {
    label: 'Tested Criteria',
    placeholder: 'e.g. Load Testing Certified',
    options: ['Awaiting Static Test', 'Load Diagnostics Clear', 'Bypassed / Not Applicable'],
  },
  conditionMatrix: {
    label: 'Condition Matrix',
    placeholder: 'e.g. Operational Grade',
    options: ['Nominal Function', 'Degraded Performance', 'Critical Fault Isolated'],
  },
  reasonClassifications: {
    label: 'Reason Classifications',
    placeholder: 'e.g. Planned Overhaul',
    options: ['Scheduled Preventative PM', 'Emergency Dynamic Breakdown', 'Routine Check-Out'],
  },
  priority: {
    label: 'Priority',
    placeholder: 'e.g. HIGH',
    options: ['HIGH', 'MEDIUM', 'LOW'],
  },
  officeNotified: {
    label: 'Office Notified',
    placeholder: 'e.g. YES',
    options: ['YES', 'NO', 'NOT REQUIRED'],
  },
  orderStatus: {
    label: 'Order Status',
    placeholder: 'e.g. PO Issued',
    options: ['Not Ordered', 'Pending Requisition', 'PO Issued', 'Received'],
  },
  wasteType: {
    label: 'Waste Type',
    placeholder: 'e.g. Sludge Oil',
    options: ['Sludge Oil', 'Solid Waste', 'Plastic', 'Food Waste', 'Other'],
  },
  reportedBy: {
    label: 'Reported By',
    placeholder: 'e.g. 3rd Engineer',
    options: ['Chief Engineer', '2nd Engineer', '3rd Engineer', '4th Engineer', 'Electrical Officer', 'Oiler / Motorman', 'Deck Master'],
  },
  jobStatus: {
    label: 'Job Status',
    placeholder: 'e.g. OPEN',
    options: ['OPEN', 'CLOSED'],
  },
};

// ---------- EQUIPMENT DATA ----------
const equipmentList: Array<{
  name: string;
  makerModel: string;
  serialNumber: string;
  specs: string;
  file: null;
}> = [
  {
    name: 'Main Engine',
    makerModel: 'Wärtsilä W32',
    serialNumber: 'SN-2024-001',
    specs: '3200 kW, 750 RPM, Max Pressure 180 bar',
    file: null,
  },
  {
    name: 'Auxiliary Generator',
    makerModel: 'Caterpillar C18',
    serialNumber: 'SN-2024-002',
    specs: '500 kW, 1500 RPM, 400V',
    file: null,
  },
  {
    name: 'Boiler',
    makerModel: 'Alfa Laval Aalborg',
    serialNumber: 'SN-2024-003',
    specs: '15 bar, 250°C, 2000 kg/h',
    file: null,
  },
  {
    name: 'Purifier',
    makerModel: 'GEA Westfalia OSE',
    serialNumber: 'SN-2024-004',
    specs: '5000 l/h, 15 bar, 50°C',
    file: null,
  },
];

// ---------- REGULATIONS DATA ----------
const regulations: string[] = [
  'MARPOL Annex I - Oil',
  'MARPOL Annex IV - Sewage',
  'SOLAS II-1 - Subdivision',
  'SOLAS II-2 - Fire Safety',
  'ISM Code',
  'USCG',
  'MARPOL Annex VI - Air Pollution',
  'STCW',
];

// ---------- SEED FUNCTION ----------
async function seed() {
  console.log('🌱 Seeding Firestore...\n');

  try {
    // 1. Seed Dropdowns
    console.log('📝 Seeding dropdowns...');
    for (const [key, data] of Object.entries(dropdowns)) {
      await db.collection('dropdowns').doc(key).set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`   ✅ dropdowns/${key}`);
    }

    // 2. Seed Equipment
    console.log('\n🔧 Seeding equipment...');
    for (const eq of equipmentList) {
      await db.collection('equipment').doc(eq.name).set({
        ...eq,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`   ✅ equipment/${eq.name}`);
    }

    // 3. Seed Regulations
    console.log('\n📜 Seeding regulations...');
    for (const code of regulations) {
      await db.collection('regulations').add({
        code,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`   ✅ regulations/${code}`);
    }

    console.log('\n✨ Seeding complete!');
    console.log(`📊 Total items added:`);
    console.log(`   • ${Object.keys(dropdowns).length} dropdown documents`);
    console.log(`   • ${equipmentList.length} equipment items`);
    console.log(`   • ${regulations.length} regulations`);
    console.log('\n🎉 You can now start using your Firestore database!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Run the seed function
seed().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});