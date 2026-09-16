// ─── Som de Notificação do Estúdio (Web Audio API) ───
// Sintetizador harmônico sem dependência de arquivos externos
export function playNotificationSound() {
  if (typeof window === "undefined") return

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // Acorde harmônico elegante de estúdio (A5 -> D6 -> A6 chime)
    const chords = [
      { freq: 880.0, time: 0.0, duration: 0.45, gain: 0.12 },
      { freq: 1174.66, time: 0.08, duration: 0.65, gain: 0.15 },
      { freq: 1760.0, time: 0.16, duration: 0.9, gain: 0.14 },
    ]

    chords.forEach(({ freq, time, duration, gain: targetGain }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, now + time)

      gain.gain.setValueAtTime(0, now + time)
      gain.gain.linearRampToValueAtTime(targetGain, now + time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0008, now + time + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + time)
      osc.stop(now + time + duration + 0.05)
    })
  } catch (err) {
    console.warn("Falha ao emitir som de notificação:", err)
  }
}
