// constants.js — categorías, helpers de color/fecha y utilidades de comida.
// Portado de data.jsx del prototipo, pero usando la fecha REAL del dispositivo.

// Categorías con su tono (hue) calmado.
export const CATS = {
  Pollo:       { label: 'Pollo',       hue: 232 },
  Res:         { label: 'Res',         hue: 250 },
  Cerdo:       { label: 'Cerdo',       hue: 18  },
  Pasta:       { label: 'Pasta',       hue: 70  },
  Pescado:     { label: 'Pescado',     hue: 215 },
  Restaurante: { label: 'Restaurante', hue: 330 },
};

// ¿Es una comida "para pedir" (a domicilio / restaurante, sin ingredientes)?
export function isOrder(meal) {
  return meal && meal.category === 'Restaurante';
}

export function catColor(cat, l = 0.55, c = 0.09) {
  const h = (CATS[cat] || { hue: 232 }).hue;
  return `oklch(${l} ${c} ${h})`;
}

export const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const MONTHS_FULL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// ── Fechas (reales) ──────────────────────────────────────────────────
export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
// Índice de hoy dentro de la semana (0 = lunes)
export function todayIndex() {
  return (today().getDay() + 6) % 7;
}

export function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // retrocede al lunes
  d.setHours(0, 0, 0, 0);
  return d;
}

// Lunes de la semana con cierto desfase (0 = esta semana, -1 = pasada, +1 = próxima)
export function weekStart(offset) {
  const d = startOfWeek(today());
  d.setDate(d.getDate() + offset * 7);
  return d;
}

// Las 7 fechas (Date) de una semana
export function weekDates(offset) {
  const s = weekStart(offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    return d;
  });
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Clave ISO local (YYYY-MM-DD) usada como id de día en plan_entries
export function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Días transcurridos desde una fecha ISO (string) o null
export function daysAgoFrom(isoDate) {
  if (!isoDate) return null;
  const then = new Date(isoDate + 'T00:00:00');
  const diff = today().getTime() - then.getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

// Rango "1 – 7 de junio" (o "29 may – 4 jun" si cruza de mes)
export function weekRange(offset) {
  const ds = weekDates(offset);
  const a = ds[0], b = ds[6];
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} de ${MONTHS_FULL[a.getMonth()]}`;
  return `${a.getDate()} ${MONTHS[a.getMonth()]} – ${b.getDate()} ${MONTHS[b.getMonth()]}`;
}

export function weekLabel(offset) {
  if (offset === 0) return 'Esta semana';
  if (offset === -1) return 'Semana pasada';
  if (offset === 1) return 'Próxima semana';
  if (offset < 0) return `Hace ${-offset} semanas`;
  return `En ${offset} semanas`;
}

// ¿Debe auto-marcarse como comido este día? (día pasado, con comida, sin marcar y
// sin que el usuario lo haya bloqueado a mano). `todayKey` y `day` son ISO YYYY-MM-DD.
export function shouldAutoMark(day, entry, todayKey) {
  return !!entry
    && day < todayKey
    && entry.mealId != null
    && !entry.eaten
    && !entry.eatenLocked;
}

// Elige una comida aleatoria evitando las recién comidas y un id excluido.
// `meals` deben traer `daysAgo` ya calculado.
export function pickRandom(meals, { exclude = [], avoidRecentDays = 6 } = {}) {
  const ex = new Set(exclude);
  let pool = meals.filter(x => !ex.has(x.id) && (x.daysAgo === null || x.daysAgo >= avoidRecentDays));
  if (pool.length === 0) pool = meals.filter(x => !ex.has(x.id));
  if (pool.length === 0) pool = meals;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
