// useStore.js — estado global + acciones. Reemplaza la lógica en memoria de
// App() del prototipo, persistiendo todo vía backend (Supabase o localStorage).
import { useCallback, useEffect, useRef, useState } from 'react';
import { backend } from './backend';
import { weekDates, dayKey, daysAgoFrom, pickRandom } from './constants';

// fila DB → objeto de comida usado por la UI
function normMeal(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    ingredients: row.ingredients || [],
    favorite: !!row.favorite,
    timesEaten: row.times_eaten ?? 0,
    lastEatenOn: row.last_eaten_on ?? null,
    daysAgo: daysAgoFrom(row.last_eaten_on ?? null),
  };
}

const EMPTY_DAY = { mealId: null, eaten: false };

export function useStore() {
  const [meals, setMeals] = useState([]);
  const [plansByDay, setPlansByDay] = useState({}); // { [dayKey]: {mealId, eaten} }
  const [manual, setManual] = useState([]);         // [{id, text, done}]
  const [checked, setChecked] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Toast ──────────────────────────────────────────────────────────
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1900);
  }, []);

  // ── Carga inicial / recarga ────────────────────────────────────────
  const reload = useCallback(async () => {
    try {
      const data = await backend.loadAll();
      setMeals(data.meals.map(normMeal));
      const byDay = {};
      data.planEntries.forEach(e => { byDay[e.day] = { mealId: e.meal_id, eaten: !!e.eaten }; });
      setPlansByDay(byDay);
      setManual(data.manual.map(it => ({ id: it.id, text: it.text, done: !!it.done })));
      setChecked(new Set(data.checked));
      setError(null);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // recarga al volver a enfocar la ventana (sincroniza entre dispositivos)
  useEffect(() => {
    const onFocus = () => { if (document.visibilityState === 'visible') reload(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [reload]);

  const mealById = useCallback((id) => meals.find(m => m.id === id), [meals]);

  // plan de una semana (offset) como arreglo de 7 días
  const getPlan = useCallback((off) => {
    return weekDates(off).map(date => plansByDay[dayKey(date)] || EMPTY_DAY);
  }, [plansByDay]);

  // helpers internos de persistencia (optimista + backend)
  const writeDay = useCallback((day, entry) => {
    setPlansByDay(p => ({ ...p, [day]: entry }));
    backend.upsertPlan(day, { meal_id: entry.mealId, eaten: entry.eaten }).catch(console.error);
  }, []);
  const removeDay = useCallback((day) => {
    setPlansByDay(p => { const n = { ...p }; delete n[day]; return n; });
    backend.deletePlan(day).catch(console.error);
  }, []);
  const patchMeal = useCallback((id, patch, dbPatch) => {
    setMeals(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m));
    backend.updateMeal(id, dbPatch ?? patch).catch(console.error);
  }, []);

  const dayKeyAt = (off, index) => dayKey(weekDates(off)[index]);
  const entryAt = (off, index) => plansByDay[dayKeyAt(off, index)] || EMPTY_DAY;

  // ── Acciones: comidas ──────────────────────────────────────────────
  const toggleFav = useCallback((id) => {
    const m = meals.find(x => x.id === id);
    if (!m) return;
    patchMeal(id, { favorite: !m.favorite }, { favorite: !m.favorite });
  }, [meals, patchMeal]);

  const addMeal = useCallback(async ({ name, category, ingredients }) => {
    const row = await backend.insertMeal({ name, category, ingredients });
    setMeals(ms => [normMeal(row), ...ms]);
    flash('Agregado a tu recetario');
  }, [flash]);

  const deleteMeal = useCallback((id) => {
    setMeals(ms => ms.filter(m => m.id !== id));
    setPlansByDay(p => {
      const n = {};
      Object.entries(p).forEach(([k, v]) => { n[k] = v.mealId === id ? EMPTY_DAY : v; });
      return n;
    });
    backend.deleteMeal(id).catch(console.error);
  }, []);

  // ── Acciones: planeador ────────────────────────────────────────────
  const assignMeal = useCallback((off, index, mealId) => {
    writeDay(dayKeyAt(off, index), { mealId, eaten: false });
  }, [writeDay]);

  const shuffleDay = useCallback((off, index) => {
    const current = entryAt(off, index).mealId;
    const next = pickRandom(meals, { exclude: current ? [current] : [] });
    if (!next) return;
    writeDay(dayKeyAt(off, index), { mealId: next.id, eaten: false });
    flash('Nueva idea: ' + next.name);
  }, [meals, plansByDay, writeDay, flash]);

  const markEaten = useCallback((off, index) => {
    const d = entryAt(off, index);
    if (!d.mealId) return;
    writeDay(dayKeyAt(off, index), { mealId: d.mealId, eaten: true });
    const m = meals.find(x => x.id === d.mealId);
    if (m) {
      const todayIso = dayKey(new Date());
      patchMeal(m.id,
        { timesEaten: m.timesEaten + 1, lastEatenOn: todayIso, daysAgo: 0 },
        { times_eaten: m.timesEaten + 1, last_eaten_on: todayIso });
    }
    flash('¡Registrado! No te lo sugerimos pronto');
  }, [meals, plansByDay, writeDay, patchMeal, flash]);

  const toggleEaten = useCallback((off, index) => {
    const d = entryAt(off, index);
    if (!d.mealId) return;
    if (d.eaten) {
      writeDay(dayKeyAt(off, index), { mealId: d.mealId, eaten: false });
      const m = meals.find(x => x.id === d.mealId);
      if (m) patchMeal(m.id, { timesEaten: Math.max(0, m.timesEaten - 1) }, { times_eaten: Math.max(0, m.timesEaten - 1) });
    } else {
      markEaten(off, index);
    }
  }, [meals, plansByDay, writeDay, patchMeal, markEaten]);

  const clearDay = useCallback((off, index) => {
    removeDay(dayKeyAt(off, index));
  }, [removeDay]);

  const planToday = useCallback((mealId) => {
    const idx = (new Date().getDay() + 6) % 7;
    writeDay(dayKeyAt(0, idx), { mealId, eaten: false });
    flash('Listo para hoy');
  }, [writeDay, flash]);

  // ── Acciones: lista de compras ─────────────────────────────────────
  const toggleCheck = useCallback((name) => {
    setChecked(s => {
      const n = new Set(s);
      const on = !n.has(name);
      on ? n.add(name) : n.delete(name);
      backend.setChecked(name, on).catch(console.error);
      return n;
    });
  }, []);

  const addManual = useCallback(async (text) => {
    const row = await backend.addManual(text);
    setManual(arr => [...arr, { id: row.id, text: row.text, done: false }]);
  }, []);

  const toggleManual = useCallback((id) => {
    setManual(arr => arr.map(it => {
      if (it.id !== id) return it;
      backend.updateManual(id, { done: !it.done }).catch(console.error);
      return { ...it, done: !it.done };
    }));
  }, []);

  const removeManual = useCallback((id) => {
    setManual(arr => arr.filter(it => it.id !== id));
    backend.deleteManual(id).catch(console.error);
  }, []);

  return {
    loading, error, meals, manual, checked, toast,
    mealById, getPlan, reload,
    toggleFav, addMeal, deleteMeal,
    assignMeal, shuffleDay, markEaten, toggleEaten, clearDay, planToday,
    toggleCheck, addManual, toggleManual, removeManual,
  };
}
