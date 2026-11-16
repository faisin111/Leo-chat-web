// Web Audio API Ringtone & Audio Tone Generator
// Zero external audio asset dependencies — reliable across all browsers

class CallSoundManager {
  private ctx: AudioContext | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRinging = false;

  private getAudioContext(): AudioContext | null {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext;
      if (!AudioCtxClass) return null;
      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new AudioCtxClass();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Play outgoing ringback tone: 440Hz + 480Hz smooth harmonic burst
  startOutgoingRing() {
    if (this.isRinging) this.stopRing();
    this.isRinging = true;

    const playBeep = () => {
      const ctx = this.getAudioContext();
      if (!ctx || !this.isRinging) return;

      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        // Smooth volume envelope with soft attack and decay to eliminate audio clicks
        const t0 = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.045, t0 + 0.08);
        gain.gain.setValueAtTime(0.045, t0 + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(t0);
        osc2.start(t0);
        osc1.stop(t0 + 1.85);
        osc2.stop(t0 + 1.85);
      } catch {
        // Ignore audio playback errors if user hasn't interacted with page yet
      }
    };

    playBeep();
    this.intervalId = setInterval(playBeep, 4000);
  }

  // Play incoming ringtone: melodic dual-tone chime
  startIncomingRing() {
    if (this.isRinging) this.stopRing();
    this.isRinging = true;

    const playChime = () => {
      const ctx = this.getAudioContext();
      if (!ctx || !this.isRinging) return;

      try {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.value = freq;

          const startTime = ctx.currentTime + idx * 0.14;
          gain.gain.setValueAtTime(0.0001, startTime);
          gain.gain.linearRampToValueAtTime(0.065, startTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.7);
        });
      } catch {
        // Audio policy ignore
      }
    };

    playChime();
    this.intervalId = setInterval(playChime, 2600);
  }

  stopRing() {
    this.isRinging = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  playCallEnd() {
    this.stopRing();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const t0 = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t0);
      osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.28);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.07, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t0);
      osc.stop(t0 + 0.3);
    } catch {
      // Ignore
    }
  }
}

export const callSound = new CallSoundManager();
