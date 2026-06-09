// ComplementosScreen.jsx — catálogo de complementos (guarniciones).
import { useState } from 'react';
import { Icon } from '../components/Icon';
import { ScreenHeader, HeartBtn } from '../components/primitives';
import { MealRow } from '../components/MealRow';

export function ComplementosScreen({ complements, onToggleFav, onOpen, onAdd }) {
  const [q, setQ] = useState('');

  const list = complements.filter(x =>
    x.name.toLowerCase().includes(q.toLowerCase()) ||
    x.ingredients.some(ing => ing.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div style={{ padding: '4px 0 16px' }}>
      <ScreenHeader overline="Guarniciones" title="Complementos" right={
        <button onClick={onAdd} aria-label="Agregar" style={{ border: 'none', background: 'var(--blue)', color: '#fff', width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 16px -6px var(--blue-shadow)' }}>
          <Icon name="plus" size={22} sw={2.4} />
        </button>
      } />

      <p style={{ margin: '0 22px 12px', fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-60)', lineHeight: 1.45 }}>
        Lo que acompaña a la comida principal (arroz, ensalada, frijoles…). Cada día puedes asignar varios.
      </p>

      <div style={{ padding: '0 18px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }}><Icon name="search" size={18} /></span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar complemento o ingrediente…" style={{
            width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 40px',
            borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface)',
            fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', outline: 'none',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 18px 0' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--ink-40)', fontWeight: 500, paddingLeft: 4 }}>{list.length} complemento{list.length !== 1 ? 's' : ''}</div>
        {list.map(comp => (
          <MealRow key={comp.id} meal={comp} onClick={() => onOpen(comp)}
            sub={`${comp.ingredients.length} ingrediente${comp.ingredients.length !== 1 ? 's' : ''}`}
            right={<HeartBtn active={comp.favorite} onClick={(e) => { e.stopPropagation(); onToggleFav(comp.id); }} size={21} />} />
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--ink-40)', fontFamily: 'var(--sans)' }}>
            <p style={{ margin: 0 }}>No encontramos nada.</p>
            <button onClick={onAdd} style={{ marginTop: 12, border: 'none', background: 'var(--blue-soft)', color: 'var(--blue-deep)', borderRadius: 12, padding: '10px 16px', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ Agregar {q ? `“${q}”` : 'complemento'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
