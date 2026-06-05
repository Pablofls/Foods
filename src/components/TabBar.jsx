// TabBar.jsx — barra de navegación inferior (portado de ui.jsx).
import { Icon } from './Icon';

export function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'hoy', label: 'Hoy', icon: 'hoy' },
    { id: 'semana', label: 'Semana', icon: 'semana' },
    { id: 'comidas', label: 'Comidas', icon: 'comidas' },
    { id: 'lista', label: 'Lista', icon: 'lista' },
    { id: 'resumen', label: 'Resumen', icon: 'resumen' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      paddingTop: 8, paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
      background: 'var(--surface-blur)',
      backdropFilter: 'blur(18px) saturate(180%)',
      WebkitBackdropFilter: 'blur(18px) saturate(180%)',
      borderTop: '1px solid var(--line-soft)',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: on ? 'var(--blue)' : 'var(--ink-40)', flex: 1,
            transition: 'color .15s ease',
          }}>
            <Icon name={t.icon} size={25} sw={on ? 2.1 : 1.8} fill={on ? 'var(--blue-soft)' : 'none'} />
            <span style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: on ? 700 : 500, letterSpacing: 0.1 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
