// MealDetailSheet.jsx — detalle de comida del recetario (portado de sheets.jsx).
import { isOrder, catColor } from '../lib/constants';
import { Icon } from '../components/Icon';
import { Sheet, Btn, CatChip, HeartBtn, OrderNote } from '../components/primitives';
import { TalaveraBand } from '../components/MealRow';

export function MealDetailSheet({ mealId, mealById, onClose, onToggleFav, onDelete, onPlanToday }) {
  if (!mealId) return null;
  const meal = mealById(mealId);
  if (!meal) return null;
  return (
    <Sheet open={!!mealId} onClose={onClose} title="Platillo">
      <TalaveraBand cat={meal.category} />
      <div style={{ marginTop: -1, background: 'var(--cream)', border: '1px solid var(--line-soft)', borderTop: 'none', borderRadius: '0 0 18px 18px', padding: '16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: '0 0 9px', fontFamily: 'var(--serif)', fontSize: 25, fontWeight: 600, color: 'var(--ink)' }}>{meal.name}</h2>
            <CatChip cat={meal.category} />
          </div>
          <HeartBtn active={meal.favorite} onClick={() => onToggleFav(meal.id)} size={26} />
        </div>
        <div style={{ marginTop: 16 }}>
          {isOrder(meal) ? (
            <OrderNote style={{ background: 'var(--surface)' }} />
          ) : (
            <>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 9 }}>Ingredientes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {meal.ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink-70)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: catColor(meal.category, 0.6, 0.12), flexShrink: 0 }} />
                    {ing}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 16, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-40)' }}>
          <span>Cocinado <strong style={{ color: 'var(--ink-70)' }}>{meal.timesEaten}</strong> veces</span>
          {meal.daysAgo !== null && <span>Última vez hace <strong style={{ color: 'var(--ink-70)' }}>{meal.daysAgo}</strong> días</span>}
        </div>
      </div>

      <Btn variant="primary" full icon="hoy" onClick={() => { onPlanToday(meal.id); onClose(); }}>Poner para hoy</Btn>
      <button onClick={() => { onDelete(meal.id); onClose(); }} style={{ marginTop: 10, width: '100%', border: 'none', background: 'transparent', color: 'var(--clay-deep)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Icon name="trash" size={17} stroke="var(--clay-deep)" /> Eliminar del recetario
      </button>
    </Sheet>
  );
}
