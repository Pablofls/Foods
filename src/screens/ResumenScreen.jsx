// ResumenScreen.jsx — estadísticas (portado de screens-more.jsx).
import { CATS, catColor } from '../lib/constants';
import { ScreenHeader } from '../components/primitives';

export function ResumenScreen({ meals, plan, mealById }) {
  const total = meals.length;
  const favs = meals.filter(m => m.favorite).length;
  const planThisWeek = plan.filter(d => d.mealId);
  const variety = new Set(planThisWeek.map(d => { const mm = mealById(d.mealId); return mm && mm.category; })).size;

  const ranked = [...meals].sort((a, b) => b.timesEaten - a.timesEaten).slice(0, 6);
  const max = Math.max(1, ...ranked.map(m => m.timesEaten));

  const byCat = {};
  meals.forEach(m => { byCat[m.category] = (byCat[m.category] || 0) + 1; });
  const catEntries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  const Tile = ({ value, label, sub }) => (
    <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 18, padding: '14px 14px' }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, color: 'var(--blue)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-70)', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-40)', marginTop: 1 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: '4px 0 16px' }}>
      <ScreenHeader overline="Hábitos" title="Resumen" />

      <div style={{ display: 'flex', gap: 10, padding: '0 18px' }}>
        <Tile value={total} label="Platillos" sub="en tu recetario" />
        <Tile value={favs} label="Favoritas" sub="marcadas" />
        <Tile value={variety} label="Variedad" sub="tipos esta semana" />
      </div>

      <div style={{ margin: '24px 18px 0', background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 22, padding: '18px 18px 8px' }}>
        <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 600, color: 'var(--ink)' }}>Lo que más comen</h3>
        <p style={{ margin: '0 0 16px', fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--ink-40)' }}>Veces cocinado en casa</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {ranked.map((m) => (
            <div key={m.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{m.name}</span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, color: 'var(--ink-40)', whiteSpace: 'nowrap' }}>{m.timesEaten}×</span>
              </div>
              <div style={{ height: 9, borderRadius: 999, background: 'var(--cream-2)', overflow: 'hidden' }}>
                <div style={{ width: `${(m.timesEaten / max) * 100}%`, height: '100%', borderRadius: 999, background: catColor(m.category, 0.6, 0.12), transition: 'width .6s cubic-bezier(.2,.8,.2,1)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: '14px 18px 0', background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 22, padding: '18px' }}>
        <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 600, color: 'var(--ink)' }}>Tu repertorio por tipo</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {catEntries.map(([cat, n]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, background: catColor(cat, 0.96, 0.03), borderRadius: 12, padding: '9px 13px' }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: catColor(cat, 0.6, 0.12) }} />
              <span style={{ fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-70)' }}>{(CATS[cat] || {}).label || cat}</span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, color: catColor(cat, 0.45, 0.1) }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
