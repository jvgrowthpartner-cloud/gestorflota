import { useState, useEffect } from 'react'

// Detecta si la pantalla es de móvil (estrecha) y se actualiza al girar/redimensionar.
export function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' && window.innerWidth < bp)
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < bp)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [bp])
  return mobile
}
