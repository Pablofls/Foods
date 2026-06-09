// ListaScreen.jsx — lista de compras automática + manual (portado de screens-more.jsx).
import { useState } from 'react';
import { isOrder } from '../lib/constants';
import { Icon } from '../components/Icon';
import { ScreenHeader, Checkbox } from '../components/primitives';

export function ListaScreen({ plan, mealById, complementById, checked, onToggleCheck, manual, onAddManual, onToggleManual, onRemoveManual }) {
  const [txt, setTxt] = useState('');

  // Ingredientes de comidas y complementos planeados y aún no comidos
  const map = new Map(); // nombre -> Set(origen: comida/complemento)
  const addIngredients = (ingredients, origen) => {
    ingredients.forEach(ing => {
      if (!map.has(ing)) map.set(ing, new Set());
      map.get(ing).add(origen);
    });
  };
  plan.forEach((d) => {
    if (d.eaten) return;
    // Comida principal (los restaurantes no aportan ingredientes)
    if (d.mealId) {
      const meal = mealById(d.mealId);
      if (meal && !isOrder(meal)) addIngredients(meal.ingredients, meal.name);
    }
    // Complementos del día
    (d.complementIds || []).forEach(cid => {
      const comp = complementById ? complementById(cid) : null;
      if (comp) addIngredients(comp.ingredients, comp.name);
    });
  });
  const items = [...map.entries()].map(([name, meals]) => ({ name, meals: [...meals] }));
  const totalAuto = items.length;
  const pendientes = items.filter(it => !checked.has(it.name)).length + manual.filter(it => !it.done).length;

  return (
    <div style={{ padding: '4px 0 16px' }}>
      <ScreenHeader overline="Compras" title="Lista" right={
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--blue)', lineHeight: 1 }}>{pendientes}</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-40)', marginTop: 2 }}>por comprar</div>
        </div>
      } />

      <p style={{ margin: '0 22px 14px', fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-60)', lineHeight: 1.45 }}>
        Generada con los ingredientes de lo que planeaste esta semana y aún no cocinas.
      </p>

      <div style={{ padding: '0 18px 14px' }}>
        <form onSubmit={e => { e.preventDefault(); if (txt.trim()) { onAddManual(txt.trim()); setTxt(''); } }} style={{ display: 'flex', gap: 8 }}>
          <input value={txt} onChange={e => setTxt(e.target.value)} placeholder="Agregar algo más (ej. servilletas)…" style={{
            flex: 1, boxSizing: 'border-box', padding: '12px 14px', borderRadius: 14,
            border: '1px solid var(--line)', background: 'var(--surface)', fontFamily: 'var(--sans)', fontSize: 14.5, color: 'var(--ink)', outline: 'none',
          }} />
          <button type="submit" style={{ border: 'none', background: 'var(--blue-soft)', color: 'var(--blue-deep)', width: 46, borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={21} sw={2.4} stroke="var(--blue-deep)" /></button>
        </form>
      </div>

      <div style={{ padding: '0 18px' }}>
        {totalAuto > 0 && <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--ink-40)', margin: '4px 4px 9px' }}>De tus comidas</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(it => {
            const done = checked.has(it.name);
            return (
              <button key={it.name} onClick={() => onToggleCheck(it.name)} style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 16, padding: '12px 14px', cursor: 'pointer',
              }}>
                <Checkbox on={done} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: done ? 'var(--ink-30)' : 'var(--ink)', textDecoration: done ? 'line-through' : 'none' }}>{it.name}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--ink-40)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>para {it.meals.join(', ')}</div>
                </div>
              </button>
            );
          })}
        </div>

        {manual.length > 0 && <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--ink-40)', margin: '18px 4px 9px' }}>Agregado por ti</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {manual.map((it) => (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 16, padding: '12px 14px' }}>
              <button onClick={() => onToggleManual(it.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}><Checkbox on={it.done} /></button>
              <div style={{ flex: 1, fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: it.done ? 'var(--ink-30)' : 'var(--ink)', textDecoration: it.done ? 'line-through' : 'none' }}>{it.text}</div>
              <button onClick={() => onRemoveManual(it.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-30)', padding: 4, display: 'flex' }}><Icon name="trash" size={18} /></button>
            </div>
          ))}
        </div>

        {totalAuto === 0 && manual.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-40)', fontFamily: 'var(--sans)' }}>
            <p style={{ margin: 0, fontSize: 14.5 }}>Tu lista está vacía. Planea comidas en la semana y aquí aparecerán los ingredientes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
