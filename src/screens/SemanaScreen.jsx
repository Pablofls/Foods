// SemanaScreen.jsx — planeador semanal + selector de semana (portado de screens-home.jsx).
import { todayIndex, weekDates, weekRange, weekLabel, DAYS, DAYS_FULL, MONTHS, catColor } from '../lib/constants';
import { Icon } from '../components/Icon';

function WeekSwitcher({ offset, onChange }) {
  const nav = (dir) => (
    <button onClick={() => onChange(offset + dir)} aria-label={dir < 0 ? 'Anterior' : 'Siguiente'} style={{
      border: '1px solid var(--line)', background: 'var(--surface)', width: 42, height: 42, borderRadius: 13,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--blue-deep)', flexShrink: 0,
    }}>
      <Icon name={dir < 0 ? 'back' : 'chevron'} size={20} sw={2.2} stroke="var(--blue-deep)" />
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 18px 6px' }}>
      {nav(-1)}
      <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{weekLabel(offset)}</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, color: 'var(--ink-40)', marginTop: 1, whiteSpace: 'nowrap' }}>{weekRange(offset)}</div>
      </div>
      {nav(1)}
    </div>
  );
}

export function SemanaScreen({ offset, setOffset, plan, mealById, onOpenDay }) {
  const dates = weekDates(offset);
  const TI = todayIndex();
  const isCurrent = offset === 0;
  const isPastWeek = offset < 0;
  const planeados = plan.filter(d => d.mealId).length;
  const comidos = plan.filter(d => d.eaten).length;

  return (
    <div style={{ padding: '4px 0 16px' }}>
      <div style={{ padding: '6px 22px 4px' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--blue)' }}>Planeador</div>
      </div>
      <WeekSwitcher offset={offset} onChange={setOffset} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '2px 18px 14px' }}>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-40)', background: 'var(--cream-2)', borderRadius: 999, padding: '5px 12px' }}>
          {isPastWeek ? `${comidos} comidas registradas` : `${planeados} de 7 días planeados`}
        </span>
        {!isCurrent && (
          <button onClick={() => setOffset(0)} style={{ border: 'none', background: 'var(--blue-soft)', color: 'var(--blue-deep)', borderRadius: 999, padding: '5px 12px', fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Ir a esta semana</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 18px' }}>
        {plan.map((d, i) => {
          const meal = d.mealId ? mealById(d.mealId) : null;
          const date = dates[i];
          const isToday = isCurrent && i === TI;
          return (
            <button key={i} onClick={() => onOpenDay(i)} style={{
              display: 'flex', alignItems: 'stretch', gap: 0, width: '100%', textAlign: 'left',
              background: 'var(--surface)', cursor: 'pointer', overflow: 'hidden',
              border: isToday ? '1.5px solid var(--blue)' : '1px solid var(--line-soft)',
              borderRadius: 20, opacity: !meal && isPastWeek ? 0.6 : 1,
              boxShadow: isToday ? '0 10px 26px -18px var(--blue-shadow)' : 'none',
              transition: 'transform .12s ease',
            }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.99)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{ width: 52, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                background: isToday ? 'var(--blue)' : (meal ? catColor(meal.category, 0.96, 0.03) : 'var(--cream-2)') }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: isToday ? 'rgba(255,255,255,0.85)' : 'var(--ink-40)' }}>{DAYS[i]}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 600, lineHeight: 1, color: isToday ? '#fff' : 'var(--ink)' }}>{date.getDate()}</span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: isToday ? 'rgba(255,255,255,0.85)' : 'var(--ink-30)' }}>{MONTHS[date.getMonth()]}</span>
              </div>
              <div style={{ flex: 1, padding: '12px 14px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: meal ? 4 : 0 }}>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, color: isToday ? 'var(--blue)' : 'var(--ink-60)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{DAYS_FULL[i]}</span>
                  {isToday && <span style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--blue)', borderRadius: 999, padding: '2px 7px', letterSpacing: 0.3 }}>HOY</span>}
                </div>
                {meal ? (
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 17.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.name}</span>
                ) : (
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-40)', fontWeight: 500 }}>{isPastWeek ? 'Sin registro' : 'Sin asignar · toca para elegir'}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14, color: 'var(--ink-30)' }}>
                {d.eaten
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 999, background: 'var(--blue-soft)', color: 'var(--blue)' }}><Icon name="check" size={17} sw={2.6} stroke="var(--blue)" /></span>
                  : <Icon name="chevron" size={19} stroke="var(--ink-30)" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
