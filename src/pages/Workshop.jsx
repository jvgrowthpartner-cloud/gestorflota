import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/dayUtils'

export default function Workshop() {
  const [events, setEvents] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  async function load() {
    const [eRes, vRes] = await Promise.all([
      supabase.from('workshop_events').select('*, vehicles(plate, model, type)').order('event_date', { ascending: false }),
      supabase.from('vehicles').select('id, plate, model').order('plate'),
    ])
    setEvents(eRes.data || [])
    setVehicles(vRes.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F7FA' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#15202E', letterSpacing: '-.2px' }}>Taller</h1>
            <div style={{ color: '#6C7A8D', fontSize: 13, marginTop: 3 }}>Historial de revisiones y reparaciones</div>
          </div>
          <button onClick={() => setModal(true)} style={{ background: '#2456C7', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Nueva intervención</button>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E9EDF3', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr', gap: 8, padding: '10px 20px', background: '#FAFBFD', borderBottom: '1px solid #EEF1F6' }}>
            {['Vehículo','Descripción','Taller','Coste','Fecha'].map((h, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: .5, color: '#94A0B0', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#8A98A8' }}>Cargando…</div>
          ) : events.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#8A98A8', fontSize: 14 }}>No hay intervenciones registradas todavía.</div>
          ) : events.map(ev => (
            <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr', gap: 8, padding: '13px 20px', alignItems: 'center', borderBottom: '1px solid #F2F5F9' }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13.5, fontWeight: 700, color: '#15202E' }}>{ev.vehicles?.plate}</div>
                <div style={{ fontSize: 11.5, color: '#8A98A8', marginTop: 2 }}>{ev.vehicles?.model}</div>
              </div>
              <span style={{ fontSize: 13, color: '#33425A' }}>{ev.description}</span>
              <span style={{ fontSize: 13, color: '#46566B' }}>{ev.workshop || '—'}</span>
              <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", color: ev.cost_eur ? '#15202E' : '#C3CCD8', fontWeight: ev.cost_eur ? 600 : 400 }}>
                {ev.cost_eur ? ev.cost_eur.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '—'}
              </span>
              <span style={{ fontSize: 13, color: '#46566B' }}>{formatDate(ev.event_date)}</span>
            </div>
          ))}
        </div>
      </main>

      {modal && <WorkshopForm vehicles={vehicles} onClose={() => setModal(false)} onSaved={load} />}
    </div>
  )
}

function WorkshopForm({ vehicles, onClose, onSaved }) {
  const [form, setForm] = useState({ vehicle_id: vehicles[0]?.id || '', description: '', workshop: '', cost_eur: '', event_date: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const { error } = await supabase.from('workshop_events').insert({
      vehicle_id: form.vehicle_id,
      description: form.description,
      workshop: form.workshop || null,
      cost_eur: form.cost_eur ? parseFloat(form.cost_eur) : null,
      event_date: form.event_date,
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
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#15202E' }}>Nueva intervención</h2>
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
            <label style={labelStyle}>Descripción *</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} style={inputStyle} placeholder="Ej: Cambio de aceite y filtros" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Taller</label>
              <input value={form.workshop} onChange={e => set('workshop', e.target.value)} style={inputStyle} placeholder="Nombre del taller" />
            </div>
            <div>
              <label style={labelStyle}>Coste (€)</label>
              <input type="number" value={form.cost_eur} onChange={e => set('cost_eur', e.target.value)} style={inputStyle} placeholder="0.00" step="0.01" min="0" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Fecha *</label>
            <input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} required style={inputStyle} />
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
