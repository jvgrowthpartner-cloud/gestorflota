import { daysUntil, getStatus, statusColors, controlColors, formatDays } from '../lib/dayUtils'

export function StatusPill({ dueDate }) {
  const days = daysUntil(dueDate)
  const st = getStatus(days)
  const c = statusColors(st)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  )
}

export function DayChip({ dueDate }) {
  const days = daysUntil(dueDate)
  const st = getStatus(days)
  const c = statusColors(st)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 6, background: c.bg, color: c.fg, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: "'IBM Plex Mono',monospace" }}>
      {formatDays(days)}
    </span>
  )
}

export function ControlTag({ type }) {
  const c = controlColors(type)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 34, padding: '3px 7px', borderRadius: 6, background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.3px', flexShrink: 0 }}>
      {type}
    </span>
  )
}
