class AudioFX {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      this.audioContext = null;
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser ", e);
    }
  }

  private initAudioContext() {
    if (!this.audioContext && this.enabled) {
      try {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      } catch (e) {
        console.warn("Failed to initialize AudioContext:", e);
      }
    }
  }

  click() {
    if (!this.enabled) return;
    this.initAudioContext();
    this.playTone(500, 0.05);
  }

  success() {
    if (!this.enabled) return;
    this.initAudioContext();
    this.playTone([440, 554, 659], 0.2, "square");
  }

  loose() {
    if (!this.enabled) return;
    this.initAudioContext();
    this.playTone([330, 280], 0.2, "sawtooth");
  }

  startNewGame() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    this.playTone(440, 0.1, "square", now);
    this.playTone(880, 0.1, "square", now + 0.3);
    this.playTone([220, 440, 880], 0.3, "sine", now + 0.7);
  }

  private playTone(
    frequency: number | number[],
    duration: number,
    type: OscillatorType = "sine",
    startTime?: number
  ) {
    if (!this.audioContext) return;

    const start = startTime || this.audioContext.currentTime;

    if (Array.isArray(frequency)) {
      frequency.forEach((freq, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(
          freq,
          start + index * (duration / frequency.length)
        );

        gainNode.gain.setValueAtTime(
          0.3,
          start + index * (duration / frequency.length)
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          start + (index + 1) * (duration / frequency.length)
        );

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.start(start + index * (duration / frequency.length));
        oscillator.stop(start + (index + 1) * (duration / frequency.length));
      });
    } else {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);

      gainNode.gain.setValueAtTime(0.3, start);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(start);
      oscillator.stop(start + duration);
    }
  }
}

export const audioFX = new AudioFX();
