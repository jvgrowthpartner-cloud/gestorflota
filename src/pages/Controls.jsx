import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import ControlForm from '../components/ControlForm'
import { ControlTag, DayChip, StatusPill } from '../components/StatusBadge'
import { supabase } from '../lib/supabase'
import { daysUntil, formatDate } from '../lib/dayUtils'
import { useIsMobile } from '../lib/useIsMobile'

const actBtn = (bg, fg) => ({ background: bg, color: fg, border: 'none', borderRadius: 7, padding: '6px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' })
const GRID = '1.6fr 1.5fr 1.1fr 0.9fr 0.9fr 210px'

export default function Controls() {
  const [controls, setControls] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'add'
  const [editControl, setEditControl] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const isMobile = useIsMobile()

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

  async function deleteControl(c) {
    if (!confirm(`¿Borrar el vencimiento "${c.name}" de ${c.vehicles?.plate || 'este vehículo'}?`)) return
    await supabase.from('controls').delete().eq('id', c.id)
    load()
  }

  function renderActions(c) {
    return (
      <div style={{ display: 'flex', gap: 6, justifyContent: isMobile ? 'flex-start' : 'flex-end', flexWrap: 'wrap' }}>
        {!c.done && <button onClick={() => markDone(c.id)} title="Marcar como completado" style={actBtn('#E4F4EC', '#1A7A53')}>✓ Listo</button>}
        <button onClick={() => setEditControl(c)} title="Editar" style={actBtn('#E7EDFB', '#2456C7')}>Editar</button>
        <button onClick={() => deleteControl(c)} title="Borrar" style={actBtn('#FBE7E3', '#B23A22')}>Borrar</button>
      </div>
    )
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
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

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#8A98A8', fontSize: 14 }}>Cargando…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#8A98A8', fontSize: 14 }}>No hay controles en esta categoría.</div>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(c => (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #E9EDF3', borderRadius: 12, padding: 14, opacity: c.done ? .6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, fontWeight: 700, color: '#15202E' }}>{c.vehicles?.plate}</div>
                  {c.done ? <span style={{ fontSize: 12, color: '#1A7A53', fontWeight: 600 }}>✓ Hecho</span> : <StatusPill dueDate={c.due_date} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                  <ControlTag type={c.type} />
                  <span style={{ fontSize: 13, color: '#33425A' }}>{c.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#6C7A8D', marginBottom: 12 }}>
                  <span>Vence: {formatDate(c.due_date)}</span>
                  {!c.done && <DayChip dueDate={c.due_date} />}
                </div>
                {renderActions(c)}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E9EDF3', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 8, padding: '10px 20px', background: '#FAFBFD', borderBottom: '1px solid #EEF1F6' }}>
              {['Vehículo','Control','Fecha límite','Restantes','Estado',''].map((h, i) => (
                <span key={i} style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: .5, color: '#94A0B0', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {filtered.map(c => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 8, padding: '13px 20px', alignItems: 'center', borderBottom: '1px solid #F2F5F9', opacity: c.done ? .55 : 1 }}>
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
                {renderActions(c)}
              </div>
            ))}
          </div>
        )}
      </main>

      {(modal === 'add' || editControl) && (
        <ControlForm
          vehicles={vehicles}
          control={editControl}
          onClose={() => { setModal(null); setEditControl(null) }}
          onSaved={load}
        />
      )}
    </div>
  )
}
