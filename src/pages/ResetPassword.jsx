import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const wrap = { minHeight: '100vh', background: 'linear-gradient(150deg,#143656 0%,#0d2138 60%,#0a1626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
const card = { background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 20, padding: '36px 32px' }
const label = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: 7, letterSpacing: '.3px' }
const input = { width: '100%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none' }

export default function ResetPassword() {
  const [ready, setReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Al llegar desde el email, Supabase crea una sesión temporal de recuperación.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setHasSession(true)
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasSession(true)
      setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== password2) { setError('Las dos contraseñas no coinciden.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError('No se pudo cambiar la contraseña: ' + error.message); return }
    setDone(true)
    await supabase.auth.signOut()
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div style={wrap}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={card}>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-.3px' }}>Nueva contraseña</h1>

          {done ? (
            <p style={{ margin: '14px 0 0', fontSize: 14, color: '#9FE3C0', lineHeight: 1.5 }}>✅ Contraseña actualizada. Te llevamos a la pantalla de acceso…</p>
          ) : !ready ? (
            <p style={{ margin: '14px 0 0', fontSize: 14, color: 'rgba(255,255,255,.6)' }}>Cargando…</p>
          ) : !hasSession ? (
            <>
              <p style={{ margin: '14px 0 20px', fontSize: 14, color: '#F5A49A', lineHeight: 1.5 }}>
                Este enlace no es válido o ha caducado. Pide uno nuevo desde "¿Olvidaste tu contraseña?".
              </p>
              <Link to="/forgot-password" style={{ color: '#7FA8F5', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Pedir un enlace nuevo</Link>
            </>
          ) : (
            <>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,.55)' }}>Escribe tu nueva contraseña.</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={label}>NUEVA CONTRASEÑA</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" style={input} />
                </div>
                <div>
                  <label style={label}>REPETIR CONTRASEÑA</label>
                  <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} required placeholder="••••••••" style={input} />
                </div>
                {error && (
                  <div style={{ background: 'rgba(212,69,46,.2)', border: '1px solid rgba(212,69,46,.4)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F5A49A' }}>{error}</div>
                )}
                <button type="submit" disabled={loading} style={{ marginTop: 4, background: '#2456C7', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
                  {loading ? 'Guardando…' : 'Guardar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
