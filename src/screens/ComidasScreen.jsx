// ComidasScreen.jsx — recetario (portado de screens-more.jsx).
import { useState } from 'react';
import { CATS, isOrder } from '../lib/constants';
import { Icon } from '../components/Icon';
import { ScreenHeader, HeartBtn } from '../components/primitives';
import { MealRow } from '../components/MealRow';

export function ComidasScreen({ meals, onToggleFav, onOpenMeal, onAdd }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('Todas'); // Todas | Favoritas | <cat>
  const cats = Object.keys(CATS);

  let list = meals.filter(x =>
    x.name.toLowerCase().includes(q.toLowerCase()) ||
    x.ingredients.some(ing => ing.toLowerCase().includes(q.toLowerCase()))
  );
  if (filter === 'Favoritas') list = list.filter(x => x.favorite);
  else if (filter !== 'Todas') list = list.filter(x => x.category === filter);

  const chips = ['Todas', 'Favoritas', ...cats];

  return (
    <div style={{ padding: '4px 0 16px' }}>
      <ScreenHeader overline="Recetario" title="Mis comidas" right={
        <button onClick={onAdd} aria-label="Agregar" style={{ border: 'none', background: 'var(--blue)', color: '#fff', width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 16px -6px var(--blue-shadow)' }}>
          <Icon name="plus" size={22} sw={2.4} />
        </button>
      } />

      <div style={{ padding: '0 18px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }}><Icon name="search" size={18} /></span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar platillo o ingrediente…" style={{
            width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 40px',
            borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface)',
            fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', outline: 'none',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 18px 4px', margin: 0 }}>
        {chips.map(c => {
          const on = filter === c;
          return (
            <button key={c} onClick={() => setFilter(c)} style={{
              flexShrink: 0, border: on ? '1.5px solid var(--blue)' : '1px solid var(--line)',
              background: on ? 'var(--blue)' : 'var(--surface)', color: on ? '#fff' : 'var(--ink-70)',
              borderRadius: 999, padding: '7px 14px', fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{c}</button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '12px 18px 0' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--ink-40)', fontWeight: 500, paddingLeft: 4 }}>{list.length} platillo{list.length !== 1 ? 's' : ''}</div>
        {list.map(meal => (
          <MealRow key={meal.id} meal={meal} onClick={() => onOpenMeal(meal.id)}
            sub={isOrder(meal) ? 'Para pedir' : `${meal.ingredients.length} ingredientes`}
            right={<HeartBtn active={meal.favorite} onClick={(e) => { e.stopPropagation(); onToggleFav(meal.id); }} size={21} />} />
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--ink-40)', fontFamily: 'var(--sans)' }}>
            <p style={{ margin: 0 }}>No encontramos nada.</p>
            <button onClick={onAdd} style={{ marginTop: 12, border: 'none', background: 'var(--blue-soft)', color: 'var(--blue-deep)', borderRadius: 12, padding: '10px 16px', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ Agregar “{q}”</button>
          </div>
        )}
      </div>
    </div>
  );
}
