import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos.')
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(150deg,#143656 0%,#0d2138 60%,#0a1626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2456C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: '#fff', fontSize: 18 }}>GF</div>
          <span style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-.3px' }}>GestorFlota</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 20, padding: '36px 32px' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-.3px' }}>Acceder</h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,.55)' }}>Introduce tus credenciales para entrar.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: 7, letterSpacing: '.3px' }}>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@empresa.com"
                style={{ width: '100%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: 7, letterSpacing: '.3px' }}>CONTRASEÑA</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(212,69,46,.2)', border: '1px solid rgba(212,69,46,.4)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F5A49A' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 8, background: '#2456C7', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, transition: 'opacity .15s' }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,.55)', fontSize: 13, textDecoration: 'none' }}>¿Olvidaste tu contraseña?</Link>
          </div>
          <div style={{ marginTop: 14, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.1)', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
            ¿Tu empresa aún no tiene cuenta? <Link to="/register" style={{ color: '#7FA8F5', fontWeight: 600, textDecoration: 'none' }}>Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
