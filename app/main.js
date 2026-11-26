// NestLedger entry point: hash router, page rendering, chart drawing and
// every control on the site (add/delete transactions, edit limits, fund goals,
// pay bills, filter, calculator, demo reset). All state lives in data.js and
// localStorage; re-rendering a page is how the UI updates.

import { loadData, saveData, resetData, nextId, totalSpent, spentByCategory, MONTH } from './data.js';
import { money } from './format.js';
import { drawBarChart, drawDonut } from './charts.js';
import {
  renderDashboard,
  renderTransactions,
  renderBudget,
  renderGoals,
  renderBills,
  renderReports,
  renderTips,
} from './pages.js';
import { CATEGORY_COLORS } from './data.js';

let data = loadData();
const view = document.getElementById('view');
const txFilter = { category: 'all', q: '' };

document.getElementById('month-badge').textContent = MONTH;

const ROUTES = {
  dashboard: renderDashboard,
  transactions: (d) => renderTransactions(d, txFilter),
  budget: renderBudget,
  goals: renderGoals,
  bills: renderBills,
  reports: renderReports,
  tips: renderTips,
};

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  return ROUTES[hash] ? hash : 'dashboard';
}

function render() {
  const route = currentRoute();
  view.innerHTML = ROUTES[route](data);
  document.querySelectorAll('.mainnav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
  drawCharts(route);
  if (route === 'tips') updateCalculator();
  window.scrollTo(0, 0);
}

function drawCharts(route) {
  if (route === 'dashboard') {
    const canvas = document.getElementById('chart-donut');
    if (canvas) {
      const byCat = spentByCategory(data);
      const items = Object.entries(byCat)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, value]) => ({ label: cat, value, color: CATEGORY_COLORS[cat] || '#66756f' }));
      drawDonut(canvas, items);
    }
  }
  if (route === 'reports') {
    const canvas = document.getElementById('chart-history');
    if (canvas) {
      const history = data.history.map((h) => (h.month === 'Nov 2026' ? { ...h, spent: totalSpent(data) } : h));
      drawBarChart(
        canvas,
        history.map((h, i) => ({
          label: h.month.split(' ')[0],
          value: h.spent,
          color: i === history.length - 1 ? '#e8a33d' : '#17605f',
        })),
        { height: 260 },
      );
    }
  }
}

function updateCalculator() {
  const input = document.getElementById('calc-income');
  const out = document.getElementById('calc-result');
  if (!input || !out) return;
  const income = Number(input.value) || 0;
  out.innerHTML = income > 0
    ? `<p><b>Needs (50%): ${money(income * 0.5)}</b> — rent, food, bills, transport, school.</p>
       <p><b>Wants (30%): ${money(income * 0.3)}</b> — eating out, cinema, treats.</p>
       <p><b>Savings (20%): ${money(income * 0.2)}</b> — emergency fund, goals, extra debt.</p>`
    : '<p>Enter an income above Rp 0 to see the split.</p>';
}

// ---- events (delegated, so they survive re-renders) ----
view.addEventListener('submit', (event) => {
  const form = event.target;
  event.preventDefault();
  const fields = new FormData(form);

  if (form.id === 'tx-form') {
    const amount = Number(fields.get('amount'));
    const date = String(fields.get('date'));
    const description = String(fields.get('description')).trim();
    const category = String(fields.get('category'));
    if (!date || !description || !(amount > 0)) return;
    data.transactions.push({ id: nextId('t'), date, description, category, amount });
    saveData(data);
    render();
  }

  if (form.classList.contains('limit-form')) {
    const limit = Number(fields.get('limit'));
    const row = data.budgets.find((b) => b.id === form.dataset.id);
    if (row && limit >= 0) {
      row.limit = limit;
      saveData(data);
      render();
    }
  }

  if (form.id === 'budget-add-form') {
    const name = String(fields.get('name')).trim();
    const limit = Number(fields.get('limit'));
    if (!name || limit < 0) return;
    if (data.budgets.some((b) => b.category.toLowerCase() === name.toLowerCase())) {
      alert('That envelope already exists — edit its limit above instead.');
      return;
    }
    data.budgets.push({ id: nextId('b'), category: name, limit });
    saveData(data);
    render();
  }

  if (form.classList.contains('goal-fund-form')) {
    const amount = Number(fields.get('amount'));
    const goal = data.goals.find((g) => g.id === form.dataset.id);
    if (goal && amount > 0) {
      goal.saved += amount;
      saveData(data);
      render();
    }
  }

  if (form.id === 'goal-add-form') {
    const name = String(fields.get('name')).trim();
    const target = Number(fields.get('target'));
    const note = String(fields.get('note') || '').trim();
    if (!name || !(target > 0)) return;
    data.goals.push({ id: nextId('g'), name, note: note || 'A new goal for the family.', target, saved: 0 });
    saveData(data);
    render();
  }
});

view.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;

  if (action === 'tx-delete') {
    data.transactions = data.transactions.filter((t) => t.id !== id);
    saveData(data);
    render();
  }

  if (action === 'bill-toggle') {
    const bill = data.bills.find((b) => b.id === id);
    if (bill) {
      bill.paid = !bill.paid;
      saveData(data);
      render();
    }
  }
});

view.addEventListener('change', (event) => {
  const el = event.target;
  if (el.id === 'tx-filter-cat') {
    txFilter.category = el.value;
    render();
    const again = document.getElementById('tx-filter-cat');
    if (again) again.focus();
  }
});

view.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'tx-filter-q') {
    txFilter.q = el.value;
    // Re-render only the table area would be nicer; a full re-render is
    // simpler, but it would steal focus from the search box. So update the
    // list in place instead.
    const section = el.closest('section');
    const fresh = renderTransactions(data, txFilter);
    const tmp = document.createElement('div');
    tmp.innerHTML = fresh;
    const newSection = tmp.querySelector('section:last-of-type');
    if (section && newSection) section.replaceWith(newSection);
    const again = document.getElementById('tx-filter-q');
    if (again) {
      again.focus();
      again.setSelectionRange(again.value.length, again.value.length);
    }
  }
  if (el.id === 'calc-income') updateCalculator();
});

document.getElementById('reset-demo').addEventListener('click', () => {
  if (confirm('Reset NestLedger to the original demo figures? Your edits will be lost.')) {
    data = resetData();
    txFilter.category = 'all';
    txFilter.q = '';
    render();
  }
});

window.addEventListener('hashchange', render);
window.addEventListener('resize', () => drawCharts(currentRoute()));
render();
