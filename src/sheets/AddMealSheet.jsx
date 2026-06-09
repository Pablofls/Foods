// AddMealSheet.jsx — agregar o editar comida.
// Si se pasa `editMeal`, el formulario se pre-llena y guarda como edición.
import { useState, useEffect } from 'react';
import { CATS, catColor } from '../lib/constants';
import { Icon } from '../components/Icon';
import { Sheet, Btn, OrderNote } from '../components/primitives';

export function AddMealSheet({ open, onClose, onSave, presetName = '', editMeal = null }) {
  const [name, setName] = useState('');
  const [cat, setCat] = useState('Pollo');
  const [ings, setIngs] = useState(['']);

  useEffect(() => {
    if (!open) return;
    if (editMeal) {
      setName(editMeal.name);
      setCat(editMeal.category);
      setIngs(editMeal.ingredients.length > 0 ? editMeal.ingredients : ['']);
    } else {
      setName(presetName);
      setCat('Pollo');
      setIngs(['']);
    }
  }, [open, editMeal, presetName]);

  const setIng = (i, v) => setIngs(arr => arr.map((x, idx) => idx === i ? v : x));
  const addIng = () => setIngs(arr => [...arr, '']);
  const rmIng = (i) => setIngs(arr => arr.filter((_, idx) => idx !== i));

  const save = () => {
    if (!name.trim()) return;
    const clean = ings.map(s => s.trim()).filter(Boolean);
    const data = { name: name.trim(), category: cat, ingredients: clean };
    if (editMeal) data.id = editMeal.id;
    onSave(data);
    onClose();
  };

  const isRestaurant = cat === 'Restaurante';
  const cats = Object.keys(CATS);
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
    <Sheet open={open} onClose={onClose} title={editMeal ? 'Editar comida' : 'Nueva comida'}>
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Ej. Sopa de verduras" style={inputStyle} autoFocus />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Categoría</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {cats.map(c => {
            const on = cat === c;
            return (
              <button key={c} onClick={() => setCat(c)} style={{
                border: on ? `1.5px solid ${catColor(c, 0.55, 0.1)}` : '1px solid var(--line)',
                background: on ? catColor(c, 0.95, 0.04) : 'var(--surface)',
                color: on ? catColor(c, 0.42, 0.1) : 'var(--ink-60)',
                borderRadius: 999, padding: '8px 13px', fontFamily: 'var(--sans)',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: catColor(c, 0.6, 0.12) }} />
                {(CATS[c] || {}).label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <label style={labelStyle}>
          {isRestaurant ? 'Lo que pedimos (historial de órdenes)' : 'Ingredientes'}
        </label>

        {/* Para restaurantes: pequeña nota + lista editable de pedidos */}
        {isRestaurant && (
          <div style={{ marginBottom: 10 }}>
            <OrderNote />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ings.map((ing, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <input value={ing} onChange={e => setIng(i, e.target.value)}
                placeholder={isRestaurant ? `Ej. Pizza margarita, refresco` : `Ingrediente ${i + 1}`}
                style={inputStyle}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (i === ings.length - 1) addIng(); } }} />
              {ings.length > 1 && (
                <button onClick={() => rmIng(i)} aria-label="Quitar ingrediente" style={{ border: 'none', background: 'var(--cream-2)', borderRadius: 13, width: 46, flexShrink: 0, cursor: 'pointer', color: 'var(--ink-40)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="close" size={17} sw={2.2} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addIng} style={{ marginTop: 10, border: '1.5px dashed var(--line)', background: 'transparent', borderRadius: 12, padding: '10px', width: '100%', cursor: 'pointer', color: 'var(--blue)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="plus" size={17} sw={2.2} stroke="var(--blue)" />
          {isRestaurant ? 'Agregar pedido' : 'Otro ingrediente'}
        </button>
      </div>

      <Btn variant="primary" full onClick={save} icon="check">
        {editMeal ? 'Guardar cambios' : 'Guardar en mi recetario'}
      </Btn>
    </Sheet>
  );
}
