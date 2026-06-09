// Pruebas de la lógica pura: fechas, auto-marcado y selección aleatoria.
import { describe, it, expect } from 'vitest';
import { dayKey, daysAgoFrom, shouldAutoMark, pickRandom } from './constants';

describe('dayKey', () => {
  it('formatea como YYYY-MM-DD con ceros a la izquierda', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05'); // enero = 0
    expect(dayKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('produce claves ordenables cronológicamente como string', () => {
    const antes = dayKey(new Date(2026, 5, 1));
    const despues = dayKey(new Date(2026, 5, 9));
    expect(antes < despues).toBe(true);
  });
});

describe('daysAgoFrom', () => {
  it('devuelve null cuando no hay fecha', () => {
    expect(daysAgoFrom(null)).toBe(null);
  });

  it('devuelve 0 para hoy', () => {
    expect(daysAgoFrom(dayKey(new Date()))).toBe(0);
  });

  it('nunca devuelve negativos para fechas futuras', () => {
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + 5);
    expect(daysAgoFrom(dayKey(futuro))).toBe(0);
  });
});

describe('shouldAutoMark', () => {
  const hoy = '2026-06-09';
  const base = { mealId: 3, eaten: false, eatenLocked: false };

  it('marca un día pasado con comida, sin marcar y sin bloquear', () => {
    expect(shouldAutoMark('2026-06-08', base, hoy)).toBe(true);
  });

  it('NO marca el día de hoy ni días futuros', () => {
    expect(shouldAutoMark('2026-06-09', base, hoy)).toBe(false);
    expect(shouldAutoMark('2026-06-10', base, hoy)).toBe(false);
  });

  it('NO marca si no hay comida asignada', () => {
    expect(shouldAutoMark('2026-06-08', { ...base, mealId: null }, hoy)).toBe(false);
  });

  it('NO marca si ya estaba comido', () => {
    expect(shouldAutoMark('2026-06-08', { ...base, eaten: true }, hoy)).toBe(false);
  });

  it('respeta el bloqueo manual del usuario', () => {
    expect(shouldAutoMark('2026-06-08', { ...base, eatenLocked: true }, hoy)).toBe(false);
  });

  it('es seguro con entrada nula', () => {
    expect(shouldAutoMark('2026-06-08', null, hoy)).toBe(false);
  });
});

describe('pickRandom', () => {
  const meals = [
    { id: 1, daysAgo: 10 },
    { id: 2, daysAgo: 2 },  // reciente
    { id: 3, daysAgo: null },
  ];

  it('evita el id excluido', () => {
    for (let i = 0; i < 30; i++) {
      const m = pickRandom(meals, { exclude: [1, 3] });
      expect(m.id).not.toBe(1);
      expect(m.id).not.toBe(3);
    }
  });

  it('prefiere comidas no recientes (>= avoidRecentDays)', () => {
    // Con id 1 excluido, el pool no-reciente es {3} (null cuenta como no reciente).
    for (let i = 0; i < 30; i++) {
      const m = pickRandom(meals, { exclude: [1] });
      expect(m.id).not.toBe(2); // 2 es reciente y debe evitarse mientras haya alternativa
    }
  });

  it('cae al pool completo si todo está excluido salvo recientes', () => {
    const soloReciente = [{ id: 2, daysAgo: 1 }];
    expect(pickRandom(soloReciente, {}).id).toBe(2);
  });

  it('devuelve null con lista vacía', () => {
    expect(pickRandom([], {})).toBe(null);
  });
});
