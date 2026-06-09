// primitives.jsx — primitivas visuales (portadas de ui.jsx / screens-more.jsx).
import { useEffect } from 'react';
import { CATS, catColor } from '../lib/constants';
import { Icon } from './Icon';

// ── Chip de categoría ───────────────────────────────────────────────
export function CatChip({ cat, size = 'md' }) {
  const sm = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: sm ? '3px 9px' : '5px 11px', borderRadius: 999,
      background: catColor(cat, 0.95, 0.035),
      color: catColor(cat, 0.42, 0.08),
      fontSize: sm ? 11.5 : 12.5, fontWeight: 600, letterSpacing: 0.1,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: catColor(cat, 0.6, 0.12) }} />
      {(CATS[cat] || {}).label || cat}
    </span>
  );
}

// ── Botón de favorito (corazón terracota) ───────────────────────────
export function HeartBtn({ active, onClick, size = 22 }) {
  return (
    <button onClick={onClick} aria-label="favorito" style={{
      border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
      display: 'flex', color: active ? 'var(--clay)' : 'var(--ink-30)',
      transition: 'transform .15s ease, color .15s ease',
    }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.82)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <Icon name="heart" size={size} fill={active ? 'var(--clay)' : 'none'} stroke={active ? 'var(--clay)' : 'currentColor'} sw={1.7} />
    </button>
  );
}

// ── Botones ─────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', icon, full, size = 'md', style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'var(--sans)', fontWeight: 600, cursor: 'pointer',
    border: 'none', borderRadius: 14, width: full ? '100%' : undefined,
    whiteSpace: 'nowrap',
    fontSize: size === 'sm' ? 14 : 15.5,
    padding: size === 'sm' ? '9px 14px' : '14px 18px',
    transition: 'transform .12s ease, background .15s ease, box-shadow .15s ease',
    WebkitTapHighlightColor: 'transparent',
  };
  const variants = {
    primary: { background: 'var(--blue)', color: '#fff', boxShadow: '0 6px 16px -6px var(--blue-shadow)' },
    soft: { background: 'var(--blue-soft)', color: 'var(--blue-deep)' },
    ghost: { background: 'transparent', color: 'var(--blue-deep)', border: '1.5px solid var(--line)' },
    clay: { background: 'var(--clay-soft)', color: 'var(--clay-deep)' },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      {icon && <Icon name={icon} size={size === 'sm' ? 17 : 19} sw={2} />}
      {children}
    </button>
  );
}

// ── Hoja inferior (modal) ───────────────────────────────────────────
export function Sheet({ open, onClose, title, children, maxH = '82%' }) {
  // Cerrar con la tecla Esc mientras la hoja está abierta (A1).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" aria-label={title} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(28,32,48,0.34)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: 'var(--surface)',
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        maxHeight: maxH, display: 'flex', flexDirection: 'column',
        boxShadow: '0 -12px 40px rgba(28,32,48,0.18)',
        animation: 'sheetUp .28s cubic-bezier(.2,.8,.2,1)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <div style={{ width: 38, height: 5, borderRadius: 999, background: 'var(--line)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 10px' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
          <button onClick={onClose} aria-label="Cerrar" style={{ border: 'none', background: 'var(--cream-2)', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-60)' }}>
            <Icon name="close" size={18} sw={2.2} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '0 20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Encabezado de pantalla ──────────────────────────────────────────
export function ScreenHeader({ overline, title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '6px 22px 14px' }}>
      <div>
        {overline && <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 3 }}>{overline}</div>}
        <h1 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 600, color: 'var(--ink)', letterSpacing: -0.3, whiteSpace: 'nowrap' }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

// ── Nota "para pedir" (categoría Restaurante) ────────────────────────
export function OrderNote({ style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      background: catColor('Restaurante', 0.96, 0.03), borderRadius: 13,
      padding: '11px 13px', color: catColor('Restaurante', 0.45, 0.09),
      fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 600, ...style,
    }}>
      <Icon name="bag" size={19} sw={1.8} stroke={catColor('Restaurante', 0.55, 0.1)} />
      Se pide a domicilio · no se cocina
    </div>
  );
}

// ── Checkbox ────────────────────────────────────────────────────────
export function Checkbox({ on }) {
  return (
    <span style={{
      width: 24, height: 24, borderRadius: 8, flexShrink: 0,
      border: on ? 'none' : '2px solid var(--line)',
      background: on ? 'var(--blue)' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all .15s ease',
    }}>
      {on && <Icon name="check" size={15} sw={3} stroke="#fff" />}
    </span>
  );
}
