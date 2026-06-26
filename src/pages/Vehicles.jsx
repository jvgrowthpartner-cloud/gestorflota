import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import ControlForm from '../components/ControlForm'
import { StatusPill, ControlTag, DayChip } from '../components/StatusBadge'
import { supabase } from '../lib/supabase'
import { daysUntil, getStatus, statusColors, formatDate } from '../lib/dayUtils'

const TYPES = ['Todos', 'Tractora', 'Semirremolque', 'Furgoneta', 'Turismo']

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [controls, setControls] = useState([])
  const [filter, setFilter] = useState('Todos')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'add'
  const [sel, setSel] = useState(null)
  const [editVehicle, setEditVehicle] = useState(null)

  async function load() {
    const [vRes, cRes] = await Promise.all([
      supabase.from('vehicles').select('*').order('created_at'),
      supabase.from('controls').select('*').eq('done', false),
    ])
    setVehicles(vRes.data || [])
    setControls(cRes.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function controlsFor(vehicleId) {
    return controls.filter(c => c.vehicle_id === vehicleId)
  }

  function worstStatus(vehicleId) {
    const cts = controlsFor(vehicleId)
    if (!cts.length) return 'unknown'
    const days = cts.map(c => daysUntil(c.due_date))
    const min = Math.min(...days.filter(d => d !== null))
    return getStatus(isFinite(min) ? min : null)
  }

  const filtered = vehicles.filter(v => {
    const okType = filter === 'Todos' || v.type === filter
    const okQ = query === '' || (v.plate + ' ' + (v.model || '')).toLowerCase().includes(query.toLowerCase())
    return okType && okQ
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F7FA' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#15202E', letterSpacing: '-.2px' }}>Vehículos</h1>
            <div style={{ color: '#6C7A8D', fontSize: 13, marginTop: 3 }}>{vehicles.length} unidades en flota</div>
          </div>
          <button onClick={() => setModal('add')} style={{ background: '#2456C7', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Nuevo vehículo</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <span key={t} onClick={() => setFilter(t)} style={{ background: filter === t ? '#2456C7' : '#fff', color: filter === t ? '#fff' : '#46566B', fontSize: 12.5, fontWeight: filter === t ? 600 : 500, padding: '7px 14px', borderRadius: 8, border: `1px solid ${filter === t ? '#2456C7' : '#E5E9F0'}`, cursor: 'pointer' }}>
                {t}
              </span>
            ))}
          </div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por matrícula o modelo…"
            style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 9, padding: '9px 13px', fontSize: 13, color: '#33425A', width: 260, outline: 'none' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#8A98A8' }}>Cargando…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 20 }}>
            {filtered.map(v => {
              const cts = controlsFor(v.id)
              const ws = worstStatus(v.id)
              const wc = statusColors(ws)
              return (
                <div key={v.id} style={{ background: '#fff', border: '1px solid #E9EDF3', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setSel(v)}>
                  <div style={{ height: 4, background: wc.dot }} />
                  <div style={{ padding: '15px 17px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 700, color: '#15202E' }}>{v.plate}</div>
                        <div style={{ fontSize: 12, color: '#8A98A8', marginTop: 2 }}>{v.model || '—'}</div>
                      </div>
                      <span style={{ fontSize: 10.5, color: '#5A6678', background: '#EEF1F6', padding: '3px 8px', borderRadius: 5, fontWeight: 600 }}>{v.type}</span>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: wc.bg, color: wc.fg, fontSize: 12, fontWeight: 600 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: wc.dot }} />{wc.label}
                      </span>
                    </div>
                    {cts.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14, paddingTop: 13, borderTop: '1px solid #F2F5F9' }}>
                        {cts.slice(0, 3).map(c => (
                          <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <ControlTag type={c.type} />
                              <span style={{ fontSize: 13, color: '#33425A' }}>{c.name}</span>
                            </div>
                            <DayChip dueDate={c.due_date} />
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 14, paddingTop: 12, borderTop: '1px solid #F2F5F9' }}>
                      <span style={{ fontSize: 13, color: '#2456C7', fontWeight: 600 }}>Ver ficha →</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A98A8', fontSize: 14 }}>No hay vehículos que coincidan con la búsqueda.</div>
        )}
      </main>

      {sel && <VehicleModal vehicle={sel} controls={controlsFor(sel.id)} onClose={() => setSel(null)} onRefresh={load} onEdit={v => { setSel(null); setEditVehicle(v) }} />}
      {(modal === 'add' || editVehicle) && <VehicleForm vehicle={editVehicle} onClose={() => { setModal(null); setEditVehicle(null) }} onSaved={load} />}
    </div>
  )
}

function VehicleModal({ vehicle: v, controls, onClose, onRefresh, onEdit }) {
  const [docUrls, setDocUrls] = useState({})
  const [addingControl, setAddingControl] = useState(false)

  useEffect(() => {
    const paths = { photo: v.photo_url, ficha: v.ficha_url, permiso: v.permiso_url }
    const entries = Object.entries(paths).filter(([, p]) => p)
    if (!entries.length) return
    let active = true
    Promise.all(entries.map(([k, p]) =>
      supabase.storage.from('vehiculos').createSignedUrl(p, 3600).then(r => [k, r.data?.signedUrl])
    )).then(res => { if (active) setDocUrls(Object.fromEntries(res)) })
    return () => { active = false }
  }, [v.id])

  async function handleDelete() {
    if (!confirm(`¿Eliminar el vehículo ${v.plate}? Se borrarán también sus controles.`)) return
    await supabase.from('vehicles').delete().eq('id', v.id)
    onClose()
    onRefresh()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(18,28,44,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 32 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: 820, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #EEF1F6', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 700, color: '#15202E' }}>{v.plate}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <span style={{ fontSize: 13, color: '#8A98A8' }}>{v.model || '—'}</span>
              <span style={{ fontSize: 10.5, color: '#5A6678', background: '#EEF1F6', padding: '2px 8px', borderRadius: 5, fontWeight: 600 }}>{v.type}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onEdit(v)} style={{ background: '#E7EDFB', color: '#2456C7', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Editar</button>
            <button onClick={handleDelete} style={{ background: '#FBE7E3', color: '#B23A22', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E5E9F0', background: '#fff', cursor: 'pointer', fontSize: 18, color: '#6C7A8D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>
        </div>

        <div className="modal-2col" style={{ padding: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: '#94A0B0', textTransform: 'uppercase', marginBottom: 12 }}>Datos del vehículo</div>
            <div style={{ background: '#FAFBFD', border: '1px solid #EEF1F6', borderRadius: 12, padding: '4px 16px' }}>
              {[['Tipo', v.type], ['Modelo', v.model || '—'], ['Año', v.year || '—'], ['Kilómetros', v.km ? v.km.toLocaleString('es-ES') + ' km' : '—']].map(([k, val]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F2F5F9' }}>
                  <span style={{ fontSize: 13, color: '#8A98A8' }}>{k}</span>
                  <span style={{ fontSize: 13, color: '#1E2C3D', fontWeight: 600 }}>{val}</span>
                </div>
              ))}
              {v.notes && (
                <div style={{ padding: '10px 0' }}>
                  <span style={{ fontSize: 13, color: '#8A98A8' }}>Notas</span>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#33425A' }}>{v.notes}</p>
                </div>
              )}
            </div>

            {(v.photo_url || v.ficha_url || v.permiso_url) && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: '#94A0B0', textTransform: 'uppercase', marginBottom: 10 }}>Documentos</div>
                {v.photo_url && (
                  docUrls.photo
                    ? <a href={docUrls.photo} target="_blank" rel="noreferrer"><img src={docUrls.photo} alt="Foto del vehículo" style={{ width: '100%', maxHeight: 190, objectFit: 'cover', borderRadius: 10, border: '1px solid #EEF1F6', display: 'block', marginBottom: 10 }} /></a>
                    : <div style={{ fontSize: 13, color: '#9AA6B6', marginBottom: 10 }}>Cargando foto…</div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {v.ficha_url && <DocLink label="📄 Ficha técnica" url={docUrls.ficha} />}
                  {v.permiso_url && <DocLink label="📄 Permiso de circulación" url={docUrls.permiso} />}
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: '#94A0B0', textTransform: 'uppercase' }}>Controles y vencimientos</div>
              <button onClick={() => setAddingControl(true)} style={{ background: '#E7EDFB', color: '#2456C7', border: 'none', borderRadius: 7, padding: '6px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Añadir ITV / tacógrafo…</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {controls.length === 0 && <p style={{ margin: 0, fontSize: 13, color: '#8A98A8' }}>Sin controles registrados. Pulsa "+ Añadir" para poner la fecha de la ITV, el tacógrafo, etc.</p>}
              {controls.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #EEF1F6', borderRadius: 10, padding: '11px 13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ControlTag type={c.type} />
                    <div>
                      <div style={{ fontSize: 13, color: '#33425A', fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, color: '#9AA6B6', marginTop: 1 }}>{formatDate(c.due_date)}</div>
                    </div>
                  </div>
                  <StatusPill dueDate={c.due_date} />
                </div>
              ))}
            </div>
          </div>

          {addingControl && (
            <ControlForm
              vehicles={[v]}
              onClose={() => setAddingControl(false)}
              onSaved={() => { setAddingControl(false); onRefresh() }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function VehicleForm({ vehicle, onClose, onSaved }) {
  const isEdit = !!vehicle
  const [form, setForm] = useState({
    plate: vehicle?.plate || '',
    model: vehicle?.model || '',
    type: vehicle?.type || 'Tractora',
    year: vehicle?.year || '',
    km: vehicle?.km || '',
    notes: vehicle?.notes || '',
  })
  const [files, setFiles] = useState({ photo: null, ficha: null, permiso: null })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const payload = {
      plate: form.plate.trim().toUpperCase(),
      model: form.model || null,
      type: form.type,
      year: form.year ? parseInt(form.year) : null,
      km: form.km ? parseInt(form.km) : 0,
      notes: form.notes || null,
    }
    // 1. Guardar el vehículo (crear o actualizar) y recuperar id + tenant_id
    const q = isEdit
      ? supabase.from('vehicles').update(payload).eq('id', vehicle.id).select().single()
      : supabase.from('vehicles').insert(payload).select().single()
    const { data: row, error } = await q
    if (error) { setErr(error.message); setSaving(false); return }

    // 2. Subir los archivos seleccionados y guardar sus rutas
    const updates = {}
    for (const key of ['photo', 'ficha', 'permiso']) {
      const file = files[key]
      if (!file) continue
      const ext = (file.name.split('.').pop() || 'dat').toLowerCase()
      const path = `${row.tenant_id}/${row.id}/${key}_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('vehiculos').upload(path, file, { upsert: true })
      if (upErr) { setErr('El vehículo se guardó, pero falló la subida de un archivo: ' + upErr.message); setSaving(false); return }
      updates[`${key}_url`] = path
    }
    if (Object.keys(updates).length) {
      await supabase.from('vehicles').update(updates).eq('id', row.id)
    }

    onSaved()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(18,28,44,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 32 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: 480, maxWidth: '100%', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #EEF1F6' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#15202E' }}>{isEdit ? 'Editar vehículo' : 'Nuevo vehículo'}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E9F0', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#6C7A8D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Matrícula *" value={form.plate} onChange={v => set('plate', v)} placeholder="Ej: 4521 KLM" required />
          <Field label="Modelo" value={form.model} onChange={v => set('model', v)} placeholder="Ej: MAN TGX 18.510" />
          <div>
            <label style={labelStyle}>Tipo *</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
              {['Tractora','Semirremolque','Furgoneta','Turismo'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Año" value={form.year} onChange={v => set('year', v)} placeholder="2021" type="number" />
            <Field label="Kilómetros" value={form.km} onChange={v => set('km', v)} placeholder="0" type="number" />
          </div>
          <Field label="Notas" value={form.notes} onChange={v => set('notes', v)} placeholder="Observaciones…" />

          <div style={{ borderTop: '1px solid #EEF1F6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .5, color: '#94A0B0', textTransform: 'uppercase' }}>Documentos (opcional)</div>
            <FileField label="Foto del vehículo" accept="image/*" existing={isEdit && !!vehicle.photo_url} onPick={f => setFiles(s => ({ ...s, photo: f }))} />
            <FileField label="Ficha técnica" accept="image/*,application/pdf" existing={isEdit && !!vehicle.ficha_url} onPick={f => setFiles(s => ({ ...s, ficha: f }))} hint="Foto o PDF" />
            <FileField label="Permiso de circulación" accept="image/*,application/pdf" existing={isEdit && !!vehicle.permiso_url} onPick={f => setFiles(s => ({ ...s, permiso: f }))} hint="Foto o PDF" />
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

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#46566B', marginBottom: 6, letterSpacing: '.2px' }
const inputStyle = { width: '100%', background: '#F9FAFC', border: '1px solid #E5E9F0', borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#15202E', outline: 'none' }

function Field({ label, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        style={inputStyle} />
    </div>
  )
}

function FileField({ label, accept, existing, onPick, hint }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {existing && <div style={{ fontSize: 11.5, color: '#1A7A53', marginBottom: 6 }}>✓ Ya hay un archivo subido — elige otro para reemplazarlo</div>}
      <input type="file" accept={accept} onChange={e => onPick(e.target.files?.[0] || null)} style={{ width: '100%', fontSize: 12.5, color: '#46566B' }} />
      {hint && <div style={{ fontSize: 11, color: '#9AA6B6', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

function DocLink({ label, url }) {
  if (!url) return <span style={{ fontSize: 13, color: '#9AA6B6' }}>Cargando…</span>
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#2456C7', fontWeight: 600, textDecoration: 'none', background: '#E7EDFB', padding: '9px 13px', borderRadius: 8 }}>{label}</a>
  )
}
