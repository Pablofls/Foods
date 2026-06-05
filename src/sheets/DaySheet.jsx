// DaySheet.jsx — hoja de día del planeador (portado de sheets.jsx).
import { isOrder } from '../lib/constants';
import { Sheet, Btn, CatChip, OrderNote } from '../components/primitives';

export function DaySheet({ open, title, meal, eaten, onClose, onShuffle, onPick, onToggleEaten, onClear }) {
  if (!open) return null;
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {meal ? (
        <div style={{ background: 'var(--cream)', border: '1px solid var(--line-soft)', borderRadius: 18, padding: '16px', marginBottom: 16 }}>
          <CatChip cat={meal.category} />
          <h2 style={{ margin: '10px 0 0', fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>{meal.name}</h2>
          {isOrder(meal) ? (
            <div style={{ marginTop: 12 }}><OrderNote style={{ background: 'var(--surface)' }} /></div>
          ) : (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {meal.ingredients.map((ing, i) => (
                <span key={i} style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--ink-70)', background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 999, padding: '4px 10px' }}>{ing}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-60)', fontSize: 15, margin: '0 0 16px' }}>Aún no hay nada planeado para este día.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {meal && (
          <Btn variant={eaten ? 'soft' : 'primary'} full icon={eaten ? 'close' : 'check'} onClick={onToggleEaten}>
            {eaten ? 'Desmarcar (no lo comimos)' : 'Marcar como comido'}
          </Btn>
        )}
        <div style={{ display: 'flex', gap: 9 }}>
          <Btn variant="soft" icon="shuffle" style={{ flex: 1 }} onClick={onShuffle}>{meal ? 'Otra' : 'Sugerir'}</Btn>
          <Btn variant="ghost" icon="comidas" style={{ flex: 1 }} onClick={onPick}>Del recetario</Btn>
        </div>
        {meal && (
          <button onClick={onClear} style={{ border: 'none', background: 'transparent', color: 'var(--ink-40)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px', marginTop: 2 }}>Quitar del día</button>
        )}
      </div>
    </Sheet>
  );
}
