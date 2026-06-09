// HoyScreen.jsx — pantalla "Hoy" (portado de screens-home.jsx).
import { today, todayIndex, DAYS, DAYS_FULL, MONTHS_FULL, catColor, isOrder } from '../lib/constants';
import { Icon } from '../components/Icon';
import { CatChip, HeartBtn, Btn, OrderNote } from '../components/primitives';
import { TalaveraBand } from '../components/MealRow';

export function HoyScreen({ plan, mealById, complementById, onShuffle, onMarkEaten, onPickToday, onToggleFav, goTo }) {
  const TI = todayIndex();
  const T = today();
  const todayDay = plan[TI];
  const meal = todayDay.mealId ? mealById(todayDay.mealId) : null;
  const dayComplements = (todayDay.complementIds || []).map(id => complementById(id)).filter(Boolean);
  const fecha = `${DAYS_FULL[TI]} ${T.getDate()} de ${MONTHS_FULL[T.getMonth()]}`;

  return (
    <div style={{ padding: '4px 0 16px' }}>
      <div style={{ padding: '4px 22px 6px' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--blue)' }}>{fecha}</div>
        <h1 style={{ margin: '2px 0 0', fontFamily: 'var(--serif)', fontSize: 29, fontWeight: 600, color: 'var(--ink)', letterSpacing: -0.3 }}>¿Qué comemos?</h1>
      </div>

      {/* Tarjeta principal */}
      <div style={{ margin: '12px 18px 0', borderRadius: 26, background: 'var(--surface)', border: '1px solid var(--line-soft)', boxShadow: '0 14px 36px -22px rgba(28,40,70,0.4)', overflow: 'hidden' }}>
        {meal ? (
          <>
            <TalaveraBand cat={meal.category} />
            <div style={{ padding: '16px 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-40)', marginBottom: 9 }}>
                    {todayDay.eaten ? 'Comieron hoy' : 'Sugerencia de hoy'}
                  </div>
                  <CatChip cat={meal.category} />
                  <h2 style={{ margin: '10px 0 0', fontFamily: 'var(--serif)', fontSize: 27, fontWeight: 600, lineHeight: 1.12, color: 'var(--ink)', letterSpacing: -0.4, textWrap: 'pretty' }}>{meal.name}</h2>
                </div>
                <HeartBtn active={meal.favorite} onClick={() => onToggleFav(meal.id)} size={24} />
              </div>

              {/* Ingredientes o nota de pedido */}
              {isOrder(meal) ? (
                <div style={{ marginTop: 16 }}><OrderNote /></div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 8 }}>Ingredientes</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {meal.ingredients.map((ing, i) => (
                      <span key={i} style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-70)', background: 'var(--cream)', border: '1px solid var(--line-soft)', borderRadius: 999, padding: '5px 11px' }}>{ing}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Complementos del día */}
              {dayComplements.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 8 }}>Con</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {dayComplements.map(c => (
                      <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', background: 'var(--cream-2)', borderRadius: 999, padding: '5px 11px' }}>
                        <Icon name="bowl" size={14} sw={1.8} stroke="var(--ink-60)" /> {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {todayDay.eaten ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center', padding: '13px', borderRadius: 14, background: 'var(--blue-soft)', color: 'var(--blue-deep)', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 15 }}>
                    <Icon name="check" size={20} sw={2.4} /> ¡Registrado! Buen provecho
                  </div>
                ) : (
                  <Btn variant="primary" icon="check" full onClick={onMarkEaten}>Ya lo comimos</Btn>
                )}
                <div style={{ display: 'flex', gap: 9 }}>
                  <Btn variant="soft" icon="shuffle" style={{ flex: 1 }} onClick={onShuffle}>Otra opción</Btn>
                  <Btn variant="ghost" icon="edit" style={{ flex: 1 }} onClick={onPickToday}>Elijo yo</Btn>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '34px 24px', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)' }}>Aún no hay nada para hoy</h2>
            <p style={{ margin: '0 0 16px', fontFamily: 'var(--sans)', color: 'var(--ink-60)', fontSize: 14.5 }}>Deja que la app proponga algo de tu repertorio.</p>
            <Btn variant="primary" icon="dice" onClick={onShuffle}>Sugerir comida</Btn>
          </div>
        )}
      </div>

      {/* Mini semana */}
      <div style={{ margin: '24px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Esta semana</h3>
          <button onClick={() => goTo('semana')} style={{ border: 'none', background: 'transparent', color: 'var(--blue)', fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Ver todo <Icon name="chevron" size={15} stroke="var(--blue)" sw={2.2} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, margin: '0 -22px', padding: '0 22px 4px' }}>
          {plan.map((d, i) => {
            const dm = d.mealId ? mealById(d.mealId) : null;
            const isToday = i === TI;
            return (
              <button key={i} onClick={() => goTo('semana')} style={{
                flexShrink: 0, width: 78, borderRadius: 16, padding: '10px 9px',
                border: isToday ? '1.5px solid var(--blue)' : '1px solid var(--line-soft)',
                background: isToday ? 'var(--blue-soft)' : 'var(--surface)', cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11.5, fontWeight: 700, color: isToday ? 'var(--blue-deep)' : 'var(--ink-40)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{DAYS[i]}</div>
                <div style={{ marginTop: 6, height: 7, width: 7, borderRadius: 999, background: dm ? catColor(dm.category, 0.62, 0.12) : 'var(--line)' }} />
                <div style={{ marginTop: 6, fontFamily: 'var(--sans)', fontSize: 11.5, lineHeight: 1.2, color: dm ? 'var(--ink-70)' : 'var(--ink-30)', height: 28, overflow: 'hidden' }}>
                  {dm ? dm.name : 'Libre'}
                </div>
                {d.eaten && <div style={{ marginTop: 2, color: 'var(--blue)' }}><Icon name="check" size={13} sw={2.6} stroke="var(--blue)" /></div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
