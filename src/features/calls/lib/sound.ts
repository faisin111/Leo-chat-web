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

  // Play outgoing ringback tone: 440Hz + 480Hz burst (2s on, 3s off)
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

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        // Subtle, pleasant volume
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.6);
        osc2.stop(ctx.currentTime + 1.6);
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

          const startTime = ctx.currentTime + idx * 0.12;
          gain.gain.setValueAtTime(0.06, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.6);
        });
      } catch {
        // Audio policy ignore
      }
    };

    playChime();
    this.intervalId = setInterval(playChime, 2500);
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
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignore
    }
  }
}

export const callSound = new CallSoundManager();
