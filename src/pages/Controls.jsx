import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { ControlTag, DayChip, StatusPill } from '../components/StatusBadge'
import { supabase } from '../lib/supabase'
import { daysUntil, formatDate } from '../lib/dayUtils'

const CONTROL_NAMES = { ITV: 'Inspección técnica', TAC: 'Tacógrafo', ACE: 'Aceite y filtros', REV: 'Revisión general' }

export default function Controls() {
  const [controls, setControls] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'add' or control obj
  const [filterStatus, setFilterStatus] = useState('all')

  async function load() {
    const [cRes, vRes] = await Promise.all([
      supabase.from('controls').select('*, vehicles(plate, model, type)').order('due_date'),
      supabase.from('vehicles').select('id, plate, model').order('plate'),
    ])
    setControls(cRes.data || [])
    setVehicles(vRes.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function markDone(id) {
    await supabase.from('controls').update({ done: true, done_at: new Date().toISOString() }).eq('id', id)
    load()
  }

  const enriched = controls.map(c => ({ ...c, days: daysUntil(c.due_date) }))
  const pending = enriched.filter(c => !c.done)
  const done = enriched.filter(c => c.done)

  const filtered = (filterStatus === 'done' ? done : pending).filter(c => {
    if (filterStatus === 'expired') return c.days !== null && c.days < 0
    if (filterStatus === 'warning') return c.days !== null && c.days >= 0 && c.days <= 15
    if (filterStatus === 'ok') return c.days === null || c.days > 15
    return true
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F7FA' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#15202E', letterSpacing: '-.2px' }}>Vencimientos</h1>
            <div style={{ color: '#6C7A8D', fontSize: 13, marginTop: 3 }}>Todos los controles de tu flota</div>
          </div>
          <button onClick={() => setModal('add')} style={{ background: '#2456C7', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Nuevo control</button>
        </div>

        <div style={{ display: 'flex', gap: 9, marginBottom: 20, flexWrap: 'wrap' }}>
          {[['all','Todos'],['expired','Vencidos'],['warning','Próximos 15 d'],['ok','Al día'],['done','Completados']].map(([k, l]) => (
            <span key={k} onClick={() => setFilterStatus(k)} style={{ fontSize: 12.5, fontWeight: filterStatus === k ? 600 : 500, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', background: filterStatus === k ? '#2456C7' : '#fff', color: filterStatus === k ? '#fff' : '#46566B', border: `1px solid ${filterStatus === k ? '#2456C7' : '#E5E9F0'}` }}>
              {l}
            </span>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #E9EDF3', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.6fr 1.1fr 1fr 1fr 80px', gap: 8, padding: '10px 20px', background: '#FAFBFD', borderBottom: '1px solid #EEF1F6' }}>
            {['Vehículo','Control','Fecha límite','Restantes','Estado',''].map((h, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: .5, color: '#94A0B0', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#8A98A8', fontSize: 14 }}>Cargando…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#8A98A8', fontSize: 14 }}>No hay controles en esta categoría.</div>
          ) : filtered.map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.6fr 1.1fr 1fr 1fr 80px', gap: 8, padding: '13px 20px', alignItems: 'center', borderBottom: '1px solid #F2F5F9', opacity: c.done ? .55 : 1 }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13.5, fontWeight: 700, color: '#15202E' }}>{c.vehicles?.plate}</div>
                <div style={{ fontSize: 11.5, color: '#8A98A8', marginTop: 2 }}>{c.vehicles?.model}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <ControlTag type={c.type} />
                <span style={{ fontSize: 13, color: '#33425A' }}>{c.name}</span>
              </div>
              <span style={{ fontSize: 13, color: '#46566B' }}>{formatDate(c.due_date)}</span>
              <DayChip dueDate={c.done ? null : c.due_date} />
              {c.done
                ? <span style={{ fontSize: 12, color: '#1A7A53', fontWeight: 600 }}>✓ Hecho</span>
                : <StatusPill dueDate={c.due_date} />
              }
              {!c.done && (
                <button onClick={() => markDone(c.id)} title="Marcar como completado" style={{ background: '#E4F4EC', color: '#1A7A53', border: 'none', borderRadius: 7, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  ✓ Listo
                </button>
              )}
              {c.done && <span />}
            </div>
          ))}
        </div>
      </main>

      {modal === 'add' && <ControlForm vehicles={vehicles} onClose={() => setModal(null)} onSaved={load} />}
    </div>
  )
}

function ControlForm({ vehicles, onClose, onSaved }) {
  const [form, setForm] = useState({ vehicle_id: vehicles[0]?.id || '', type: 'ITV', name: 'Inspección técnica', due_date: '', alert_days: '15', notes: '' })
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
    const { error } = await supabase.from('controls').insert({
      vehicle_id: form.vehicle_id,
      type: form.type,
      name: form.name,
      due_date: form.due_date || null,
      alert_days: parseInt(form.alert_days) || 15,
      notes: form.notes || null,
    })
    if (error) { setErr(error.message); setSaving(false); return }
    onSaved()
    onClose()
  }

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#46566B', marginBottom: 6 }
  const inputStyle = { width: '100%', background: '#F9FAFC', border: '1px solid #E5E9F0', borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#15202E', outline: 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(18,28,44,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 32 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: 480, maxWidth: '100%', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #EEF1F6' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#15202E' }}>Nuevo control</h2>
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
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
