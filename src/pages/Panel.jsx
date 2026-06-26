import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { StatusPill, DayChip, ControlTag } from '../components/StatusBadge'
import { supabase } from '../lib/supabase'
import { daysUntil, getStatus, formatDate } from '../lib/dayUtils'
import { playAlertSound } from '../lib/notify'

export default function Panel() {
  const [controls, setControls] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      supabase.from('vehicles').select('*').order('created_at'),
      supabase.from('controls').select('*, vehicles(plate, model, type)').order('due_date').eq('done', false),
    ]).then(([vRes, cRes]) => {
      setVehicles(vRes.data || [])
      setControls(cRes.data || [])
      setLoading(false)
    })
  }, [])

  const enriched = controls.map(c => ({ ...c, days: daysUntil(c.due_date), status: getStatus(daysUntil(c.due_date)) }))
  const expired = enriched.filter(c => c.status === 'expired').length
  const warning = enriched.filter(c => c.status === 'warning').length
  const ok = enriched.filter(c => c.status === 'ok').length
  const upcoming = enriched.sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999)).slice(0, 10)

  const alertCount = expired + warning

  // Aviso sonoro una sola vez, al cargar el panel, si hay vencimientos a ≤15 días o ya vencidos.
  useEffect(() => {
    if (!loading && alertCount > 0) playAlertSound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F7FA' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#15202E', letterSpacing: '-.2px' }}>Panel de flota</h1>
            <div style={{ color: '#6C7A8D', fontSize: 13, marginTop: 3 }}>Resumen de vencimientos · {today}</div>
          </div>
          <button onClick={() => navigate('/vehicles')} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#2456C7', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 15px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Nuevo vehículo
          </button>
        </div>

        {/* Aviso de vencimientos */}
        {!loading && alertCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FBF0D8', border: '1px solid #E9D199', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>🔔</span>
            <div style={{ flex: 1, fontSize: 14, color: '#7A5410' }}>
              <b>Atención:</b> tienes{' '}
              {expired > 0 && <b>{expired} vencimiento{expired !== 1 ? 's' : ''} caducado{expired !== 1 ? 's' : ''}</b>}
              {expired > 0 && warning > 0 && ' y '}
              {warning > 0 && <b>{warning} próximo{warning !== 1 ? 's' : ''} (≤15 días)</b>}
              . Revisa la lista de abajo.
            </div>
            <button onClick={() => navigate('/controls')} style={{ background: '#E0991C', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Ver vencimientos</button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Vehículos" value={loading ? '…' : vehicles.length} sub="en flota" dotColor="#C3CCD8" bg="#fff" fg="#15202E" />
          <StatCard label="Vencidos" value={loading ? '…' : expired} sub="Requieren acción inmediata" dotColor="#D4452E" bg="#FCF1EF" fg="#B23A22" border="#F3DAD4" />
          <StatCard label="Próximos 15 d" value={loading ? '…' : warning} sub="Planificar revisión" dotColor="#E0991C" bg="#FBF6E9" fg="#8A5B10" border="#EFE3C4" />
          <StatCard label="Al día" value={loading ? '…' : ok} sub="Sin incidencias" dotColor="#1F9D6B" bg="#EDF7F1" fg="#1A7A53" border="#CDE9DA" />
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #E9EDF3', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EEF1F6' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#15202E' }}>Próximos vencimientos</h2>
              <div style={{ color: '#8A98A8', fontSize: 12, marginTop: 2 }}>Ordenados por urgencia</div>
            </div>
            <button onClick={() => navigate('/controls')} style={{ fontSize: 13, color: '#2456C7', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Ver todos →</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.6fr 1.1fr 1fr 1fr', gap: 8, padding: '10px 20px', background: '#FAFBFD', borderBottom: '1px solid #EEF1F6' }}>
            {['Vehículo','Control','Fecha límite','Restantes','Estado'].map(h => (
              <span key={h} style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: .5, color: '#94A0B0', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#8A98A8', fontSize: 14 }}>Cargando…</div>
          ) : upcoming.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#8A98A8', fontSize: 14 }}>No hay vencimientos pendientes.</div>
          ) : upcoming.map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.6fr 1.1fr 1fr 1fr', gap: 8, padding: '13px 20px', alignItems: 'center', borderBottom: '1px solid #F2F5F9' }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13.5, fontWeight: 700, color: '#15202E' }}>{c.vehicles?.plate}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <span style={{ fontSize: 11.5, color: '#8A98A8' }}>{c.vehicles?.model}</span>
                  <span style={{ fontSize: 10, color: '#5A6678', background: '#EEF1F6', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{c.vehicles?.type}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <ControlTag type={c.type} />
                <span style={{ fontSize: 13, color: '#33425A' }}>{c.name}</span>
              </div>
              <span style={{ fontSize: 13, color: '#46566B' }}>{formatDate(c.due_date)}</span>
              <DayChip dueDate={c.due_date} />
              <StatusPill dueDate={c.due_date} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, sub, dotColor, bg, fg, border }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border || '#E9EDF3'}`, borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: fg, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .4 }}>{label}</span>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, display: 'block' }} />
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: fg, marginTop: 8, fontFamily: "'IBM Plex Mono',monospace" }}>{value}</div>
      <div style={{ color: fg, opacity: .65, fontSize: 11.5, marginTop: 4 }}>{sub}</div>
    </div>
  )
}
