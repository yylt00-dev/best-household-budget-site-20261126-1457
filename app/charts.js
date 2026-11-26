// NestLedger charts: small canvas bar and donut charts drawn by hand, no
// library. Every chart is drawn once its canvas is in the page, sized to the
// element's own width so it stays sharp on desktop and on a phone.

function setupCanvas(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

/** Vertical bars with value labels. items: [{label, value, color}] */
export function drawBarChart(canvas, items, { height = 240 } = {}) {
  const { ctx, width, height: h } = setupCanvas(canvas, height);
  const pad = { top: 26, right: 8, bottom: 30, left: 8 };
  const max = Math.max(...items.map((i) => i.value), 1);
  const plotW = width - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const slot = plotW / items.length;
  const barW = Math.min(46, slot * 0.58);

  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  for (const [index, item] of items.entries()) {
    const x = pad.left + slot * index + slot / 2;
    const barH = Math.max(2, (item.value / max) * plotH);
    const y = pad.top + (plotH - barH);
    ctx.fillStyle = item.color || '#17605f';
    ctx.beginPath();
    ctx.roundRect(x - barW / 2, y, barW, barH, 5);
    ctx.fill();
    ctx.fillStyle = '#22302f';
    ctx.fillText(shortValue(item.value), x, y - 7);
    ctx.fillStyle = '#66756f';
    ctx.fillText(item.label, x, h - 10);
  }
}

function shortValue(value) {
  if (value >= 1000000) return `${(value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (value >= 1000) return `${Math.round(value / 1000)} rb`;
  return String(value);
}

/** Donut with a hole in the middle. items: [{label, value, color}] */
export function drawDonut(canvas, items, { height = 240, hole = 0.62 } = {}) {
  const { ctx, width, height: h } = setupCanvas(canvas, height);
  const cx = width / 2;
  const cy = h / 2;
  const radius = Math.min(width, h) / 2 - 8;
  const total = items.reduce((sum, i) => sum + i.value, 0);
  if (total <= 0) {
    ctx.fillStyle = '#66756f';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet', cx, cy);
    return;
  }
  let angle = -Math.PI / 2;
  for (const item of items) {
    const sweep = (item.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = item.color || '#17605f';
    ctx.fill();
    angle += sweep;
  }
  // Punch the hole and write the total in it.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * hole, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#0e3a3b';
  ctx.font = '700 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(shortValue(total), cx, cy - 1);
  ctx.fillStyle = '#66756f';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('spent in November', cx, cy + 17);
}
