// Toast.jsx — aviso flotante (portado de app.jsx).
import { Icon } from './Icon';

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)',
      zIndex: 90, background: 'var(--ink)', color: 'var(--cream)',
      padding: '11px 18px', borderRadius: 14, fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
      boxShadow: '0 10px 30px rgba(28,32,48,0.3)', whiteSpace: 'nowrap',
      animation: 'toastUp .25s ease', display: 'flex', alignItems: 'center', gap: 8,
      maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis',
    }}>
      <Icon name="check" size={17} sw={2.6} stroke="var(--cream)" /> {msg}
    </div>
  );
}
