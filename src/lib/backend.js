// backend.js — capa de acceso a datos con dos implementaciones intercambiables:
//   • Supabase  (cuando hay credenciales) → datos compartidos y persistentes
//   • localStorage (respaldo) → para probar la app antes de conectar Supabase
//
// Ambas exponen la MISMA interfaz async. Las filas se devuelven en snake_case,
// igual que Supabase, y el store (useStore.js) las normaliza.

import { supabase, isSupabaseConfigured } from '../supabaseClient';

// ── Respaldo en localStorage ──────────────────────────────────────────
const LS_KEY = 'que-comemos:v1';

const SEED = () => ({
  meals: [
    ['Tinga de pollo', 'Pollo', ['Pechuga de pollo', 'Jitomate', 'Cebolla', 'Chile chipotle', 'Tostadas'], true, 9, 12],
    ['Enchiladas verdes', 'Pollo', ['Tortillas', 'Pollo deshebrado', 'Tomate verde', 'Crema', 'Queso fresco'], false, 6, 8],
    ['Albóndigas en chipotle', 'Res', ['Carne molida', 'Arroz', 'Chipotle', 'Jitomate', 'Huevo'], true, 7, 5],
    ['Milanesa con papas', 'Res', ['Bistec de res', 'Pan molido', 'Huevo', 'Papas', 'Limón'], false, 11, 3],
    ['Espagueti a la boloñesa', 'Pasta', ['Espagueti', 'Carne molida', 'Jitomate', 'Cebolla', 'Ajo'], true, 8, 2],
    ['Sopa de fideo', 'Pasta', ['Fideo', 'Jitomate', 'Caldo de pollo', 'Cebolla'], false, 10, 6],
    ['Caldo de pollo con verduras', 'Pollo', ['Pollo', 'Zanahoria', 'Calabaza', 'Chayote', 'Arroz'], false, 5, 14],
    ['Pescado empapelado', 'Pescado', ['Filete de pescado', 'Jitomate', 'Cebolla', 'Limón', 'Mantequilla'], false, 3, 20],
    ['Chiles rellenos', 'Res', ['Chile poblano', 'Queso', 'Huevo', 'Jitomate', 'Harina'], false, 4, 18],
    ['Tacos dorados de papa', 'Pollo', ['Tortillas', 'Papa', 'Lechuga', 'Crema', 'Queso'], true, 6, 9],
    ['Fajitas de pollo', 'Pollo', ['Pechuga de pollo', 'Pimiento', 'Cebolla', 'Tortillas'], false, 7, 4],
    ['Calabacitas con queso', 'Pollo', ['Calabaza', 'Elote', 'Jitomate', 'Queso', 'Cebolla'], false, 5, 11],
    ['Bistec encebollado', 'Res', ['Bistec de res', 'Cebolla', 'Papa', 'Salsa de soya'], false, 6, 7],
    ['Lentejas', 'Res', ['Lentejas', 'Tocino', 'Plátano macho', 'Jitomate'], false, 4, 16],
    ['Pollo al horno', 'Pollo', ['Pollo entero', 'Papa', 'Romero', 'Limón', 'Ajo'], true, 5, 10],
    ['Mole con arroz', 'Pollo', ['Pollo', 'Mole', 'Ajonjolí', 'Arroz'], false, 3, 22],
    ['Tostadas de atún', 'Pescado', ['Atún', 'Mayonesa', 'Jitomate', 'Aguacate', 'Tostadas'], false, 4, 13],
    ['Sopa de tortilla', 'Pollo', ['Tortilla', 'Jitomate', 'Chile pasilla', 'Aguacate', 'Queso'], false, 5, 15],
    ['Pizza a domicilio', 'Restaurante', [], false, 4, 9],
    ['Sushi para llevar', 'Restaurante', [], true, 3, 17],
    ['Hamburguesas', 'Restaurante', [], false, 2, 24],
  ].map((r, i) => {
    const d = new Date(); d.setDate(d.getDate() - r[5]);
    const iso = d.toISOString().slice(0, 10);
    return { id: i + 1, name: r[0], category: r[1], ingredients: r[2], favorite: r[3], times_eaten: r[4], last_eaten_on: iso };
  }),
  complements: [
    ['Arroz', ['Arroz', 'Cebolla', 'Ajo'], true],
    ['Frijoles de la olla', ['Frijol', 'Cebolla', 'Epazote'], false],
    ['Ensalada verde', ['Lechuga', 'Jitomate', 'Pepino', 'Limón'], false],
    ['Verduras al vapor', ['Zanahoria', 'Calabaza', 'Chícharo'], false],
  ].map((r, i) => ({ id: 100 + i + 1, name: r[0], ingredients: r[1], favorite: r[2] })),
  plan_entries: {},   // { [day]: { meal_id, eaten, complement_ids, eaten_locked } }
  manual_items: [],
  checked_ingredients: [],
  _seq: 1000,
});

function lsRead() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  const seed = SEED();
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
  return seed;
}
function lsWrite(state) { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function lsMutate(fn) { const s = lsRead(); const r = fn(s); lsWrite(s); return r; }

const localBackend = {
  async loadAll() {
    const s = lsRead();
    return {
      meals: s.meals,
      complements: s.complements || [],
      planEntries: Object.entries(s.plan_entries).map(([day, v]) => ({
        day,
        meal_id: v.meal_id ?? null,
        eaten: !!v.eaten,
        complement_ids: v.complement_ids || [],
        eaten_locked: !!v.eaten_locked,
      })),
      manual: s.manual_items,
      checked: s.checked_ingredients,
    };
  },
  async insertMeal(meal) {
    return lsMutate(s => {
      const id = ++s._seq;
      const row = { id, favorite: false, times_eaten: 0, last_eaten_on: null, ...meal };
      s.meals.unshift(row);
      return row;
    });
  },
  async updateMeal(id, patch) {
    lsMutate(s => { s.meals = s.meals.map(m => m.id === id ? { ...m, ...patch } : m); });
  },
  async deleteMeal(id) {
    lsMutate(s => {
      s.meals = s.meals.filter(m => m.id !== id);
      for (const k of Object.keys(s.plan_entries)) {
        if (s.plan_entries[k].meal_id === id) delete s.plan_entries[k];
      }
    });
  },
  async insertComplement(comp) {
    return lsMutate(s => {
      const id = ++s._seq;
      const row = { id, favorite: false, ...comp };
      (s.complements || (s.complements = [])).unshift(row);
      return row;
    });
  },
  async updateComplement(id, patch) {
    lsMutate(s => { s.complements = (s.complements || []).map(c => c.id === id ? { ...c, ...patch } : c); });
  },
  async deleteComplement(id) {
    lsMutate(s => {
      s.complements = (s.complements || []).filter(c => c.id !== id);
      for (const k of Object.keys(s.plan_entries)) {
        const ids = s.plan_entries[k].complement_ids;
        if (Array.isArray(ids) && ids.includes(id)) {
          s.plan_entries[k].complement_ids = ids.filter(x => x !== id);
        }
      }
    });
  },
  async upsertPlan(day, entry) {
    lsMutate(s => {
      s.plan_entries[day] = {
        meal_id: entry.meal_id,
        eaten: entry.eaten,
        complement_ids: entry.complement_ids || [],
        eaten_locked: !!entry.eaten_locked,
      };
    });
  },
  async deletePlan(day) {
    lsMutate(s => { delete s.plan_entries[day]; });
  },
  async addManual(text) {
    return lsMutate(s => { const row = { id: ++s._seq, text, done: false }; s.manual_items.push(row); return row; });
  },
  async updateManual(id, patch) {
    lsMutate(s => { s.manual_items = s.manual_items.map(it => it.id === id ? { ...it, ...patch } : it); });
  },
  async deleteManual(id) {
    lsMutate(s => { s.manual_items = s.manual_items.filter(it => it.id !== id); });
  },
  async setChecked(name, on) {
    lsMutate(s => {
      const set = new Set(s.checked_ingredients);
      on ? set.add(name) : set.delete(name);
      s.checked_ingredients = [...set];
    });
  },
};

// ── Implementación Supabase ───────────────────────────────────────────
const supaBackend = {
  async loadAll() {
    const [meals, complements, plans, manual, checked] = await Promise.all([
      supabase.from('meals').select('*').order('created_at', { ascending: false }),
      supabase.from('complements').select('*').order('created_at', { ascending: false }),
      supabase.from('plan_entries').select('*'),
      supabase.from('manual_items').select('*').order('created_at', { ascending: true }),
      supabase.from('checked_ingredients').select('name'),
    ]);
    for (const r of [meals, complements, plans, manual, checked]) if (r.error) throw r.error;
    return {
      meals: meals.data,
      complements: complements.data,
      planEntries: plans.data,
      manual: manual.data,
      checked: checked.data.map(r => r.name),
    };
  },
  async insertMeal(meal) {
    const { data, error } = await supabase.from('meals').insert(meal).select().single();
    if (error) throw error;
    return data;
  },
  async updateMeal(id, patch) {
    const { error } = await supabase.from('meals').update(patch).eq('id', id);
    if (error) throw error;
  },
  async deleteMeal(id) {
    const { error } = await supabase.from('meals').delete().eq('id', id);
    if (error) throw error;
  },
  async insertComplement(comp) {
    const { data, error } = await supabase.from('complements').insert(comp).select().single();
    if (error) throw error;
    return data;
  },
  async updateComplement(id, patch) {
    const { error } = await supabase.from('complements').update(patch).eq('id', id);
    if (error) throw error;
  },
  async deleteComplement(id) {
    const { error } = await supabase.from('complements').delete().eq('id', id);
    if (error) throw error;
  },
  async upsertPlan(day, entry) {
    const { error } = await supabase.from('plan_entries').upsert({
      day,
      meal_id: entry.meal_id,
      eaten: entry.eaten,
      complement_ids: entry.complement_ids || [],
      eaten_locked: !!entry.eaten_locked,
    });
    if (error) throw error;
  },
  async deletePlan(day) {
    const { error } = await supabase.from('plan_entries').delete().eq('day', day);
    if (error) throw error;
  },
  async addManual(text) {
    const { data, error } = await supabase.from('manual_items').insert({ text }).select().single();
    if (error) throw error;
    return data;
  },
  async updateManual(id, patch) {
    const { error } = await supabase.from('manual_items').update(patch).eq('id', id);
    if (error) throw error;
  },
  async deleteManual(id) {
    const { error } = await supabase.from('manual_items').delete().eq('id', id);
    if (error) throw error;
  },
  async setChecked(name, on) {
    const { error } = on
      ? await supabase.from('checked_ingredients').upsert({ name })
      : await supabase.from('checked_ingredients').delete().eq('name', name);
    if (error) throw error;
  },
};

export const backend = isSupabaseConfigured ? supaBackend : localBackend;
export { isSupabaseConfigured };
