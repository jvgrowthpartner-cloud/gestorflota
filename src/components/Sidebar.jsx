import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

const NAV = [
  { label: 'Panel', path: '/' },
  { label: 'Vehículos', path: '/vehicles' },
  { label: 'Vencimientos', path: '/controls' },
  { label: 'Taller', path: '/workshop' },
]

// Detecta si la pantalla es de móvil (estrecha) y se actualiza al girar/redimensionar.
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' && window.innerWidth < bp)
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < bp)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [bp])
  return mobile
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  // En móvil, bloquea el scroll del fondo mientras el menú está abierto.
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isMobile, open])

  const initials = (user?.email || 'U').slice(0, 2).toUpperCase()

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function go(path) {
    navigate(path)
    setOpen(false) // en móvil, cerrar el menú al elegir opción
  }

  const asideStyle = isMobile
    ? {
        position: 'fixed', top: 0, left: 0, height: '100vh', width: 236, zIndex: 300,
        background: '#122B47', display: 'flex', flexDirection: 'column', padding: '18px 0',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s ease', boxShadow: open ? '2px 0 18px rgba(0,0,0,.35)' : 'none',
      }
    : { width: 220, flexShrink: 0, background: '#122B47', display: 'flex', flexDirection: 'column', padding: '20px 0', minHeight: '100vh' }

  const panel = (
    <aside style={asideStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 20px 22px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#2456C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: '#fff', fontSize: 14 }}>GF</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, lineHeight: 1.1 }}>GestorFlota</div>
          <div style={{ color: '#7E93AE', fontSize: 11, marginTop: 2 }}>Control de flota</div>
        </div>
        {isMobile && (
          <button onClick={() => setOpen(false)} aria-label="Cerrar menú" style={{ background: 'transparent', border: 'none', color: '#7E93AE', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
        )}
      </div>

      <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        <div style={{ color: '#5E7390', fontSize: 10, fontWeight: 600, letterSpacing: 1, padding: '4px 12px 6px', textTransform: 'uppercase' }}>GENERAL</div>
        {NAV.map(item => {
          const active = location.pathname === item.path
          return (
            <div
              key={item.path}
              onClick={() => go(item.path)}
              style={{
                display: 'flex', alignItems: 'center',
                padding: active ? '11px 12px 11px 9px' : '11px 15px',
                borderLeft: active ? '3px solid #4F8BFF' : '3px solid transparent',
                borderRadius: active ? '0 8px 8px 0' : 8,
                background: active ? 'rgba(255,255,255,.12)' : 'transparent',
                color: active ? '#fff' : '#9FB1C8',
                fontSize: 14, fontWeight: active ? 600 : 500,
                cursor: 'pointer', transition: 'background .15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              {item.label}
            </div>
          )
        })}
      </div>

      <div style={{ margin: '0 14px', padding: '14px 4px 0', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2456C7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>{user?.email?.split('@')[0]}</div>
            <div style={{ color: '#7E93AE', fontSize: 10 }}>Admin</div>
          </div>
        </div>
        <button
          onClick={signOut}
          title="Cerrar sesión"
          style={{ background: 'transparent', border: 'none', color: '#5E7390', cursor: 'pointer', fontSize: 16, padding: 4, borderRadius: 6, lineHeight: 1 }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#5E7390'}
        >⏻</button>
      </div>
    </aside>
  )

  // Ordenador: menú fijo de siempre.
  if (!isMobile) return panel

  // Móvil: barra superior con botón ☰ + menú deslizante + fondo oscuro.
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 52, background: '#122B47', zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px' }}>
        <button onClick={() => setOpen(true)} aria-label="Abrir menú" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: 4 }}>☰</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#2456C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: '#fff', fontSize: 12 }}>GF</div>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>GestorFlota</span>
        </div>
      </div>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200 }} />}
      {panel}
    </>
  )
}
