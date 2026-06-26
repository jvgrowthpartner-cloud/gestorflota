// Reproduce un aviso sonoro corto (dos tonos) usando Web Audio API.
// No necesita ningún archivo de audio. Si el navegador bloquea el sonido
// (autoplay), simplemente no suena y no rompe nada.
export function playAlertSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime
    const tones = [880, 1175] // La5 + Re6, tipo "ding-dong"
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.18
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.18)
    })
    setTimeout(() => { try { ctx.close() } catch (e) {} }, 900)
  } catch (e) {
    // Sonido bloqueado por el navegador: lo ignoramos, el aviso visual sigue ahí.
  }
}
