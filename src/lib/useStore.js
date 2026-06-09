// useStore.js — estado global + acciones. Reemplaza la lógica en memoria de
// App() del prototipo, persistiendo todo vía backend (Supabase o localStorage).
import { useCallback, useEffect, useRef, useState } from 'react';
import { backend } from './backend';
import { weekDates, dayKey, today, daysAgoFrom, pickRandom, shouldAutoMark } from './constants';

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

// Plantilla de día vacío. Congelada para evitar mutaciones accidentales del objeto
// compartido; `getPlan`/`entryAt` devuelven copias frescas (ver Q1 del review).
const EMPTY_DAY = Object.freeze({ mealId: null, eaten: false, complementIds: [], eatenLocked: false });

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
      // Nota: `day` y `todayK` son ISO 'YYYY-MM-DD'; con ese formato la comparación de
      // strings equivale a comparación cronológica. No cambiar dayKey() sin revisar esto.
      const todayK = dayKey(today());
      const candidates = [];
      for (const [day, e] of Object.entries(byDay)) {
        if (shouldAutoMark(day, e, todayK)) {
          byDay[day] = { ...e, eaten: true };           // optimista para la UI
          candidates.push({ day, mealId: e.mealId });
        }
      }

      setMeals(mealsNorm);
      setPlansByDay(byDay);
      setManual(data.manual.map(it => ({ id: it.id, text: it.text, done: !!it.done })));
      setChecked(new Set(data.checked));
      setError(null);

      // Persistencia segura ante concurrencia (B5): el flip eaten=false→true se hace con
      // un UPDATE condicional en el backend. Solo el cliente que de verdad lo cambió suma
      // la estadística, evitando doble conteo si dos dispositivos cargan al mismo tiempo.
      if (candidates.length > 0) {
        const confirmed = [];
        for (const c of candidates) {
          try { if (await backend.autoMarkDay(c.day)) confirmed.push(c); }
          catch (err) { console.error(err); }
        }
        if (confirmed.length > 0) {
          const mealBump = new Map(); // mealId → { count, lastDay }
          for (const c of confirmed) {
            const b = mealBump.get(c.mealId) || { count: 0, lastDay: null };
            b.count += 1;
            if (!b.lastDay || c.day > b.lastDay) b.lastDay = c.day;
            mealBump.set(c.mealId, b);
          }
          setMeals(ms => ms.map(m => {
            const b = mealBump.get(m.id);
            if (!b) return m;
            const newLast = (!m.lastEatenOn || b.lastDay > m.lastEatenOn) ? b.lastDay : m.lastEatenOn;
            return { ...m, timesEaten: m.timesEaten + b.count, lastEatenOn: newLast, daysAgo: daysAgoFrom(newLast) };
          }));
          for (const [id, b] of mealBump) {
            const base = mealsNorm.find(x => x.id === id);
            if (!base) continue;
            const newLast = (!base.lastEatenOn || b.lastDay > base.lastEatenOn) ? b.lastDay : base.lastEatenOn;
            backend.updateMeal(id, { times_eaten: base.timesEaten + b.count, last_eaten_on: newLast }).catch(console.error);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // recarga al volver a enfocar la ventana (sincroniza entre dispositivos).
  // `focus` y `visibilitychange` suelen dispararse juntos al regresar a la app; se
  // coalescen con un debounce corto para hacer UNA sola recarga, no dos (B4).
  const wakeTimer = useRef(null);
  useEffect(() => {
    const onWake = () => {
      if (document.visibilityState !== 'visible') return;
      clearTimeout(wakeTimer.current);
      wakeTimer.current = setTimeout(() => reload(), 150);
    };
    window.addEventListener('focus', onWake);
    document.addEventListener('visibilitychange', onWake);
    return () => {
      clearTimeout(wakeTimer.current);
      window.removeEventListener('focus', onWake);
      document.removeEventListener('visibilitychange', onWake);
    };
  }, [reload]);

  const mealById = useCallback((id) => meals.find(m => m.id === id), [meals]);
  const complementById = useCallback((id) => complements.find(c => c.id === id), [complements]);

  // plan de una semana (offset) como arreglo de 7 días
  const getPlan = useCallback((off) => {
    return weekDates(off).map(date => plansByDay[dayKey(date)] || { ...EMPTY_DAY });
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
  const entryAt = (off, index) => plansByDay[dayKeyAt(off, index)] || { ...EMPTY_DAY };

  // ── Acciones: comidas ──────────────────────────────────────────────
  const toggleFav = useCallback((id) => {
    const m = meals.find(x => x.id === id);
    if (!m) return;
    patchMeal(id, { favorite: !m.favorite }, { favorite: !m.favorite });
  }, [meals, patchMeal]);

  const addMeal = useCallback(async ({ name, category, ingredients }) => {
    try {
      const row = await backend.insertMeal({ name, category, ingredients });
      setMeals(ms => [normMeal(row), ...ms]);
      flash('Agregado a tu recetario');
    } catch (e) {
      console.error(e);
      flash('No se pudo guardar. Intenta de nuevo');
    }
  }, [flash]);

  const updateMealFull = useCallback(async ({ id, name, category, ingredients }) => {
    let prev;
    setMeals(ms => ms.map(m => {
      if (m.id !== id) return m;
      prev = m;
      return { ...m, name, category, ingredients };
    }));
    try {
      await backend.updateMeal(id, { name, category, ingredients });
      flash('Cambios guardados');
    } catch (e) {
      console.error(e);
      if (prev) setMeals(ms => ms.map(m => m.id === id ? prev : m)); // revierte
      flash('No se pudo guardar. Revisa tu conexión');
    }
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
    try {
      const row = await backend.insertComplement({ name, ingredients });
      setComplements(cs => [normComplement(row), ...cs]);
      flash('Complemento agregado');
    } catch (e) {
      console.error(e);
      flash('No se pudo guardar. Intenta de nuevo');
    }
  }, [flash]);

  const updateComplementFull = useCallback(async ({ id, name, ingredients }) => {
    let prev;
    setComplements(cs => cs.map(c => {
      if (c.id !== id) return c;
      prev = c;
      return { ...c, name, ingredients };
    }));
    try {
      await backend.updateComplement(id, { name, ingredients });
      flash('Cambios guardados');
    } catch (e) {
      console.error(e);
      if (prev) setComplements(cs => cs.map(c => c.id === id ? prev : c)); // revierte
      flash('No se pudo guardar. Revisa tu conexión');
    }
  }, [flash]);

  const deleteComplement = useCallback((id) => {
    setComplements(cs => cs.filter(c => c.id !== id));
    // Limpia el id de los días que lo usaban (cálculo puro; los efectos van fuera del updater)
    const next = { ...plansByDay };
    const affected = [];
    for (const [day, v] of Object.entries(plansByDay)) {
      if (v.complementIds && v.complementIds.includes(id)) {
        const complementIds = v.complementIds.filter(x => x !== id);
        next[day] = { ...v, complementIds };
        affected.push(next[day] && { day, entry: next[day] });
      }
    }
    setPlansByDay(next);
    for (const a of affected) {
      backend.upsertPlan(a.day, { meal_id: a.entry.mealId, eaten: a.entry.eaten, complement_ids: a.entry.complementIds, eaten_locked: a.entry.eatenLocked }).catch(console.error);
    }
    backend.deleteComplement(id).catch(console.error);
  }, [plansByDay]);

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
      const iso = dayKeyAt(off, index);
      writeDay(iso, { mealId: d.mealId, eaten: false, complementIds: d.complementIds, eatenLocked: true });
      const m = meals.find(x => x.id === d.mealId);
      if (m) {
        // Recalcula last_eaten_on: el día más reciente (≠ este) en que se comió esta comida.
        let newLast = null;
        for (const [day, v] of Object.entries(plansByDay)) {
          if (day !== iso && v.mealId === m.id && v.eaten && (!newLast || day > newLast)) newLast = day;
        }
        patchMeal(m.id,
          { timesEaten: Math.max(0, m.timesEaten - 1), lastEatenOn: newLast, daysAgo: daysAgoFrom(newLast) },
          { times_eaten: Math.max(0, m.timesEaten - 1), last_eaten_on: newLast });
      }
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
    const on = !checked.has(name);
    setChecked(s => {
      const n = new Set(s);
      on ? n.add(name) : n.delete(name);
      return n;
    });
    backend.setChecked(name, on).catch(console.error);
  }, [checked]);

  const addManual = useCallback(async (text) => {
    try {
      const row = await backend.addManual(text);
      setManual(arr => [...arr, { id: row.id, text: row.text, done: false }]);
    } catch (e) {
      console.error(e);
      flash('No se pudo agregar. Intenta de nuevo');
    }
  }, [flash]);

  const toggleManual = useCallback((id) => {
    const it = manual.find(x => x.id === id);
    if (!it) return;
    const done = !it.done;
    setManual(arr => arr.map(x => x.id === id ? { ...x, done } : x));
    backend.updateManual(id, { done }).catch(console.error);
  }, [manual]);

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
