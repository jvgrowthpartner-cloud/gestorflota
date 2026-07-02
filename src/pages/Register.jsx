import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const wrap = { minHeight: '100vh', background: 'linear-gradient(150deg,#143656 0%,#0d2138 60%,#0a1626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
const card = { background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 20, padding: '36px 32px' }
const label = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: 7, letterSpacing: '.3px' }
const input = { width: '100%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none' }

export default function Register() {
  const [company, setCompany] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!company.trim()) { setError('Pon el nombre de tu empresa.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== password2) { setError('Las dos contraseñas no coinciden.'); return }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { company_name: company.trim(), full_name: fullName.trim() } },
    })
    setLoading(false)

    if (error) {
      const msg = String(error.message || '').toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered')) setError('Ese email ya tiene una cuenta. Prueba a acceder o a recuperar tu contraseña.')
      else if (msg.includes('password')) setError('La contraseña no es válida (mínimo 6 caracteres).')
      else if (msg.includes('email')) setError('Revisa que el email esté bien escrito.')
      else setError('No se pudo crear la cuenta. Inténtalo de nuevo en un momento.')
      return
    }
    // Si el proyecto exige confirmar email, no habrá sesión todavía.
    if (data.session) {
      navigate('/')
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div style={wrap}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={card}>
            <h1 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: '#fff' }}>¡Casi listo! 📧</h1>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>
              Te hemos enviado un email a <b style={{ color: '#fff' }}>{email}</b> para confirmar tu cuenta. Ábrelo y pulsa el enlace; después ya podrás entrar.
            </p>
            <Link to="/login" style={{ color: '#7FA8F5', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Ir a Acceder</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36, justifyContent: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2456C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: '#fff', fontSize: 18 }}>GF</div>
          <span style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-.3px' }}>GestorFlota</span>
        </div>

        <div style={card}>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-.3px' }}>Crear cuenta</h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,.55)' }}>Registra tu empresa para empezar.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <label style={label}>NOMBRE DE LA EMPRESA</label>
              <input value={company} onChange={e => setCompany(e.target.value)} required placeholder="Transportes Pérez S.L." style={input} />
            </div>
            <div>
              <label style={label}>TU NOMBRE <span style={{ opacity: .5, fontWeight: 400 }}>(opcional)</span></label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Juan Pérez" style={input} />
            </div>
            <div>
              <label style={label}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@empresa.com" style={input} />
            </div>
            <div>
              <label style={label}>CONTRASEÑA</label>
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
              {loading ? 'Creando…' : 'Crear cuenta'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#7FA8F5', fontWeight: 600, textDecoration: 'none' }}>Acceder</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
