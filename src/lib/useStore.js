// useStore.js — estado global + acciones. Reemplaza la lógica en memoria de
// App() del prototipo, persistiendo todo vía backend (Supabase o localStorage).
import { useCallback, useEffect, useRef, useState } from 'react';
import { backend } from './backend';
import { weekDates, dayKey, today, daysAgoFrom, pickRandom } from './constants';

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

// fila DB → objeto de complemento usado por la UI
function normComplement(row) {
  return {
    id: row.id,
    name: row.name,
    ingredients: row.ingredients || [],
    favorite: !!row.favorite,
  };
}

const EMPTY_DAY = { mealId: null, eaten: false, complementIds: [], eatenLocked: false };

export function useStore() {
  const [meals, setMeals] = useState([]);
  const [complements, setComplements] = useState([]);
  const [plansByDay, setPlansByDay] = useState({}); // { [dayKey]: {mealId, eaten, complementIds, eatenLocked} }
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
      const mealsNorm = data.meals.map(normMeal);
      setComplements((data.complements || []).map(normComplement));

      const byDay = {};
      data.planEntries.forEach(e => {
        byDay[e.day] = {
          mealId: e.meal_id ?? null,
          eaten: !!e.eaten,
          complementIds: e.complement_ids || [],
          eatenLocked: !!e.eaten_locked,
        };
      });

      // ── Auto-marcado: días ya pasados, con comida y sin marcar/sin bloquear ──
      const todayK = dayKey(today());
      const autoDays = [];
      const mealBump = new Map(); // mealId → { count, lastDay }
      for (const [day, e] of Object.entries(byDay)) {
        if (day < todayK && e.mealId != null && !e.eaten && !e.eatenLocked) {
          byDay[day] = { ...e, eaten: true };
          autoDays.push(day);
          const b = mealBump.get(e.mealId) || { count: 0, lastDay: null };
          b.count += 1;
          if (!b.lastDay || day > b.lastDay) b.lastDay = day;
          mealBump.set(e.mealId, b);
        }
      }

      // Aplica el aumento de estadísticas a las comidas auto-marcadas
      const finalMeals = mealBump.size === 0 ? mealsNorm : mealsNorm.map(m => {
        const b = mealBump.get(m.id);
        if (!b) return m;
        const newLast = (!m.lastEatenOn || b.lastDay > m.lastEatenOn) ? b.lastDay : m.lastEatenOn;
        return { ...m, timesEaten: m.timesEaten + b.count, lastEatenOn: newLast, daysAgo: daysAgoFrom(newLast) };
      });

      setMeals(finalMeals);
      setPlansByDay(byDay);
      setManual(data.manual.map(it => ({ id: it.id, text: it.text, done: !!it.done })));
      setChecked(new Set(data.checked));
      setError(null);

      // Persiste el auto-marcado en el backend (optimista; ya está en el estado)
      for (const day of autoDays) {
        const e = byDay[day];
        backend.upsertPlan(day, { meal_id: e.mealId, eaten: true, complement_ids: e.complementIds, eaten_locked: false }).catch(console.error);
      }
      for (const [id, b] of mealBump) {
        const m = finalMeals.find(x => x.id === id);
        if (m) backend.updateMeal(id, { times_eaten: m.timesEaten, last_eaten_on: m.lastEatenOn }).catch(console.error);
      }
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
  const complementById = useCallback((id) => complements.find(c => c.id === id), [complements]);

  // plan de una semana (offset) como arreglo de 7 días
  const getPlan = useCallback((off) => {
    return weekDates(off).map(date => plansByDay[dayKey(date)] || EMPTY_DAY);
  }, [plansByDay]);

  // helpers internos de persistencia (optimista + backend)
  const writeDay = useCallback((day, entry) => {
    const full = { complementIds: [], eatenLocked: false, ...entry };
    setPlansByDay(p => ({ ...p, [day]: full }));
    backend.upsertPlan(day, {
      meal_id: full.mealId,
      eaten: full.eaten,
      complement_ids: full.complementIds,
      eaten_locked: full.eatenLocked,
    }).catch(console.error);
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

  const updateMealFull = useCallback(async ({ id, name, category, ingredients }) => {
    setMeals(ms => ms.map(m => m.id === id ? { ...m, name, category, ingredients } : m));
    await backend.updateMeal(id, { name, category, ingredients }).catch(console.error);
    flash('Cambios guardados');
  }, [flash]);

  const deleteMeal = useCallback((id) => {
    setMeals(ms => ms.filter(m => m.id !== id));
    setPlansByDay(p => {
      const n = {};
      Object.entries(p).forEach(([k, v]) => { n[k] = v.mealId === id ? { ...v, mealId: null, eaten: false } : v; });
      return n;
    });
    backend.deleteMeal(id).catch(console.error);
  }, []);

  // ── Acciones: complementos ─────────────────────────────────────────
  const toggleComplementFav = useCallback((id) => {
    const c = complements.find(x => x.id === id);
    if (!c) return;
    setComplements(cs => cs.map(x => x.id === id ? { ...x, favorite: !x.favorite } : x));
    backend.updateComplement(id, { favorite: !c.favorite }).catch(console.error);
  }, [complements]);

  const addComplement = useCallback(async ({ name, ingredients }) => {
    const row = await backend.insertComplement({ name, ingredients });
    setComplements(cs => [normComplement(row), ...cs]);
    flash('Complemento agregado');
  }, [flash]);

  const updateComplementFull = useCallback(async ({ id, name, ingredients }) => {
    setComplements(cs => cs.map(c => c.id === id ? { ...c, name, ingredients } : c));
    await backend.updateComplement(id, { name, ingredients }).catch(console.error);
    flash('Cambios guardados');
  }, [flash]);

  const deleteComplement = useCallback((id) => {
    setComplements(cs => cs.filter(c => c.id !== id));
    // Limpia el id de los días que lo usaban (memoria + backend)
    setPlansByDay(p => {
      const n = { ...p };
      for (const [day, v] of Object.entries(p)) {
        if (v.complementIds && v.complementIds.includes(id)) {
          const complementIds = v.complementIds.filter(x => x !== id);
          n[day] = { ...v, complementIds };
          backend.upsertPlan(day, { meal_id: v.mealId, eaten: v.eaten, complement_ids: complementIds, eaten_locked: v.eatenLocked }).catch(console.error);
        }
      }
      return n;
    });
    backend.deleteComplement(id).catch(console.error);
  }, []);

  // ── Acciones: planeador ────────────────────────────────────────────
  const assignMeal = useCallback((off, index, mealId) => {
    const d = entryAt(off, index);
    writeDay(dayKeyAt(off, index), { mealId, eaten: false, complementIds: d.complementIds, eatenLocked: false });
  }, [writeDay, plansByDay]);

  const setDayComplements = useCallback((off, index, complementIds) => {
    const d = entryAt(off, index);
    writeDay(dayKeyAt(off, index), { mealId: d.mealId, eaten: d.eaten, complementIds, eatenLocked: d.eatenLocked });
  }, [writeDay, plansByDay]);

  const shuffleDay = useCallback((off, index) => {
    const d = entryAt(off, index);
    const next = pickRandom(meals, { exclude: d.mealId ? [d.mealId] : [] });
    if (!next) return;
    writeDay(dayKeyAt(off, index), { mealId: next.id, eaten: false, complementIds: d.complementIds, eatenLocked: false });
    flash('Nueva idea: ' + next.name);
  }, [meals, plansByDay, writeDay, flash]);

  const markEaten = useCallback((off, index) => {
    const d = entryAt(off, index);
    if (!d.mealId) return;
    const dayIso = dayKeyAt(off, index);
    writeDay(dayIso, { mealId: d.mealId, eaten: true, complementIds: d.complementIds, eatenLocked: true });
    const m = meals.find(x => x.id === d.mealId);
    if (m) {
      const newLast = (!m.lastEatenOn || dayIso > m.lastEatenOn) ? dayIso : m.lastEatenOn;
      patchMeal(m.id,
        { timesEaten: m.timesEaten + 1, lastEatenOn: newLast, daysAgo: daysAgoFrom(newLast) },
        { times_eaten: m.timesEaten + 1, last_eaten_on: newLast });
    }
    flash('¡Registrado! No te lo sugerimos pronto');
  }, [meals, plansByDay, writeDay, patchMeal, flash]);

  const toggleEaten = useCallback((off, index) => {
    const d = entryAt(off, index);
    if (!d.mealId) return;
    if (d.eaten) {
      writeDay(dayKeyAt(off, index), { mealId: d.mealId, eaten: false, complementIds: d.complementIds, eatenLocked: true });
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
    const d = entryAt(0, idx);
    writeDay(dayKeyAt(0, idx), { mealId, eaten: false, complementIds: d.complementIds, eatenLocked: false });
    flash('Listo para hoy');
  }, [writeDay, plansByDay, flash]);

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
    loading, error, meals, complements, manual, checked, toast,
    mealById, complementById, getPlan, reload,
    toggleFav, addMeal, updateMealFull, deleteMeal,
    toggleComplementFav, addComplement, updateComplementFull, deleteComplement,
    assignMeal, setDayComplements, shuffleDay, markEaten, toggleEaten, clearDay, planToday,
    toggleCheck, addManual, toggleManual, removeManual,
  };
}
