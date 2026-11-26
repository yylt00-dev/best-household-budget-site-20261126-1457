// NestLedger data: seed figures for the fictional Hartono household (November
// 2026) and a tiny localStorage store. Nothing here is real: the family, the
// amounts and the dates are invented sample data for the demo.

export const MONTH = 'November 2026';
export const MONTH_KEY = '2026-11';
export const STORAGE_KEY = 'nestledger-v1';

export const CATEGORY_COLORS = {
  Groceries: '#17605f',
  Rent: '#0e3a3b',
  Utilities: '#2f6f8f',
  Transport: '#e8a33d',
  'Eating out': '#c96f4a',
  'School & kids': '#7a5ea8',
  Health: '#2e7d4f',
  'Fun & leisure': '#c0392b',
  Clothing: '#8a6d3b',
  Other: '#66756f',
};

export function seedData() {
  return {
    month: MONTH_KEY,
    income: [
      { id: 'inc-1', source: 'Budi — salary (warehouse supervisor)', amount: 8500000 },
      { id: 'inc-2', source: 'Sari — freelance sewing & alterations', amount: 3200000 },
      { id: 'inc-3', source: 'Weekend market stall (snacks)', amount: 800000 },
    ],
    budgets: [
      { id: 'b-groceries', category: 'Groceries', limit: 2400000 },
      { id: 'b-rent', category: 'Rent', limit: 2000000 },
      { id: 'b-utilities', category: 'Utilities', limit: 650000 },
      { id: 'b-transport', category: 'Transport', limit: 900000 },
      { id: 'b-eating', category: 'Eating out', limit: 600000 },
      { id: 'b-school', category: 'School & kids', limit: 1100000 },
      { id: 'b-health', category: 'Health', limit: 500000 },
      { id: 'b-fun', category: 'Fun & leisure', limit: 450000 },
      { id: 'b-clothing', category: 'Clothing', limit: 300000 },
    ],
    transactions: [
      { id: 't-01', date: '2026-11-01', description: 'Monthly rent — house in Dusun Bakke', category: 'Rent', amount: 2000000 },
      { id: 't-02', date: '2026-11-01', description: 'Weekly market shop — rice, eggs, vegetables', category: 'Groceries', amount: 385000 },
      { id: 't-03', date: '2026-11-02', description: 'Petrol for motorbike (Pertalite)', category: 'Transport', amount: 85000 },
      { id: 't-04', date: '2026-11-03', description: 'School fees — Putri & Dimas (November)', category: 'School & kids', amount: 850000 },
      { id: 't-05', date: '2026-11-04', description: 'Supermarket — cooking oil, sugar, soap', category: 'Groceries', amount: 296000 },
      { id: 't-06', date: '2026-11-05', description: 'Family dinner at warung Pak Anto', category: 'Eating out', amount: 142000 },
      { id: 't-07', date: '2026-11-06', description: 'Electricity token (PLN)', category: 'Utilities', amount: 200000 },
      { id: 't-08', date: '2026-11-07', description: 'Putri — new school shoes', category: 'Clothing', amount: 185000 },
      { id: 't-09', date: '2026-11-08', description: 'Weekly market shop — chicken, fish, fruit', category: 'Groceries', amount: 412000 },
      { id: 't-10', date: '2026-11-09', description: 'Dimas — dentist check-up', category: 'Health', amount: 175000 },
      { id: 't-11', date: '2026-11-10', description: 'Electricity bill (PLN postpaid)', category: 'Utilities', amount: 185000 },
      { id: 't-12', date: '2026-11-11', description: 'Motorbike service + oil change', category: 'Transport', amount: 210000 },
      { id: 't-13', date: '2026-11-12', description: 'Water bill (PDAM)', category: 'Utilities', amount: 145000 },
      { id: 't-14', date: '2026-11-13', description: 'Sari — fabric for customer order', category: 'Other', amount: 260000 },
      { id: 't-15', date: '2026-11-14', description: 'Cinema — family movie night', category: 'Fun & leisure', amount: 195000 },
      { id: 't-16', date: '2026-11-15', description: 'Weekly market shop — rice, tempeh, greens', category: 'Groceries', amount: 358000 },
      { id: 't-17', date: '2026-11-16', description: 'Internet (Indihome) — November', category: 'Utilities', amount: 299000 },
      { id: 't-18', date: '2026-11-17', description: 'Lunch with co-workers (Budi)', category: 'Eating out', amount: 68000 },
      { id: 't-19', date: '2026-11-18', description: 'School books & stationery', category: 'School & kids', amount: 132000 },
      { id: 't-20', date: '2026-11-19', description: 'Pharmacy — vitamins & paracetamol', category: 'Health', amount: 96000 },
      { id: 't-21', date: '2026-11-20', description: 'Petrol for motorbike (Pertalite)', category: 'Transport', amount: 90000 },
      { id: 't-22', date: '2026-11-21', description: 'Bakso & es teh — Saturday treat', category: 'Eating out', amount: 87000 },
      { id: 't-23', date: '2026-11-22', description: 'Weekly market shop — fruit, eggs, snacks', category: 'Groceries', amount: 341000 },
      { id: 't-24', date: '2026-11-23', description: 'Putri — drawing class fee', category: 'School & kids', amount: 150000 },
      { id: 't-25', date: '2026-11-24', description: 'Dimas — football boots', category: 'Fun & leisure', amount: 229000 },
      { id: 't-26', date: '2026-11-25', description: 'Sari — phone credit top-up', category: 'Utilities', amount: 50000 },
      { id: 't-27', date: '2026-11-26', description: 'Chicken & vegetables — market', category: 'Groceries', amount: 178000 },
    ],
    goals: [
      { id: 'g-1', name: 'Emergency fund', note: 'Six months of essentials, kept in a separate account.', target: 15000000, saved: 9750000 },
      { id: 'g-2', name: 'Family holiday to Bali', note: 'Five days in Ubud next school holiday.', target: 6000000, saved: 2400000 },
      { id: 'g-3', name: 'New motorbike', note: 'Replace the 2016 Beat before it gives up.', target: 12000000, saved: 4100000 },
      { id: 'g-4', name: 'Kids\u2019 education fund', note: 'Putri & Dimas — senior school fees ahead.', target: 20000000, saved: 11300000 },
    ],
    bills: [
      { id: 'b-1', name: 'House rent', amount: 2000000, dueDay: 1, paid: true },
      { id: 'b-2', name: 'School fees (Putri & Dimas)', amount: 850000, dueDay: 5, paid: true },
      { id: 'b-3', name: 'Electricity (PLN)', amount: 385000, dueDay: 10, paid: true },
      { id: 'b-4', name: 'Water (PDAM)', amount: 145000, dueDay: 12, paid: true },
      { id: 'b-5', name: 'Internet (Indihome)', amount: 299000, dueDay: 15, paid: false },
      { id: 'b-6', name: 'Mobile credit (Sari)', amount: 50000, dueDay: 20, paid: false },
      { id: 'b-7', name: 'BPJS Health premium', amount: 150000, dueDay: 25, paid: false },
      { id: 'b-8', name: 'Streaming (family plan)', amount: 54000, dueDay: 28, paid: false },
    ],
    history: [
      { month: 'Jun 2026', income: 12100000, spent: 9840000 },
      { month: 'Jul 2026', income: 11800000, spent: 10250000 },
      { month: 'Aug 2026', income: 12600000, spent: 9930000 },
      { month: 'Sep 2026', income: 12300000, spent: 10780000 },
      { month: 'Oct 2026', income: 12500000, spent: 10120000 },
      { month: 'Nov 2026', income: 12500000, spent: 0 }, // spent filled in live
    ],
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions) && Array.isArray(parsed.budgets)) return parsed;
    }
  } catch {
    // Corrupt storage: fall through to the seed data.
  }
  return seedData();
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable: the page still works for this visit.
  }
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  return seedData();
}

export function totalIncome(data) {
  return data.income.reduce((sum, row) => sum + row.amount, 0);
}

export function totalSpent(data) {
  return data.transactions.reduce((sum, row) => sum + row.amount, 0);
}

export function spentByCategory(data) {
  const out = {};
  for (const row of data.transactions) {
    out[row.category] = (out[row.category] || 0) + row.amount;
  }
  return out;
}

export function budgetStatus(data) {
  const spent = spentByCategory(data);
  return data.budgets.map((budget) => {
    const used = spent[budget.category] || 0;
    return {
      ...budget,
      used,
      remaining: budget.limit - used,
      pct: budget.limit > 0 ? used / budget.limit : 0,
    };
  });
}

export function unpaidBills(data) {
  return data.bills.filter((bill) => !bill.paid);
}

export function nextId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}
