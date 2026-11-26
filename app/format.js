// NestLedger formatting helpers: rupiah amounts, dates and percents.

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/** 1250000 -> "Rp 1.250.000" */
export function money(amount) {
  return rupiah.format(Math.round(amount));
}

/** 1250000 -> "Rp 1,25 jt" (compact, for chart labels) */
export function moneyShort(amount) {
  if (amount >= 1000000) {
    const jt = amount / 1000000;
    return `Rp ${jt.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  }
  if (amount >= 1000) return `Rp ${Math.round(amount / 1000)} rb`;
  return money(amount);
}

/** "2026-11-05" -> "5 Nov 2026" */
export function niceDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d} ${months[m - 1]} ${y}`;
}

/** 0.723 -> "72%" */
export function pct(value) {
  return `${Math.round(value * 100)}%`;
}

/** Escape text before it goes into innerHTML. */
export function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
