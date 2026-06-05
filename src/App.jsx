// App.jsx — pestañas y orquestación de hojas. Estado vía useStore (persistente).
import { useState } from 'react';
import { todayIndex, weekDates, DAYS_FULL, MONTHS_FULL } from './lib/constants';
import { useStore } from './lib/useStore';
import { isSupabaseConfigured } from './supabaseClient';

import { TabBar } from './components/TabBar';
import { Toast } from './components/Toast';
import { HoyScreen } from './screens/HoyScreen';
import { SemanaScreen } from './screens/SemanaScreen';
import { ComidasScreen } from './screens/ComidasScreen';
import { ListaScreen } from './screens/ListaScreen';
import { ResumenScreen } from './screens/ResumenScreen';
import { MealPickerSheet } from './sheets/MealPickerSheet';
import { AddMealSheet } from './sheets/AddMealSheet';
import { DaySheet } from './sheets/DaySheet';
import { MealDetailSheet } from './sheets/MealDetailSheet';

export default function App() {
  const store = useStore();
  const {
    loading, error, meals, manual, checked, toast, mealById, getPlan,
    toggleFav, addMeal, updateMealFull, deleteMeal, assignMeal, shuffleDay, markEaten,
    toggleEaten, clearDay, planToday, toggleCheck, addManual, toggleManual, removeManual,
  } = store;

  const [tab, setTab] = useState('hoy');
  const [weekOffset, setWeekOffset] = useState(0);

  // hojas
  const [pickerFor, setPickerFor] = useState(null);   // 'today' | {off, index}
  const [dayOpen, setDayOpen] = useState(null);        // {off, index}
  const [addOpen, setAddOpen] = useState(false);
  const [addPreset, setAddPreset] = useState('');
  const [detailMeal, setDetailMeal] = useState(null);  // id
  const [editMeal, setEditMeal] = useState(null);      // objeto comida a editar

  const TI = todayIndex();
  const planNow = getPlan(0);
  const planViewed = getPlan(weekOffset);

  const onPickMeal = (mealId) => {
    if (pickerFor === 'today') { assignMeal(0, TI, mealId); }
    else if (pickerFor && typeof pickerFor === 'object') { assignMeal(pickerFor.off, pickerFor.index, mealId); }
    setPickerFor(null);
  };

  // callback unificado para add y edit
  const handleSaveMeal = (data) => {
    if (data.id) updateMealFull(data);
    else addMeal(data);
  };

  // datos del día abierto en la hoja
  const dayObj = dayOpen ? getPlan(dayOpen.off)[dayOpen.index] : null;
  const dayDate = dayOpen ? weekDates(dayOpen.off)[dayOpen.index] : null;
  const dayTitle = dayOpen ? `${DAYS_FULL[dayOpen.index]} ${dayDate.getDate()} de ${MONTHS_FULL[dayDate.getMonth()]}` : '';

  let screen = null;
  if (tab === 'hoy') screen = (
    <HoyScreen plan={planNow} mealById={mealById}
      onShuffle={() => shuffleDay(0, TI)}
      onMarkEaten={() => markEaten(0, TI)}
      onPickToday={() => setPickerFor('today')}
      onToggleFav={toggleFav}
      goTo={(t) => { if (t === 'semana') setWeekOffset(0); setTab(t); }} />
  );
  else if (tab === 'semana') screen = (
    <SemanaScreen offset={weekOffset} setOffset={setWeekOffset} plan={planViewed} mealById={mealById}
      onOpenDay={(i) => setDayOpen({ off: weekOffset, index: i })} />
  );
  else if (tab === 'comidas') screen = (
    <ComidasScreen meals={meals} onToggleFav={toggleFav} onOpenMeal={setDetailMeal}
      onAdd={() => { setAddPreset(''); setAddOpen(true); }} />
  );
  else if (tab === 'lista') screen = (
    <ListaScreen plan={planNow} mealById={mealById} checked={checked} onToggleCheck={toggleCheck}
      manual={manual} onAddManual={addManual} onToggleManual={toggleManual} onRemoveManual={removeManual} />
  );
  else if (tab === 'resumen') screen = (
    <ResumenScreen meals={meals} plan={planNow} mealById={mealById} />
  );

  return (
    <div className="app-shell">
      <div className="app-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 'calc(20px + env(safe-area-inset-top))', paddingBottom: 96 }}>
        {!isSupabaseConfigured && (
          <div style={{ margin: '0 18px 8px', padding: '9px 13px', borderRadius: 12, background: 'var(--clay-soft)', color: 'var(--clay-deep)', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>
            Modo local (sin Supabase): los datos se guardan solo en este navegador. Conecta Supabase para compartirlos entre dispositivos.
          </div>
        )}
        {error && (
          <div style={{ margin: '0 18px 8px', padding: '9px 13px', borderRadius: 12, background: 'var(--clay-soft)', color: 'var(--clay-deep)', fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600 }}>
            Error: {error}
          </div>
        )}
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--ink-40)', fontFamily: 'var(--sans)', padding: '60px 20px' }}>Cargando…</p>
        ) : screen}
      </div>

      <TabBar active={tab} onChange={(t) => { if (t === 'semana' && tab !== 'semana') setWeekOffset(0); setTab(t); }} />

      <MealPickerSheet open={pickerFor !== null} onClose={() => setPickerFor(null)} meals={meals} onPick={onPickMeal}
        title={pickerFor === 'today' ? 'Elegir para hoy' : 'Elegir comida'} />
      <DaySheet open={!!dayOpen} title={dayTitle}
        meal={dayObj && dayObj.mealId ? mealById(dayObj.mealId) : null}
        eaten={!!(dayObj && dayObj.eaten)}
        onClose={() => setDayOpen(null)}
        onShuffle={() => shuffleDay(dayOpen.off, dayOpen.index)}
        onPick={() => { const d = dayOpen; setDayOpen(null); setPickerFor({ off: d.off, index: d.index }); }}
        onToggleEaten={() => toggleEaten(dayOpen.off, dayOpen.index)}
        onClear={() => { clearDay(dayOpen.off, dayOpen.index); setDayOpen(null); }} />
      <AddMealSheet
        open={addOpen || !!editMeal}
        editMeal={editMeal}
        onClose={() => { setAddOpen(false); setEditMeal(null); }}
        onSave={handleSaveMeal}
        presetName={addPreset} />
      <MealDetailSheet mealId={detailMeal} mealById={mealById} onClose={() => setDetailMeal(null)}
        onToggleFav={toggleFav} onDelete={deleteMeal} onPlanToday={planToday}
        onEdit={(meal) => { setDetailMeal(null); setEditMeal(meal); }} />

      <Toast msg={toast} />
    </div>
  );
}
