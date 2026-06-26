import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const wrap = { minHeight: '100vh', background: 'linear-gradient(150deg,#143656 0%,#0d2138 60%,#0a1626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
const card = { background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 20, padding: '36px 32px' }
const label = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: 7, letterSpacing: '.3px' }
const input = { width: '100%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none' }

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    setLoading(false)
    if (error) { setError('No se pudo enviar el email: ' + error.message); return }
    setSent(true)
  }

  return (
    <div style={wrap}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={card}>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-.3px' }}>Recuperar contraseña</h1>
          {sent ? (
            <>
              <p style={{ margin: '14px 0 20px', fontSize: 14, color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>
                Si <b style={{ color: '#fff' }}>{email}</b> tiene una cuenta, te hemos enviado un email con un enlace para poner una contraseña nueva. Revisa también la carpeta de spam.
              </p>
              <Link to="/login" style={{ color: '#7FA8F5', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Volver a Acceder</Link>
            </>
          ) : (
            <>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,.55)' }}>Te enviaremos un enlace a tu email para crear una nueva.</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={label}>EMAIL</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@empresa.com" style={input} />
                </div>
                {error && (
                  <div style={{ background: 'rgba(212,69,46,.2)', border: '1px solid rgba(212,69,46,.4)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F5A49A' }}>{error}</div>
                )}
                <button type="submit" disabled={loading} style={{ marginTop: 4, background: '#2456C7', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
                  {loading ? 'Enviando…' : 'Enviar enlace'}
                </button>
              </form>
              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
                <Link to="/login" style={{ color: '#7FA8F5', fontWeight: 600, textDecoration: 'none' }}>Volver a Acceder</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
