export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr)
  due.setHours(0, 0, 0, 0)
  return Math.round((due - today) / 86400000)
}

export function getStatus(days) {
  if (days === null) return 'unknown'
  if (days < 0) return 'expired'
  if (days <= 15) return 'warning'
  return 'ok'
}

export function statusColors(status) {
  const map = {
    expired: { bg: '#FBE7E3', fg: '#B23A22', dot: '#D4452E', border: '#D4452E', label: 'Vencido' },
    warning: { bg: '#FBF0D8', fg: '#8A5B10', dot: '#E0991C', border: '#E0991C', label: 'Próximo' },
    ok:      { bg: '#E4F4EC', fg: '#1A7A53', dot: '#1F9D6B', border: '#1F9D6B', label: 'Al día' },
    unknown: { bg: '#EEF1F6', fg: '#5A6678', dot: '#C3CCD8', border: '#C3CCD8', label: 'Sin fecha' },
  }
  return map[status] || map.unknown
}

export function controlColors(type) {
  const map = {
    ITV: { bg: '#E7EDFB', fg: '#2452B8' },
    TAC: { bg: '#ECE7FA', fg: '#5B43B8' },
    ACE: { bg: '#F6ECDA', fg: '#9B6516' },
    REV: { bg: '#DEF0F0', fg: '#15787D' },
  }
  return map[type] || map.ITV
}

export function formatDays(days) {
  if (days === null) return '—'
  if (days < 0) return `Hace ${Math.abs(days)} días`
  if (days === 0) return 'Hoy'
  return `En ${days} días`
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
