// MealPickerSheet.jsx — selector de comida (portado de screens-home.jsx).
import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Sheet } from '../components/primitives';
import { MealRow } from '../components/MealRow';

export function MealPickerSheet({ open, onClose, meals, onPick, title = 'Elegir comida' }) {
  const [q, setQ] = useState('');
  useEffect(() => { if (!open) setQ(''); }, [open]);
  const list = meals.filter(x => x.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }}><Icon name="search" size={18} /></span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar en tu recetario…" style={{
          width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 40px',
          borderRadius: 14, border: '1px solid var(--line)', background: 'var(--cream)',
          fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', outline: 'none',
        }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {list.map(meal => (
          <MealRow key={meal.id} meal={meal} onClick={() => { onPick(meal.id); onClose(); }}
            right={meal.favorite ? <Icon name="heart" size={18} fill="var(--clay)" stroke="var(--clay)" sw={1.6} /> : <Icon name="chevron" size={18} stroke="var(--ink-30)" />}
            sub={meal.daysAgo !== null && meal.daysAgo < 6 ? `hace ${meal.daysAgo} d` : null} />
        ))}
        {list.length === 0 && <p style={{ textAlign: 'center', color: 'var(--ink-40)', fontFamily: 'var(--sans)', padding: '20px 0' }}>Sin resultados</p>}
      </div>
    </Sheet>
  );
}
