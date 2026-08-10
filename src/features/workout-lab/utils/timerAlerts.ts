interface AudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext
}

let audioContext: AudioContext | null = null

export function primeTimerAudio(): void {
  const AudioContextConstructor =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext
  if (!AudioContextConstructor) return

  audioContext ??= new AudioContextConstructor()
  if (audioContext.state === 'suspended') void audioContext.resume()
}

export function playTimerCompleteAlert(): void {
  if (audioContext) {
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.35, audioContext.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.55)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.6)
  }

  if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
}
