// NestLedger pages: one render function per hash route. Each returns HTML
// built from the household data, so every figure on screen is a real figure
// computed from the transactions, budgets, goals and bills in data.js.

import { money, moneyShort, niceDate, pct, esc } from './format.js';
import { CATEGORY_COLORS, MONTH, totalIncome, totalSpent, spentByCategory, budgetStatus, unpaidBills } from './data.js';

function categoryOptions(selected) {
  const cats = Object.keys(CATEGORY_COLORS);
  return cats
    .map((c) => `<option value="${esc(c)}"${c === selected ? ' selected' : ''}>${esc(c)}</option>`)
    .join('');
}

function txRow(tx) {
  return `<tr>
    <td>${niceDate(tx.date)}</td>
    <td>${esc(tx.description)}</td>
    <td><span class="cat-chip">${esc(tx.category)}</span></td>
    <td class="num neg">${money(tx.amount)}</td>
    <td class="num"><button type="button" class="btn-small btn-danger" data-action="tx-delete" data-id="${tx.id}">Delete</button></td>
  </tr>`;
}

export function renderDashboard(data) {
  const income = totalIncome(data);
  const spent = totalSpent(data);
  const remaining = income - spent;
  const savingsRate = income > 0 ? remaining / income : 0;
  const byCat = spentByCategory(data);
  const over = budgetStatus(data).filter((b) => b.pct > 1);
  const unpaid = unpaidBills(data);
  const recent = [...data.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  const topCats = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, amount]) => ({ label: cat, value: amount, color: CATEGORY_COLORS[cat] || '#66756f' }));

  return `
  <div class="page-head">
    <h1>Good morning, Hartono family ☀️</h1>
    <p class="lede">November 2026 at a glance: ${money(income)} came in, ${money(spent)} went out, and ${money(remaining)} is still in the pot. Here is where the money stands today.</p>
  </div>

  ${over.length ? `<div class="callout bad"><p><strong>⚠️ ${over.length} budget${over.length > 1 ? 's' : ''} over the limit:</strong> ${over.map((b) => `${esc(b.category)} (${money(b.used)} of ${money(b.limit)})`).join(', ')}. See the <a href="#/budget">Budget</a> page to adjust or move money.</p></div>` : `<div class="callout good"><p><strong>✓ Every budget is inside its limit</strong> so far this month. Nice work, Hartonos.</p></div>`}

  <div class="grid grid-4" style="margin-bottom:16px">
    <div class="card tile"><div class="label">Income — Nov</div><div class="big">${money(income)}</div><div class="sub">3 sources: salary, sewing, market stall</div></div>
    <div class="card tile"><div class="label">Spent — Nov</div><div class="big">${money(spent)}</div><div class="sub">${data.transactions.length} transactions recorded</div></div>
    <div class="card tile ${remaining < 0 ? 'warn' : 'good'}"><div class="label">Left to spend</div><div class="big">${money(remaining)}</div><div class="sub">Savings rate ${pct(savingsRate)} of income</div></div>
    <div class="card tile accent"><div class="label">Savings goals</div><div class="big">${money(data.goals.reduce((s, g) => s + g.saved, 0))}</div><div class="sub">saved across ${data.goals.length} goals</div></div>
  </div>

  <div class="grid grid-main">
    <section>
      <h2>Where the money went <span class="hint">by category</span></h2>
      <canvas class="chart" id="chart-donut" height="240" role="img" aria-label="Donut chart of spending by category"></canvas>
      <ul class="legend">
        ${topCats.map((c) => `<li><span><span class="swatch" style="background:${c.color}"></span>${esc(c.label)}</span><span>${money(c.value)}</span></li>`).join('')}
      </ul>
      <p style="margin-top:12px"><a class="btn btn-ghost btn-small" href="#/transactions">See all transactions →</a></p>
    </section>

    <div class="grid" style="gap:16px">
      <section>
        <h2>Bills coming up</h2>
        ${unpaid.length ? `<table><thead><tr><th>Bill</th><th class="num">Due</th><th class="num">Amount</th></tr></thead><tbody>
          ${unpaid.slice(0, 4).map((b) => `<tr><td>${esc(b.name)}</td><td class="num">${b.dueDay} Nov</td><td class="num">${money(b.amount)}</td></tr>`).join('')}
        </tbody></table>
        <p style="margin-top:10px">${money(unpaid.reduce((s, b) => s + b.amount, 0))} still to pay this month. <a href="#/bills">Open Bills →</a></p>` : '<p class="empty">All bills are paid for November. 🎉</p>'}
      </section>
      <section>
        <h2>Biggest costs so far</h2>
        <ul class="legend">
          ${topCats.slice(0, 3).map((c) => `<li><span>${esc(c.label)}</span><b>${money(c.value)}</b></li>`).join('')}
        </ul>
        <p class="hint">Rent is fixed; groceries is the biggest cost you can actually steer. <a href="#/tips">Ways to trim it →</a></p>
      </section>
    </div>
  </div>

  <section style="margin-top:16px">
    <h2>Recent spending</h2>
    <table>
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead>
      <tbody>${recent.map((tx) => `<tr><td>${niceDate(tx.date)}</td><td>${esc(tx.description)}</td><td><span class="cat-chip">${esc(tx.category)}</span></td><td class="num neg">${money(tx.amount)}</td></tr>`).join('')}</tbody>
    </table>
  </section>`;
}

export function renderTransactions(data, filter) {
  const spent = totalSpent(data);
  let list = [...data.transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
  if (filter.category && filter.category !== 'all') list = list.filter((t) => t.category === filter.category);
  if (filter.q) {
    const q = filter.q.toLowerCase();
    list = list.filter((t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }
  const shownTotal = list.reduce((s, t) => s + t.amount, 0);

  return `
  <div class="page-head">
    <h1>Transactions</h1>
    <p class="lede">Every rupiah out of the household pot in November 2026 — ${data.transactions.length} entries, ${money(spent)} in total. Add a new one below; it counts everywhere instantly.</p>
  </div>

  <section style="margin-bottom:16px">
    <h2>Add a transaction</h2>
    <form id="tx-form">
      <div class="form-row">
        <div class="field"><label for="tx-date">Date</label><input id="tx-date" name="date" type="date" value="2026-11-27" required></div>
        <div class="field"><label for="tx-category">Category</label><select id="tx-category" name="category">${categoryOptions('Groceries')}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="tx-desc">What was it?</label><input id="tx-desc" name="description" type="text" placeholder="e.g. Weekly market shop" maxlength="80" required></div>
        <div class="field"><label for="tx-amount">Amount (Rp)</label><input id="tx-amount" name="amount" type="number" min="1000" step="500" placeholder="150000" required></div>
      </div>
      <button type="submit">Add transaction</button>
    </form>
  </section>

  <section>
    <h2>All transactions <span class="hint">${list.length} shown · ${money(shownTotal)}</span></h2>
    <div class="toolbar">
      <div class="field"><label for="tx-filter-cat">Category</label>
        <select id="tx-filter-cat"><option value="all">All categories</option>${categoryOptions(filter.category)}</select></div>
      <div class="field"><label for="tx-filter-q">Search</label>
        <input id="tx-filter-q" type="search" placeholder="Search description…" value="${esc(filter.q || '')}"></div>
    </div>
    ${list.length ? `<table>
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>${list.map(txRow).join('')}</tbody>
    </table>` : '<p class="empty">Nothing matches that filter. Try another category or clear the search.</p>'}
  </section>`;
}

export function renderBudget(data) {
  const statuses = budgetStatus(data);
  const totalLimit = statuses.reduce((s, b) => s + b.limit, 0);
  const totalUsed = statuses.reduce((s, b) => s + b.used, 0);
  const over = statuses.filter((b) => b.pct > 1);

  return `
  <div class="page-head">
    <h1>Monthly budget</h1>
    <p class="lede">The Hartono plan for November: ${money(totalLimit)} across ${statuses.length} envelopes. ${money(totalUsed)} used (${pct(totalUsed / totalLimit)}), ${money(totalLimit - totalUsed)} left. Change any limit — the bars update at once.</p>
  </div>

  ${over.length ? `<div class="callout bad"><p><strong>Over budget:</strong> ${over.map((b) => `${esc(b.category)} is ${money(b.used - b.limit)} over its ${money(b.limit)} limit`).join('; ')}. Move money from a quiet envelope or raise the limit below.</p></div>` : ''}

  <div class="grid grid-2">
    <section>
      <h2>Envelopes</h2>
      ${statuses.map((b) => {
        const barClass = b.pct > 1 ? 'over' : b.pct > 0.85 ? 'near' : '';
        return `<div class="budget-row">
          <div class="row-top"><b>${esc(b.category)}</b><span>${money(b.used)} / ${money(b.limit)}</span></div>
          <div class="bar" role="img" aria-label="${esc(b.category)} ${pct(b.pct)} of budget used"><i class="${barClass}" style="width:${Math.min(100, Math.round(b.pct * 100))}%"></i></div>
          <div class="row-meta"><span>${pct(b.pct)} used</span><span class="${b.remaining < 0 ? 'neg' : 'pos'}">${b.remaining < 0 ? `${money(-b.remaining)} over` : `${money(b.remaining)} left`}</span></div>
          <form class="limit-form" data-id="${b.id}" style="margin-top:8px">
            <div class="form-row" style="align-items:end">
              <div class="field" style="margin:0"><label for="limit-${b.id}">Monthly limit (Rp)</label><input id="limit-${b.id}" name="limit" type="number" min="0" step="10000" value="${b.limit}" required></div>
              <div><button type="submit" class="btn-small">Update limit</button></div>
            </div>
          </form>
        </div>`;
      }).join('')}
    </section>

    <div class="grid" style="gap:16px;align-content:start">
      <section>
        <h2>Add an envelope</h2>
        <form id="budget-add-form">
          <div class="field"><label for="nb-name">Category name</label><input id="nb-name" name="name" type="text" placeholder="e.g. Gifts" maxlength="30" required></div>
          <div class="field"><label for="nb-limit">Monthly limit (Rp)</label><input id="nb-limit" name="limit" type="number" min="0" step="10000" placeholder="200000" required></div>
          <button type="submit">Add envelope</button>
        </form>
        <p class="hint" style="margin-top:10px">New envelopes start at Rp 0 spent. Spending in that category appears here automatically.</p>
      </section>
      <section>
        <h2>How the envelopes work</h2>
        <p>Each envelope is a promise: this much, no more, for this part of life this month. Rent and school fees are fixed — the plan is to protect them first. Groceries, eating out and fun are flexible — when one runs hot, the family moves money from another envelope instead of borrowing from next month.</p>
        <p><strong>The 50 / 30 / 20 check:</strong> needs (rent, groceries, utilities, transport, school, health) are ${money(statuses.filter((b) => ['Rent', 'Groceries', 'Utilities', 'Transport', 'School & kids', 'Health'].includes(b.category)).reduce((s, b) => s + b.limit, 0))} of the ${money(totalLimit)} plan — about ${pct(statuses.filter((b) => ['Rent', 'Groceries', 'Utilities', 'Transport', 'School & kids', 'Health'].includes(b.category)).reduce((s, b) => s + b.limit, 0) / totalLimit)}. Try the calculator on the <a href="#/tips">Tips &amp; tools</a> page.</p>
      </section>
    </div>
  </div>`;
}

export function renderGoals(data) {
  const totalSaved = data.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = data.goals.reduce((s, g) => s + g.target, 0);

  return `
  <div class="page-head">
    <h1>Savings goals</h1>
    <p class="lede">${money(totalSaved)} saved toward ${money(totalTarget)} of dreams — ${pct(totalSaved / totalTarget)} of the way there. Add money to a goal whenever there is spare cash; it is ring-fenced from daily spending.</p>
  </div>

  <div class="grid grid-2">
    ${data.goals.map((g) => {
      const pc = g.target > 0 ? g.saved / g.target : 0;
      return `<section>
        <h2>${esc(g.name)}</h2>
        <p class="hint">${esc(g.note)}</p>
        <div class="goal-amount">${money(g.saved)} <span class="hint">of ${money(g.target)}</span></div>
        <div class="bar" style="margin:10px 0 6px" role="img" aria-label="${esc(g.name)} ${pct(pc)} funded"><i style="width:${Math.min(100, Math.round(pc * 100))}%"></i></div>
        <p class="hint">${pct(pc)} funded · ${money(g.target - g.saved)} to go</p>
        <form class="goal-fund-form" data-id="${g.id}">
          <div class="form-row" style="align-items:end">
            <div class="field" style="margin:0"><label for="fund-${g.id}">Add funds (Rp)</label><input id="fund-${g.id}" name="amount" type="number" min="1000" step="1000" placeholder="100000" required></div>
            <div><button type="submit" class="btn-small btn-amber">Add to goal</button></div>
          </div>
        </form>
      </section>`;
    }).join('')}
  </div>

  <section style="margin-top:16px">
    <h2>Start a new goal</h2>
    <form id="goal-add-form">
      <div class="form-row">
        <div class="field"><label for="ng-name">Goal name</label><input id="ng-name" name="name" type="text" placeholder="e.g. New fridge" maxlength="40" required></div>
        <div class="field"><label for="ng-target">Target amount (Rp)</label><input id="ng-target" name="target" type="number" min="10000" step="10000" placeholder="3000000" required></div>
      </div>
      <div class="field"><label for="ng-note">Why this goal? (optional)</label><input id="ng-note" name="note" type="text" placeholder="e.g. The old one leaks" maxlength="100"></div>
      <button type="submit">Create goal</button>
    </form>
  </section>`;
}

export function renderBills(data) {
  const unpaid = unpaidBills(data);
  const dueTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const paidTotal = data.bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const today = 27; // demo "today": 27 November 2026

  return `
  <div class="page-head">
    <h1>Bills &amp; recurring payments</h1>
    <p class="lede">Everything the household owes each month, in one place. ${data.bills.length} regular bills: ${money(paidTotal)} already paid, ${money(dueTotal)} still due in November. Tap “Mark paid” when a bill is settled.</p>
  </div>

  ${unpaid.filter((b) => b.dueDay < today).length ? `<div class="callout bad"><p><strong>⚠️ Overdue:</strong> ${unpaid.filter((b) => b.dueDay < today).map((b) => `${esc(b.name)} (due ${b.dueDay} Nov, ${money(b.amount)})`).join(', ')} — pay these first to avoid late fees.</p></div>` : ''}

  <section>
    <h2>November bills <span class="hint">today is 27 Nov 2026</span></h2>
    <table>
      <thead><tr><th>Bill</th><th class="num">Due</th><th class="num">Amount</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${[...data.bills].sort((a, b) => a.dueDay - b.dueDay).map((b) => {
          const status = b.paid ? '<span class="pill paid">Paid ✓</span>' : b.dueDay < today ? '<span class="pill overdue">Overdue</span>' : '<span class="pill due">Due soon</span>';
          return `<tr>
            <td>${esc(b.name)}</td>
            <td class="num">${b.dueDay} Nov</td>
            <td class="num">${money(b.amount)}</td>
            <td>${status}</td>
            <td class="num"><button type="button" class="btn-small ${b.paid ? 'btn-ghost' : 'btn-amber'}" data-action="bill-toggle" data-id="${b.id}">${b.paid ? 'Mark unpaid' : 'Mark paid'}</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <p style="margin-top:12px"><strong>${money(dueTotal)}</strong> still to pay · <strong>${money(paidTotal)}</strong> paid · total monthly bills <strong>${money(dueTotal + paidTotal)}</strong></p>
  </section>

  <section style="margin-top:16px">
    <h2>Never miss a bill again</h2>
    <p>Three habits keep this page green: <strong>1)</strong> pay rent and school fees on the 1st–5th, before anything flexible; <strong>2)</strong> set each bill's due date in your phone calendar the day it arrives; <strong>3)</strong> keep one month of bills — about ${money(dueTotal + paidTotal)} — sitting in the account as a buffer, so a late salary never means a late bill.</p>
  </section>`;
}

export function renderReports(data) {
  const income = totalIncome(data);
  const spent = totalSpent(data);
  const byCat = spentByCategory(data);
  const history = data.history.map((h) => (h.month === 'Nov 2026' ? { ...h, spent } : h));
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const avgSpent = Math.round(history.slice(0, 5).reduce((s, h) => s + h.spent, 0) / 5);
  const trend = spent - avgSpent;
  const savingsRate = income > 0 ? (income - spent) / income : 0;

  return `
  <div class="page-head">
    <h1>Reports — six months</h1>
    <p class="lede">November is not finished yet (figures to 27 Nov), but the pattern is clear: the Hartonos spend about ${money(avgSpent)} a month and are keeping ${pct(savingsRate)} of what they earn so far this month.</p>
  </div>

  <div class="grid grid-4" style="margin-bottom:16px">
    <div class="card tile"><div class="label">Nov income</div><div class="big">${money(income)}</div><div class="sub">3 sources</div></div>
    <div class="card tile"><div class="label">Nov spent (to 27th)</div><div class="big">${money(spent)}</div><div class="sub">vs ${money(avgSpent)} five-month average</div></div>
    <div class="card tile ${trend > 0 ? 'warn' : 'good'}"><div class="label">vs average</div><div class="big">${trend > 0 ? '+' : ''}${money(trend)}</div><div class="sub">${trend > 0 ? 'above' : 'below'} the usual month</div></div>
    <div class="card tile good"><div class="label">Savings rate</div><div class="big">${pct(savingsRate)}</div><div class="sub">${money(income - spent)} kept this month</div></div>
  </div>

  <div class="grid grid-main">
    <section>
      <h2>Spending by month <span class="hint">Jun – Nov 2026</span></h2>
      <canvas class="chart" id="chart-history" height="260" role="img" aria-label="Bar chart of monthly spending, June to November 2026"></canvas>
      <p class="hint" style="margin-top:10px">September was the dearest month (${money(10780000)}) — new school term costs. November is tracking ${money(Math.abs(trend))} ${trend > 0 ? 'above' : 'below'} average with four days left.</p>
    </section>
    <section>
      <h2>Where November went</h2>
      <table>
        <thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Share</th></tr></thead>
        <tbody>
          ${top.map(([cat, amount]) => `<tr><td><span class="swatch" style="background:${CATEGORY_COLORS[cat] || '#66756f'}"></span> ${esc(cat)}</td><td class="num">${money(amount)}</td><td class="num">${pct(spent ? amount / spent : 0)}</td></tr>`).join('')}
        </tbody>
      </table>
    </section>
  </div>

  <section style="margin-top:16px">
    <h2>What the numbers say</h2>
    <ul class="tip-list">
      <li><strong>Rent + groceries are ${pct((byCat.Rent || 0) + (byCat.Groceries || 0) ? ((byCat.Rent || 0) + (byCat.Groceries || 0)) / spent : 0)} of all spending.</strong> Rent cannot move, so groceries is the lever: a weekly market list and a ${money(2400000)} envelope keep it near target.</li>
      <li><strong>Eating out is ${money(byCat['Eating out'] || 0)} — ${pct(spent ? (byCat['Eating out'] || 0) / spent : 0)} of spending.</strong> One fewer warung dinner a week saves about ${money(400000)} a month, enough to finish the Bali goal two months early.</li>
      <li><strong>Transport is steady at ${money(byCat.Transport || 0)}.</strong> Petrol plus one service — no surprises. Keep ${money(90000)} a month aside for the next service and it never hurts.</li>
      <li><strong>The emergency fund is ${pct(data.goals[0].saved / data.goals[0].target)} funded.</strong> At the current savings rate it is full by March 2027 — then that ${money(500000)} a month can start the kids' education fund in earnest.</li>
    </ul>
  </section>`;
}

export function renderTips(data) {
  const rate = totalIncome(data) > 0 ? (totalIncome(data) - totalSpent(data)) / totalIncome(data) : 0;
  return `
  <div class="page-head">
    <h1>Tips &amp; tools</h1>
    <p class="lede">Practical budgeting for a real household — no jargon, no apps to buy. Start with the calculator, then pick one habit to try this week.</p>
  </div>

  <div class="grid grid-main">
    <section>
      <h2>The 50 / 30 / 20 calculator</h2>
      <p>Split any monthly income three ways: <strong>50%</strong> needs, <strong>30%</strong> wants, <strong>20%</strong> savings &amp; extra debt. Type your household income:</p>
      <form id="calc-form">
        <div class="field"><label for="calc-income">Monthly household income (Rp)</label>
        <input id="calc-income" name="income" type="number" min="0" step="10000" value="12500000" required></div>
      </form>
      <div class="calc-result" id="calc-result"></div>
      <p class="hint">For the Hartonos (${money(12500000)}): needs ${money(6250000)}, wants ${money(3750000)}, savings ${money(2500000)}. Their real November is running ahead of the rule — with four days left they have kept ${pct(rate)} of income, because several bills are already paid and the month is not over yet.</p>
    </section>

    <section>
      <h2>Five habits that actually work</h2>
      <ol class="tip-list">
        <li><strong>Pay yourself first.</strong> Move savings out on payday, before spending starts. What stays in the account is what you may spend — not the other way round.</li>
        <li><strong>Use envelopes, not willpower.</strong> Give every rupiah a job before the month begins. When the groceries envelope is empty, the month's eating out pays for it — visibly.</li>
        <li><strong>Shop with a list, once a week.</strong> The market run is where most households leak money. A list, a set day, and no hungry shopping.</li>
        <li><strong>Track for 10 minutes a week.</strong> Write every spend down — this site's <a href="#/transactions">Transactions</a> page takes seconds. What gets measured gets smaller.</li>
        <li><strong>Keep a “boring” buffer.</strong> One month of bills in the account at all times. It turns a late salary from a crisis into a shrug.</li>
      </ol>
    </section>
  </div>

  <section style="margin-top:16px">
    <h2>Common questions, answered plainly</h2>
    <h3>We earn little. Can we still budget?</h3>
    <p>Yes — budgeting matters more, not less, when money is tight. Start with just two envelopes (food, everything else) and one rule: write down every spend for a month. The picture it gives you is the budget.</p>
    <h3>What if we blow the budget mid-month?</h3>
    <p>It happens to every household. Do not abandon the month: move money between envelopes, shrink the flexible ones, and note what went wrong. A budget is a plan you revise, not a test you fail.</p>
    <h3>How much emergency fund is enough?</h3>
    <p>Three months of essential spending is a good first target; six months is comfortable. The Hartonos aim for ${money(15000000)} — about three months of their essentials — and are ${pct(9750000 / 15000000)} of the way there.</p>
    <h3>Should we pay debt or save first?</h3>
    <p>Pay the expensive debt first (anything over about 10% a year), while keeping a small emergency cushion of ${money(1000000)} so a broken motorbike does not force new debt. Then build savings in earnest.</p>
  </section>`;
}
