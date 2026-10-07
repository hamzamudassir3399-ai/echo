/**
 * Procedural Audio Synthesizer for Echo Offline Music Player.
 * Generates offline audio waveforms (Lofi, Synthwave, Ambient Drone)
 * and exports them as playable Blobs, ensuring 100% offline audio playback.
 */

export function createSynthesizedTrackBuffer(
  audioCtx: AudioContext,
  style: 'lofi' | 'synthwave' | 'ambient',
  durationSeconds: number = 45
): AudioBuffer {
  const sampleRate = audioCtx.sampleRate;
  const numFrames = Math.floor(sampleRate * durationSeconds);
  const buffer = audioCtx.createBuffer(2, numFrames, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const tempo = style === 'lofi' ? 75 : style === 'synthwave' ? 110 : 50;
  const beatDuration = 60 / tempo;

  // Chord progressions in frequency (Hz)
  const lofiChords = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [196.00, 246.94, 293.66, 349.23], // G7
  ];

  const synthwaveChords = [
    [146.83, 220.00, 293.66, 369.99], // Dm9
    [116.54, 174.61, 233.08, 293.66], // Bbmaj7
    [130.81, 196.00, 261.63, 329.63], // C7
    [110.00, 164.81, 220.00, 277.18], // Aaug
  ];

  const ambientFrequencies = [110.0, 164.81, 220.0, 329.63, 440.0, 554.37];

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    let sampleL = 0;
    let sampleR = 0;

    if (style === 'lofi') {
      // 1. Warm chord pad (smooth sine + triangle)
      const chordIndex = Math.floor((t / (beatDuration * 4)) % lofiChords.length);
      const chord = lofiChords[chordIndex];
      const chordT = (t % (beatDuration * 4)) / (beatDuration * 4);
      const env = Math.sin(Math.PI * Math.min(1, chordT * 1.5)) * 0.18;

      chord.forEach((freq, idx) => {
        const vibrato = Math.sin(t * 4 + idx) * 0.003;
        const tone = Math.sin(2 * Math.PI * (freq + vibrato) * t);
        sampleL += tone * env * (0.8 + idx * 0.1);
        sampleR += tone * env * (1.0 - idx * 0.1);
      });

      // 2. Gentle kick & snare pulse
      const beat = (t % beatDuration) / beatDuration;
      const beatNum = Math.floor(t / beatDuration) % 4;

      // Kick on beat 0 and 2.5
      if (beatNum === 0 || (beatNum === 2 && beat > 0.45)) {
        const kickEnv = Math.max(0, 1 - (beat * 5));
        const kickPitch = 90 * Math.max(0, 1 - (beat * 8)) + 45;
        const kick = Math.sin(2 * Math.PI * kickPitch * t) * kickEnv * 0.35;
        sampleL += kick;
        sampleR += kick;
      }

      // Snare on beat 2
      if (beatNum === 2 && beat < 0.25) {
        const snareEnv = Math.max(0, 1 - (beat * 4));
        const noise = (Math.random() * 2 - 1) * snareEnv * 0.12;
        sampleL += noise;
        sampleR += noise;
      }

      // 3. Subtle vinyl crackle / warmth
      if (Math.random() < 0.002) {
        const crackle = (Math.random() * 2 - 1) * 0.05;
        sampleL += crackle;
        sampleR += crackle;
      }

    } else if (style === 'synthwave') {
      // 1. Pumping 80s bassline
      const step = Math.floor(t / (beatDuration / 4)) % 16;
      const bassEnv = Math.max(0, 1 - ((t % (beatDuration / 4)) / (beatDuration / 4)) * 1.8);
      const chordIndex = Math.floor((t / (beatDuration * 4)) % synthwaveChords.length);
      const rootFreq = synthwaveChords[chordIndex][0] / 2;
      const saw = (((rootFreq * t) % 1) * 2 - 1) * bassEnv * 0.22;
      sampleL += saw;
      sampleR += saw;

      // 2. Arpeggio
      const arpNote = synthwaveChords[chordIndex][step % synthwaveChords[chordIndex].length];
      const arpEnv = Math.max(0, 1 - ((t % (beatDuration / 4)) / (beatDuration / 4)) * 3);
      const arp = Math.sin(2 * Math.PI * arpNote * 2 * t) * arpEnv * 0.14;
      sampleL += arp * 0.7;
      sampleR += arp * 1.3;

      // 3. Four-on-the-floor beat
      const kickBeat = (t % beatDuration) / beatDuration;
      const kickEnv = Math.max(0, 1 - (kickBeat * 6));
      const kick = Math.sin(2 * Math.PI * (110 * Math.max(0, 1 - kickBeat * 10) + 40) * t) * kickEnv * 0.38;
      sampleL += kick;
      sampleR += kick;

    } else {
      // Ambient meditative drone with binaural phase
      ambientFrequencies.forEach((freq, idx) => {
        const lfo = Math.sin(t * (0.1 + idx * 0.05)) * 0.5 + 0.5;
        const lfo2 = Math.cos(t * (0.08 + idx * 0.04)) * 0.5 + 0.5;
        const detuneL = freq + Math.sin(t * 0.2 + idx) * 0.5;
        const detuneR = freq * 1.004 + Math.cos(t * 0.2 + idx) * 0.5;

        sampleL += Math.sin(2 * Math.PI * detuneL * t) * lfo * 0.08;
        sampleR += Math.sin(2 * Math.PI * detuneR * t) * lfo2 * 0.08;
      });
    }

    // Soft master limiter to prevent clipping
    left[i] = Math.max(-0.95, Math.min(0.95, sampleL));
    right[i] = Math.max(-0.95, Math.min(0.95, sampleR));
  }

  return buffer;
}

/**
 * Encodes an AudioBuffer into an offline WAV Blob URL
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const numFrames = buffer.length;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // Write WAV Header
  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write Audio Data
  let offset = 44;
  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;

  for (let i = 0; i < numFrames; i++) {
    const sL = Math.max(-1, Math.min(1, left[i]));
    const intL = sL < 0 ? sL * 0x8000 : sL * 0x7fff;
    view.setInt16(offset, intL, true);
    offset += 2;

    if (numChannels > 1) {
      const sR = Math.max(-1, Math.min(1, right[i]));
      const intR = sR < 0 ? sR * 0x8000 : sR * 0x7fff;
      view.setInt16(offset, intR, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}
