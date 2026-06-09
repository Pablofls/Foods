// ComplementPickerSheet.jsx — selector multi-selección de complementos para un día.
import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Sheet, Btn, Checkbox } from '../components/primitives';

export function ComplementPickerSheet({ open, complements, selectedIds = [], onClose, onConfirm }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(new Set());

  useEffect(() => {
    if (open) { setSel(new Set(selectedIds)); setQ(''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (id) => setSel(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const list = complements.filter(x => x.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Sheet open={open} onClose={onClose} title="Complementos del día">
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)' }}><Icon name="search" size={18} /></span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar complemento…" style={{
          width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 40px',
          borderRadius: 14, border: '1px solid var(--line)', background: 'var(--cream)',
          fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', outline: 'none',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {list.map(comp => {
          const on = sel.has(comp.id);
          return (
            <button key={comp.id} onClick={() => toggle(comp.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
              background: on ? 'var(--blue-soft)' : 'var(--surface)',
              border: on ? '1.5px solid var(--blue)' : '1px solid var(--line-soft)',
              borderRadius: 14, padding: '12px 14px', cursor: 'pointer',
            }}>
              <Checkbox on={on} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{comp.name}</div>
                {comp.ingredients.length > 0 && (
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 11.5, color: 'var(--ink-40)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp.ingredients.join(', ')}</div>
                )}
              </div>
            </button>
          );
        })}
        {complements.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--ink-40)', fontFamily: 'var(--sans)', fontSize: 14, padding: '20px 10px', lineHeight: 1.5 }}>
            Aún no tienes complementos. Créalos en la pestaña “Extras”.
          </p>
        )}
        {complements.length > 0 && list.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--ink-40)', fontFamily: 'var(--sans)', padding: '16px 0' }}>Sin resultados</p>
        )}
      </div>

      <Btn variant="primary" full icon="check" onClick={() => { onConfirm([...sel]); onClose(); }}>
        Confirmar {sel.size > 0 ? `(${sel.size})` : ''}
      </Btn>
    </Sheet>
  );
}
