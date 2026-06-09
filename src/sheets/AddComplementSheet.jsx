// AddComplementSheet.jsx — agregar o editar un complemento (nombre + ingredientes).
// Si se pasa `editComplement`, el formulario se pre-llena y guarda como edición.
import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Sheet, Btn } from '../components/primitives';

export function AddComplementSheet({ open, onClose, onSave, onDelete, editComplement = null, presetName = '' }) {
  const [name, setName] = useState('');
  const [ings, setIngs] = useState(['']);

  useEffect(() => {
    if (!open) return;
    if (editComplement) {
      setName(editComplement.name);
      setIngs(editComplement.ingredients.length > 0 ? editComplement.ingredients : ['']);
    } else {
      setName(presetName);
      setIngs(['']);
    }
  }, [open, editComplement, presetName]);

  const setIng = (i, v) => setIngs(arr => arr.map((x, idx) => idx === i ? v : x));
  const addIng = () => setIngs(arr => [...arr, '']);
  const rmIng = (i) => setIngs(arr => arr.filter((_, idx) => idx !== i));

  const save = () => {
    if (!name.trim()) return;
    const clean = ings.map(s => s.trim()).filter(Boolean);
    const data = { name: name.trim(), ingredients: clean };
    if (editComplement) data.id = editComplement.id;
    onSave(data);
    onClose();
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 13,
    border: '1px solid var(--line)', background: 'var(--cream)', fontFamily: 'var(--sans)',
    fontSize: 15.5, color: 'var(--ink)', outline: 'none',
  };
  const labelStyle = {
    fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5,
    textTransform: 'uppercase', color: 'var(--ink-40)', display: 'block', marginBottom: 8,
  };

  return (
    <Sheet open={open} onClose={onClose} title={editComplement ? 'Editar complemento' : 'Nuevo complemento'}>
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Ej. Arroz rojo" style={inputStyle} autoFocus />
      </div>

      <div style={{ marginBottom: 22 }}>
        <label style={labelStyle}>Ingredientes</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ings.map((ing, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <input value={ing} onChange={e => setIng(i, e.target.value)}
                placeholder={`Ingrediente ${i + 1}`}
                style={inputStyle}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (i === ings.length - 1) addIng(); } }} />
              {ings.length > 1 && (
                <button onClick={() => rmIng(i)} style={{ border: 'none', background: 'var(--cream-2)', borderRadius: 13, width: 46, flexShrink: 0, cursor: 'pointer', color: 'var(--ink-40)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="close" size={17} sw={2.2} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addIng} style={{ marginTop: 10, border: '1.5px dashed var(--line)', background: 'transparent', borderRadius: 12, padding: '10px', width: '100%', cursor: 'pointer', color: 'var(--blue)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="plus" size={17} sw={2.2} stroke="var(--blue)" />
          Otro ingrediente
        </button>
      </div>

      <Btn variant="primary" full onClick={save} icon="check">
        {editComplement ? 'Guardar cambios' : 'Guardar complemento'}
      </Btn>

      {editComplement && onDelete && (
        <button onClick={() => { onDelete(editComplement.id); onClose(); }} style={{ marginTop: 10, width: '100%', border: 'none', background: 'transparent', color: 'var(--clay-deep)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Icon name="trash" size={17} stroke="var(--clay-deep)" /> Eliminar complemento
        </button>
      )}
    </Sheet>
  );
}
