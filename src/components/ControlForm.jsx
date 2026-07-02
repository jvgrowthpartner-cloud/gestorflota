import { useState } from 'react'
import { supabase } from '../lib/supabase'

const CONTROL_NAMES = { ITV: 'Inspección técnica', TAC: 'Tacógrafo', ACE: 'Aceite y filtros', REV: 'Revisión general' }

export default function ControlForm({ vehicles, control, onClose, onSaved }) {
  const isEdit = !!control
  const [form, setForm] = useState(control ? {
    vehicle_id: control.vehicle_id,
    type: control.type,
    name: control.name || '',
    due_date: control.due_date || '',
    alert_days: String(control.alert_days ?? 15),
    notes: control.notes || '',
  } : { vehicle_id: vehicles[0]?.id || '', type: 'ITV', name: 'Inspección técnica', due_date: '', alert_days: '15', notes: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function onTypeChange(t) { set('type', t); set('name', CONTROL_NAMES[t] || '') }

  async function save(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const veh = vehicles.find(v => v.id === form.vehicle_id)
    if (!veh) { setErr('Selecciona un vehículo.'); setSaving(false); return }
    const payload = {
      vehicle_id: form.vehicle_id,
      type: form.type,
      name: form.name,
      due_date: form.due_date || null,
      alert_days: parseInt(form.alert_days) || 15,
      notes: form.notes || null,
    }
    const { error } = isEdit
      ? await supabase.from('controls').update(payload).eq('id', control.id)
      : await supabase.from('controls').insert(payload)
    if (error) { setErr(error.message); setSaving(false); return }
    onSaved()
    onClose()
  }

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#46566B', marginBottom: 6 }
  const inputStyle = { width: '100%', background: '#F9FAFC', border: '1px solid #E5E9F0', borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#15202E', outline: 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(18,28,44,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 32 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: 480, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #EEF1F6' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#15202E' }}>{isEdit ? 'Editar vencimiento' : 'Nuevo vencimiento'}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E9F0', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#6C7A8D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Vehículo *</label>
            <select value={form.vehicle_id} onChange={e => set('vehicle_id', e.target.value)} style={inputStyle} required>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.model || v.type}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tipo de control *</label>
            <select value={form.type} onChange={e => onTypeChange(e.target.value)} style={inputStyle}>
              <option value="ITV">ITV — Inspección técnica</option>
              <option value="TAC">TAC — Tacógrafo</option>
              <option value="ACE">ACE — Aceite y filtros</option>
              <option value="REV">REV — Revisión / avería</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} placeholder="Nombre del control" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Fecha límite *</label>
              <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Avisar con (días)</label>
              <input type="number" value={form.alert_days} onChange={e => set('alert_days', e.target.value)} style={inputStyle} min={1} max={90} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notas</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)} style={inputStyle} placeholder="Observaciones…" />
          </div>
          {err && <div style={{ background: '#FBE7E3', color: '#B23A22', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ background: '#F1F4F8', color: '#46566B', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ background: '#2456C7', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? 'Guardando…' : (isEdit ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
