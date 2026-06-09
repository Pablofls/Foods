// MealRow.jsx — fila de comida reutilizable + banda decorativa talavera.
import { catColor } from '../lib/constants';
import { CatChip } from './primitives';

export function MealRow({ meal, onClick, right, sub }) {
  // Fila clicable como div (no <button>) para poder anidar el botón de favorito.
  // `meal.category` puede faltar (ej. complementos): usa un tono neutro.
  const hasCat = !!meal.category;
  const avatarBg = hasCat ? catColor(meal.category, 0.93, 0.045) : 'var(--cream-2)';
  const avatarColor = hasCat ? catColor(meal.category, 0.45, 0.1) : 'var(--ink-60)';
  return (
    <div role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(e); } }}
      style={{
        display: 'flex', alignItems: 'center', gap: 13, width: '100%',
        background: 'var(--surface)', border: '1px solid var(--line-soft)',
        borderRadius: 18, padding: '13px 14px', cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left', transition: 'transform .12s ease, box-shadow .15s ease',
      }}
      onMouseDown={e => onClick && (e.currentTarget.style.transform = 'scale(0.985)')}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0,
        background: avatarBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 600,
        color: avatarColor }}>
        {meal.name.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 15.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.name}</div>
        <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasCat && <CatChip cat={meal.category} size="sm" />}
          {sub && <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-40)', whiteSpace: 'nowrap' }}>{sub}</span>}
        </div>
      </div>
      {right}
    </div>
  );
}

// Banda decorativa tipo talavera (CSS, sin imágenes)
export function TalaveraBand({ cat }) {
  const c = catColor(cat, 0.62, 0.1);
  const c2 = catColor(cat, 0.92, 0.05);
  return (
    <div style={{
      height: 64, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden',
      background: `${c2}`,
      backgroundImage: `radial-gradient(circle at 16px 16px, ${c} 3px, transparent 3.5px), radial-gradient(circle at 0 0, ${c} 2px, transparent 2.5px), radial-gradient(circle at 32px 32px, ${c} 2px, transparent 2.5px)`,
      backgroundSize: '32px 32px',
      position: 'relative',
    }} />
  );
}
