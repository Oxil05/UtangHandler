import Dexie from 'dexie';

export const db = new Dexie('UtangHandlerDB');

// Define database schema
db.version(1).stores({
  customers: '++id, &name, phone, createdAt',
  records: '++id, customerId, customerName, type, amount, remainingAmount, category, date, dueDate, status, createdAt',
  payments: '++id, recordId, paymentDate'
});

// Seed default initial sample customer if database is completely empty
db.on('populate', async () => {
  const sampleCustomerId = await db.customers.add({
    name: 'Juan Dela Cruz',
    phone: '09171234567',
    notes: 'Sample Customer',
    createdAt: new Date().toISOString()
  });

  const now = new Date().toISOString();
  await db.records.add({
    customerId: sampleCustomerId,
    customerName: 'Juan Dela Cruz',
    type: 'pautang', // Pautang = They owe me (Collectable)
    amount: 1500,
    remainingAmount: 1500,
    category: 'Cash Loan',
    date: now,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'unpaid',
    notes: 'Initial sample record - grocery loan',
    createdAt: now
  });
});

// Database Helper Functions

// 1. Add Customer
export async function addCustomer(name, phone = '', notes = '') {
  const existing = await db.customers.where('name').equals(name.trim()).first();
  if (existing) {
    return existing.id;
  }
  const id = await db.customers.add({
    name: name.trim(),
    phone: phone.trim(),
    notes: notes.trim(),
    createdAt: new Date().toISOString()
  });
  return id;
}

// 2. Add Record (Auto-saves current timestamp date)
export async function addRecord({ customerId, customerName, type, amount, category, dueDate, notes, customDate }) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Valid positive amount is required');
  }

  let finalCustomerId = customerId;
  if (!finalCustomerId && customerName) {
    finalCustomerId = await addCustomer(customerName);
  }

  // Automatic timestamp capture
  const recordDate = customDate ? new Date(customDate).toISOString() : new Date().toISOString();

  const recordId = await db.records.add({
    customerId: finalCustomerId || null,
    customerName: customerName.trim(),
    type, // 'pautang' (they owe me) or 'utang' (I owe them)
    amount: numAmount,
    remainingAmount: numAmount,
    category: category || 'General',
    date: recordDate,
    dueDate: dueDate || null,
    status: 'unpaid',
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString()
  });

  return recordId;
}

// 3. Add Partial or Full Payment
export async function addPayment(recordId, paymentAmount, note = '') {
  const pAmount = parseFloat(paymentAmount);
  if (isNaN(pAmount) || pAmount <= 0) {
    throw new Error('Valid payment amount required');
  }

  const record = await db.records.get(recordId);
  if (!record) throw new Error('Record not found');

  const newRemaining = Math.max(0, record.remainingAmount - pAmount);
  const newStatus = newRemaining === 0 ? 'paid' : 'partial';

  await db.transaction('rw', db.records, db.payments, async () => {
    await db.payments.add({
      recordId,
      amount: pAmount,
      paymentDate: new Date().toISOString(),
      note: note.trim()
    });

    await db.records.update(recordId, {
      remainingAmount: newRemaining,
      status: newStatus
    });
  });

  return { newRemaining, isFullyPaid: newRemaining === 0 };
}

// 4. Delete Record
export async function deleteRecord(recordId) {
  await db.transaction('rw', db.records, db.payments, async () => {
    await db.payments.where('recordId').equals(recordId).delete();
    await db.records.delete(recordId);
  });
}

// 5. Delete Customer
export async function deleteCustomer(customerId) {
  await db.transaction('rw', db.customers, db.records, db.payments, async () => {
    const customerRecords = await db.records.where('customerId').equals(customerId).toArray();
    for (const rec of customerRecords) {
      await db.payments.where('recordId').equals(rec.id).delete();
    }
    await db.records.where('customerId').equals(customerId).delete();
    await db.customers.delete(customerId);
  });
}

// 6. JSON Export Backup
export async function exportDatabaseJSON() {
  const customers = await db.customers.toArray();
  const records = await db.records.toArray();
  const payments = await db.payments.toArray();

  return JSON.stringify({
    appName: 'UtangHandler',
    version: 1,
    exportedAt: new Date().toISOString(),
    customers,
    records,
    payments
  }, null, 2);
}

// 7. JSON Import Backup
export async function importDatabaseJSON(jsonString) {
  const data = JSON.parse(jsonString);
  if (!data.records || !Array.isArray(data.records)) {
    throw new Error('Invalid backup file format');
  }

  await db.transaction('rw', db.customers, db.records, db.payments, async () => {
    await db.customers.clear();
    await db.records.clear();
    await db.payments.clear();

    if (data.customers && data.customers.length) {
      await db.customers.bulkAdd(data.customers);
    }
    if (data.records && data.records.length) {
      await db.records.bulkAdd(data.records);
    }
    if (data.payments && data.payments.length) {
      await db.payments.bulkAdd(data.payments);
    }
  });

  return true;
}
