// DaySheet.jsx — hoja de día del planeador.
import { useState, useEffect } from 'react';
import { isOrder, catColor } from '../lib/constants';
import { Icon } from '../components/Icon';
import { Sheet, Btn, CatChip, OrderNote } from '../components/primitives';

export function DaySheet({ open, title, meal, eaten, dayComplements = [], onClose, onShuffle, onPick, onToggleEaten, onClear, onEditComplements }) {
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => { if (!open) setShuffled(false); }, [open]);

  const handleShuffle = () => { onShuffle(); setShuffled(true); };

  if (!open) return null;
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {meal ? (
        <div style={{ background: 'var(--cream)', border: '1px solid var(--line-soft)', borderRadius: 18, padding: '16px', marginBottom: 16 }}>
          <CatChip cat={meal.category} />
          <h2 style={{ margin: '10px 0 0', fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>{meal.name}</h2>
          {isOrder(meal) ? (
            <>
              <div style={{ marginTop: 12 }}><OrderNote style={{ background: 'var(--surface)' }} /></div>
              {meal.ingredients.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {meal.ingredients.map((ord, i) => (
                    <span key={i} style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--ink-70)', background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 999, padding: '4px 10px' }}>{ord}</span>
                  ))}
                </div>
              )}
            </>
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

      {/* Complementos del día */}
      {meal && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--ink-40)' }}>Complementos</span>
            <button onClick={onEditComplements} style={{ border: 'none', background: 'var(--blue-soft)', color: 'var(--blue-deep)', borderRadius: 999, padding: '6px 12px', fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="plus" size={15} sw={2.4} stroke="var(--blue-deep)" /> {dayComplements.length > 0 ? 'Editar' : 'Agregar'}
            </button>
          </div>
          {dayComplements.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {dayComplements.map(c => (
                <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', background: 'var(--cream-2)', borderRadius: 999, padding: '6px 12px' }}>
                  <Icon name="bowl" size={14} sw={1.8} stroke="var(--ink-60)" /> {c.name}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink-40)' }}>Sin complementos. Agrega arroz, ensalada, etc.</p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {/* Botón confirmar: aparece solo después de barajar */}
        {shuffled && meal && (
          <Btn variant="primary" full icon="check" onClick={onClose}>Confirmar</Btn>
        )}

        {meal && !shuffled && (
          <Btn variant={eaten ? 'soft' : 'primary'} full icon={eaten ? 'close' : 'check'} onClick={onToggleEaten}>
            {eaten ? 'Desmarcar (no lo comimos)' : 'Marcar como comido'}
          </Btn>
        )}

        <div style={{ display: 'flex', gap: 9 }}>
          <Btn variant="soft" icon="shuffle" style={{ flex: 1 }} onClick={handleShuffle}>{meal ? 'Otra' : 'Sugerir'}</Btn>
          <Btn variant="ghost" icon="comidas" style={{ flex: 1 }} onClick={onPick}>Del recetario</Btn>
        </div>
        {meal && (
          <button onClick={onClear} style={{ border: 'none', background: 'transparent', color: 'var(--ink-40)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px', marginTop: 2 }}>Quitar del día</button>
        )}
      </div>
    </Sheet>
  );
}
