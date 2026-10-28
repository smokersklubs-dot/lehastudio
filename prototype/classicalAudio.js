// ============================================================================
// Marina Lehacaut Studio — Moteur Musical Classique & Symphonique au Scroll
// Inspiré de Beethoven (Sonate au Clair de Lune Op. 27 n°2, 7e Symphonie II. Allegretto)
// et Mozart (Adagio K.488 / Lacrimosa) : Piano de concert, Violoncelle solo,
// Quatuor & Orchestre à cordes, Harpe, Pizzicati et Réverbération de salle.
// Compatible Desktop + Mobile (iOS Safari / Chrome iOS mode silencieux & Android).
// ============================================================================

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;

// Conversion note MIDI -> Fréquence Hz (La 440 = 69)
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Progressions harmoniques classiques (en numéros MIDI) par acte dramatique :
const PROGRESSIONS = {
  // 01. Le fil (0 -> 5 %) : Intime, mystérieux, arpèges style Clair de Lune (Do#m - La - Si - Do#m)
  fil: [
    { bass: 37, chord: [56, 61, 64, 68], melody: [73, 76, 80, 76] }, // C#m
    { bass: 35, chord: [56, 61, 64, 68], melody: [75, 76, 80, 75] }, // C#m/B
    { bass: 33, chord: [57, 61, 64, 69], melody: [76, 81, 85, 81] }, // A maj7
    { bass: 32, chord: [56, 60, 63, 68], melody: [75, 80, 84, 75] }, // G#7
  ],
  // 02. Entrer dans la matière (5 -> 15 %) : Chaleureux, entrée du violoncelle (Fa#m - Ré - La - Mi)
  matiere: [
    { bass: 42, chord: [54, 57, 61, 66], melody: [69, 73, 76, 81] }, // F#m
    { bass: 38, chord: [50, 57, 62, 66], melody: [74, 78, 81, 78] }, // D maj
    { bass: 33, chord: [49, 57, 61, 64], melody: [73, 76, 80, 81] }, // A maj
    { bass: 40, chord: [52, 56, 59, 64], melody: [71, 76, 78, 80] }, // E maj
  ],
  // 03. L'envol & L'explosion (15 -> 30 %) — WOW 1 : Montée dramatique Beethovenienne puis apothéose
  explosion: [
    { bass: 37, chord: [49, 56, 61, 64, 68], melody: [73, 76, 80, 85] }, // C#m
    { bass: 33, chord: [45, 57, 61, 64, 69], melody: [76, 81, 85, 88] }, // A
    { bass: 38, chord: [50, 57, 62, 66, 69], melody: [78, 81, 86, 90] }, // D
    { bass: 32, chord: [44, 56, 60, 63, 68], melody: [80, 84, 87, 92] }, // G#7 -> climax
  ],
  // 04. Le geste (30 -> 43 %) : Ostinato rythmique style 7e Symphonie Allegretto (pizzicati + cordes)
  geste: [
    { bass: 37, chord: [56, 61, 64, 68], melody: [68, 68, 73, 76] },
    { bass: 40, chord: [56, 59, 64, 68], melody: [71, 71, 76, 80] },
    { bass: 33, chord: [57, 61, 64, 69], melody: [69, 73, 76, 81] },
    { bass: 32, chord: [56, 60, 63, 68], melody: [68, 72, 75, 80] },
  ],
  // 05. Arcade naît (43 -> 55 %) : Révélation lumineuse en Majeur (La majeur / Mi majeur / Ré majeur)
  arcade: [
    { bass: 33, chord: [57, 61, 64, 69, 73], melody: [81, 80, 76, 85] }, // A maj
    { bass: 40, chord: [56, 59, 64, 68, 71], melody: [80, 78, 76, 83] }, // E maj
    { bass: 42, chord: [57, 61, 66, 69, 73], melody: [81, 76, 73, 81] }, // F#m7
    { bass: 38, chord: [57, 62, 66, 69, 74], melody: [78, 81, 86, 85] }, // D maj7
  ],
  // 06. La galerie ivoire (55 -> 67 %) : Grand Adagio Mozartien aérien et noble dans l'espace voûté
  galerie: [
    { bass: 33, chord: [52, 57, 61, 64, 69], melody: [76, 81, 80, 76] }, // A
    { bass: 37, chord: [52, 56, 61, 64, 68], melody: [73, 76, 80, 85] }, // C#m7
    { bass: 38, chord: [54, 57, 62, 66, 69], melody: [81, 78, 74, 86] }, // D maj7
    { bass: 40, chord: [52, 56, 59, 64, 68], melody: [80, 76, 71, 83] }, // E6
  ],
  // 07. Casser l'œuvre (67 -> 77 %) — WOW 2 : Virtuosité et suspension harmonique
  casser: [
    { bass: 37, chord: [56, 61, 64, 68, 73], melody: [85, 80, 76, 88] },
    { bass: 33, chord: [57, 61, 66, 69, 73], melody: [85, 81, 78, 90] },
    { bass: 38, chord: [57, 62, 66, 69, 74], melody: [86, 81, 78, 93] },
    { bass: 40, chord: [56, 59, 64, 68, 71], melody: [88, 83, 80, 92] },
  ],
  // 08 & 09. Du digital au réel & L'atelier (77 -> 94.5 %) : Violoncelle solo vibrant & piano de chambre
  atelier: [
    { bass: 42, chord: [54, 57, 61, 66], melody: [73, 76, 78, 81] }, // F#m
    { bass: 38, chord: [54, 57, 62, 66], melody: [74, 78, 81, 85] }, // D
    { bass: 33, chord: [52, 57, 61, 64], melody: [76, 80, 81, 85] }, // A
    { bass: 40, chord: [52, 56, 59, 64], melody: [76, 78, 80, 83] }, // E
  ],
  // 10. Le studio (94.5 -> 100 %) : Coda apaisée en La majeur (Morendo)
  studio: [
    { bass: 33, chord: [45, 52, 57, 61, 64, 69], melody: [73, 76, 81, 76] },
    { bass: 38, chord: [50, 57, 62, 66, 69], melody: [74, 78, 81, 78] },
    { bass: 33, chord: [45, 52, 57, 61, 64, 69], melody: [73, 76, 81, 85] },
    { bass: 33, chord: [45, 52, 57, 61, 64, 69], melody: [81, 76, 73, 69] },
  ],
};

// Calcule la courbe d'intensité dramatique (0.22 -> 1.0) tout au long du scroll (0 -> 100 %)
function computeDramaticIntensity(gp, scrollSpeed) {
  let base = 0.30;
  if (gp < 5) {
    base = lerp(0.26, 0.38, gp / 5); // Intro clairement audible dès 0 %
  } else if (gp < 15) {
    base = lerp(0.38, 0.56, (gp - 5) / 10); // Entrée violoncelle
  } else if (gp < 25) {
    base = lerp(0.56, 0.80, (gp - 15) / 10); // Envol des bobines (crescendo)
  } else if (gp < 30) {
    const peak = 1 - Math.min(1, Math.abs(gp - 27.4) / 2.8);
    base = 0.80 + peak * 0.20;
  } else if (gp < 43) {
    base = lerp(0.50, 0.75, (gp - 30) / 13); // Le geste
  } else if (gp < 55) {
    base = lerp(0.65, 0.85, (gp - 43) / 12); // Arcade naît
  } else if (gp < 67) {
    base = 0.72; // La galerie ivoire
  } else if (gp < 77) {
    const peak = 1 - Math.min(1, Math.abs(gp - 71.0) / 4.0);
    base = 0.74 + peak * 0.24;
  } else if (gp < 86) {
    base = lerp(0.56, 0.70, (gp - 77) / 9);
  } else if (gp < 94.5) {
    base = lerp(0.64, 0.88, (gp - 86) / 8.5);
  } else {
    base = lerp(0.48, 0.28, (gp - 94.5) / 5.5);
  }
  const speedBoost = clamp(Math.abs(scrollSpeed) * 0.04, 0, 0.18);
  return clamp(base + speedBoost, 0.22, 1.0);
}

function getSectionKey(gp) {
  if (gp < 5) return 'fil';
  if (gp < 15) return 'matiere';
  if (gp < 30) return 'explosion';
  if (gp < 43) return 'geste';
  if (gp < 55) return 'arcade';
  if (gp < 67) return 'galerie';
  if (gp < 77) return 'casser';
  if (gp < 94.5) return 'atelier';
  return 'studio';
}

// Crée un mini fichier WAV silencieux dans une balise <audio> pour déverrouiller
// le canal haut-parleur sur iOS Safari / Chrome même lorsque le bouton Silencieux de l'iPhone est activé.
function createIOSSilentSwitchUnlocker() {
  try {
    const sampleRate = 8000;
    const numSamples = 800; // 0.1s
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    const blob = new Blob([buffer], { type: 'audio/wav' });
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(blob);
    audio.loop = true;
    audio.playsInline = true;
    audio.setAttribute('playsinline', '');
    audio.setAttribute('webkit-playsinline', '');
    audio.volume = 0.01;
    return audio;
  } catch {
    return null;
  }
}

// Crée une réponse impulsionnelle stéréo légère (1.4 s) compatible mobile & desktop
function createConcertHallIR(ctx) {
  try {
    const rate = ctx.sampleRate || 44100;
    const length = Math.floor(rate * 1.4);
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let seed = ch === 0 ? 1337 : 7331;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
      for (let i = 0; i < length; i++) {
        const t = i / rate;
        const early = t < 0.06 ? Math.sin(t * 180) * 0.35 : 1.0;
        const decay = Math.exp(-t * 3.1) * early;
        data[i] = rnd() * decay * 0.42;
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = impulse;
    return conv;
  } catch {
    return null;
  }
}

export function createClassicalSoundtrack({ onStatusChange }) {
  let ctx = null;
  let graphBuilt = false;
  let masterGain = null;
  let dryBus = null;
  let reverbBus = null;
  let stringPadBus = null;
  let padFilter = null;
  let padOscs = [];
  const iosUnlocker = createIOSSilentSwitchUnlocker();

  let isPlaying = false;
  let userMuted = false;
  let stepIndex = 0;
  let chordIndex = 0;
  let nextNoteTime = 0;
  let currentGp = 0;
  let currentSpeed = 0;
  let currentIntensity = 0.32;
  let lastTacTime = 0;

  // Déverrouillage synchrone immédiat dans le fil de l'événement utilisateur (critique sur iOS/Android)
  function unlockAndBuildAudio() {
    if (navigator.audioSession) {
      try { navigator.audioSession.type = 'playback'; } catch { }
    }
    if (iosUnlocker && iosUnlocker.paused) {
      try { iosUnlocker.play().catch(() => { }); } catch { }
    }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;

    if (!ctx) {
      if (window.__mlsActiveAudioCtx && window.__mlsActiveAudioCtx.state !== 'closed') {
        try { window.__mlsActiveAudioCtx.close(); } catch { }
      }
      ctx = new AC();
      window.__mlsActiveAudioCtx = ctx;
    }

    // 1. Appel synchrone immédiat de ctx.resume() + lecture d'un buffer 1-sample (exigence WebKit iOS)
    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      try { ctx.resume().catch(() => { }); } catch { }
    }
    try {
      const silentBuf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = silentBuf;
      src.connect(ctx.destination);
      src.start(0);
    } catch { }

    // 2. Construction du graphe de synthèse
    if (!graphBuilt) {
      graphBuilt = true;
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.92;

      // Compresseur de mastering qui rehausse les nuances douces sur haut-parleur mobile
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 18;
      comp.ratio.value = 3.2;
      comp.attack.value = 0.015;
      comp.release.value = 0.22;

      masterGain.connect(comp);
      comp.connect(ctx.destination);

      dryBus = ctx.createGain();
      dryBus.gain.value = 0.85;
      dryBus.connect(masterGain);

      reverbBus = ctx.createGain();
      reverbBus.gain.value = 0.52;
      const convolver = createConcertHallIR(ctx);
      if (convolver) {
        const revFilter = ctx.createBiquadFilter();
        revFilter.type = 'lowpass';
        revFilter.frequency.value = 2800;
        reverbBus.connect(revFilter);
        revFilter.connect(convolver);
        convolver.connect(masterGain);
      } else {
        reverbBus.gain.value = 0.25;
        reverbBus.connect(masterGain);
      }

      // Nappe d'orchestre à cordes continue (Violoncelles + Altos + Violons)
      stringPadBus = ctx.createGain();
      stringPadBus.gain.value = 0.16;
      padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.value = 680;
      padFilter.Q.value = 0.7;
      stringPadBus.connect(padFilter);
      padFilter.connect(dryBus);
      padFilter.connect(reverbBus);

      const baseNotes = [37, 49, 56, 61, 64];
      padOscs = baseNotes.map((midi, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i < 2 ? 'sawtooth' : 'triangle';
        osc.frequency.value = mtof(midi);
        osc.detune.value = (i % 2 === 0 ? 1 : -1) * (3.5 + i * 1.2);
        g.gain.value = i < 2 ? 0.09 : 0.065;
        osc.connect(g);
        g.connect(stringPadBus);
        osc.start();
        return { osc, gain: g };
      });

      nextNoteTime = ctx.currentTime + 0.04;
    }
    return true;
  }

  // Synthèse d'une note de Piano de Concert (enrichie en harmoniques médiums pour haut-parleurs mobiles)
  function playPianoNote(midi, time, duration, velocity = 0.5, pan = 0) {
    if (!ctx || !isPlaying) return;
    const freq = mtof(midi);
    const out = ctx.createGain();
    let dest = out;
    if (ctx.createStereoPanner) {
      try {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(clamp(pan, -0.75, 0.75), time);
        out.connect(panner);
        dest = panner;
      } catch { }
    }
    dest.connect(dryBus);
    dest.connect(reverbBus);

    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    const peakCutoff = clamp(freq * (2.8 + velocity * 5.8), 650, 7200);
    flt.frequency.setValueAtTime(peakCutoff, time);
    flt.frequency.exponentialRampToValueAtTime(Math.max(380, freq * 1.6), time + duration * 0.85);
    flt.connect(out);

    // Partiels enrichis (le 2e et 3e partiel rendent les graves du piano audibles sur iPhone/Android)
    const partials = [
      { mult: 1, amp: 1.0, type: 'triangle', det: -1.5 },
      { mult: 1, amp: 0.55, type: 'sine', det: 1.5 },
      { mult: 2.001, amp: 0.42 * (0.4 + velocity * 0.6), type: 'triangle', det: 2.2 },
      { mult: 3.003, amp: 0.16 * velocity, type: 'sine', det: 0 },
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const pg = ctx.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(freq * p.mult, time);
      osc.detune.setValueAtTime(p.det, time);
      pg.gain.setValueAtTime(p.amp, time);
      osc.connect(pg);
      pg.connect(flt);
      osc.start(time);
      osc.stop(time + duration + 0.08);
    });

    const amp = 0.21 * velocity;
    out.gain.setValueAtTime(0.0001, time);
    out.gain.linearRampToValueAtTime(amp, time + 0.012);
    out.gain.exponentialRampToValueAtTime(amp * 0.42, time + 0.20);
    out.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  }

  // Synthèse d'une note d'archet (Violoncelle solo / Violons legato avec vibrato expressif)
  function playBowedString(midi, time, duration, velocity = 0.5, isCello = true) {
    if (!ctx || !isPlaying) return;
    const freq = mtof(midi);
    const out = ctx.createGain();
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(isCello ? 1150 + velocity * 950 : 1800 + velocity * 1400, time);
    flt.Q.value = isCello ? 1.3 : 1.0;

    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vib.frequency.setValueAtTime(5.4, time);
    vibGain.gain.setValueAtTime(0.1, time);
    vibGain.gain.linearRampToValueAtTime(freq * 0.0065, time + duration * 0.45);
    vib.connect(vibGain);

    [-4.5, 4.5].forEach((det) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(det, time);
      vibGain.connect(osc.frequency);
      osc.connect(flt);
      osc.start(time);
      osc.stop(time + duration + 0.12);
    });
    vib.start(time);
    vib.stop(time + duration + 0.12);

    const amp = (isCello ? 0.105 : 0.08) * velocity;
    out.gain.setValueAtTime(0.0001, time);
    out.gain.linearRampToValueAtTime(amp, time + Math.min(0.28, duration * 0.32));
    out.gain.setValueAtTime(amp * 0.85, time + duration * 0.72);
    out.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.08);

    flt.connect(out);
    out.connect(dryBus);
    out.connect(reverbBus);
  }

  function playPizzicato(midi, time, velocity = 0.5) {
    if (!ctx || !isPlaying) return;
    const freq = mtof(midi);
    const osc = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(freq * 3.8, time);
    flt.frequency.exponentialRampToValueAtTime(freq * 1.1, time + 0.16);
    const amp = 0.15 * velocity;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(amp, time + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);
    osc.connect(flt);
    flt.connect(g);
    g.connect(dryBus);
    g.connect(reverbBus);
    osc.start(time);
    osc.stop(time + 0.26);
  }

  function playTimpaniRoll(midi, time, intensity = 0.7) {
    if (!ctx || !isPlaying) return;
    const freq = mtof(midi + 12); // Octave supérieure pour être perçu aussi sur mobile
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.08, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.12);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.20 * intensity, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 1.1);
    osc.connect(g);
    g.connect(reverbBus);
    g.connect(dryBus);
    osc.start(time);
    osc.stop(time + 1.15);
  }

  function scheduleNotes() {
    if (!ctx || !isPlaying || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    if (nextNoteTime < now || nextNoteTime > now + 2.0) {
      nextNoteTime = now + 0.02;
    }

    while (nextNoteTime < now + 0.16) {
      const secKey = getSectionKey(currentGp);
      const prog = PROGRESSIONS[secKey] || PROGRESSIONS.fil;
      const bar = prog[chordIndex % prog.length];
      const stepInBar = stepIndex % 12;

      let stepDur = 0.27;
      if (secKey === 'explosion' || secKey === 'casser') stepDur = lerp(0.24, 0.18, currentIntensity);
      else if (secKey === 'geste') stepDur = 0.21;
      else if (secKey === 'galerie') stepDur = 0.26;
      else if (secKey === 'studio') stepDur = 0.32;
      stepDur *= 1 - clamp(Math.abs(currentSpeed) * 0.025, 0, 0.16);

      if (stepInBar === 0) {
        const padNotes = [bar.bass, bar.bass + 12, ...bar.chord.slice(0, 3)];
        padOscs.forEach((p, idx) => {
          const targetMidi = padNotes[idx % padNotes.length];
          p.osc.frequency.setTargetAtTime(mtof(targetMidi), nextNoteTime, 0.18);
        });

        playPianoNote(bar.bass + 12, nextNoteTime, stepDur * 11, clamp(currentIntensity * 0.9, 0.35, 0.95), -0.35);
        if (currentIntensity > 0.55) {
          playPianoNote(bar.bass, nextNoteTime, stepDur * 11, currentIntensity * 0.8, -0.45);
        }
        if (currentGp >= 4.0) {
          playBowedString(bar.bass + 12, nextNoteTime, stepDur * 10.5, clamp(currentIntensity * 0.95, 0.35, 0.95), true);
        }
        if (currentIntensity > 0.80) {
          playTimpaniRoll(bar.bass, nextNoteTime, currentIntensity);
        }
      } else if (stepInBar === 6 && currentIntensity > 0.50) {
        playBowedString(bar.chord[0], nextNoteTime, stepDur * 5.5, currentIntensity * 0.78, true);
      }

      const arpNote = bar.chord[stepInBar % bar.chord.length];
      const octaveShift = (currentIntensity > 0.74 && stepInBar % 3 === 2) ? 12 : 0;
      const accent = stepInBar % 3 === 0 ? 1.12 : 0.86;
      const arpVel = clamp(currentIntensity * 0.80 * accent, 0.28, 0.92);
      const panPos = ((stepInBar % 4) - 1.5) * 0.22;

      if (secKey === 'geste') {
        if (stepInBar % 2 === 0) {
          playPizzicato(arpNote, nextNoteTime, clamp(currentIntensity * 0.92, 0.40, 0.92));
        }
        playPianoNote(arpNote, nextNoteTime, stepDur * 2.2, arpVel * 0.88, panPos);
      } else {
        playPianoNote(arpNote + octaveShift, nextNoteTime, stepDur * 3.6, arpVel, panPos);
      }

      if (stepInBar === 3 || stepInBar === 9 || (currentIntensity > 0.65 && stepInBar === 6)) {
        const melIdx = Math.floor(stepInBar / 3) % bar.melody.length;
        const melMidi = bar.melody[melIdx];
        const melVel = clamp(currentIntensity * 0.95, 0.38, 0.98);
        playPianoNote(melMidi, nextNoteTime + 0.01, stepDur * 5.2, melVel, 0.28);

        if (currentIntensity > 0.42) {
          playBowedString(melMidi, nextNoteTime + 0.02, stepDur * 5.5, melVel * 0.85, false);
        }
        if (currentIntensity > 0.76) {
          playPianoNote(melMidi + 12, nextNoteTime + 0.018, stepDur * 4.5, melVel * 0.68, 0.42);
        }
      }

      nextNoteTime += stepDur;
      stepIndex++;
      if (stepIndex % 12 === 0) {
        chordIndex++;
      }
    }
  }

  function startPlaybackNow() {
    if (!ctx) return;
    isPlaying = true;
    const activate = () => {
      if (!isPlaying || userMuted) return;
      const now = ctx.currentTime;
      nextNoteTime = now + 0.02;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(0.95, now);
      scheduleNotes();
      if (onStatusChange) onStatusChange(true);
    };
    if (ctx.state === 'running') {
      activate();
    } else {
      ctx.resume().then(activate).catch(() => { });
      activate();
    }
  }

  return {
    get on() {
      return isPlaying;
    },
    toggle() {
      if (!isPlaying) {
        userMuted = false;
        if (!unlockAndBuildAudio()) return;
        startPlaybackNow();
      } else {
        userMuted = true;
        isPlaying = false;
        if (iosUnlocker && !iosUnlocker.paused) {
          try { iosUnlocker.pause(); } catch { }
        }
        if (ctx && masterGain) {
          const now = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.setValueAtTime(0.0, now);
          try { ctx.suspend().catch(() => { }); } catch { }
        }
        if (onStatusChange) onStatusChange(false);
      }
    },
    autoStartOnGesture() {
      if (userMuted) return;
      // Si l'audio tourne déjà avec un contexte actif ('running'), rien à faire
      if (isPlaying && ctx && ctx.state === 'running') return;
      if (!unlockAndBuildAudio()) return;
      startPlaybackNow();
    },
    update(gp, scrollVelocity = 0) {
      currentGp = gp;
      currentSpeed = scrollVelocity;
      currentIntensity = computeDramaticIntensity(gp, scrollVelocity);

      if (!ctx || !isPlaying || ctx.state !== 'running') return;
      scheduleNotes();

      const now = ctx.currentTime;
      const targetCutoff = lerp(460, 2600, Math.pow(currentIntensity, 1.3));
      padFilter.frequency.setTargetAtTime(targetCutoff, now, 0.12);
      stringPadBus.gain.setTargetAtTime(lerp(0.09, 0.30, currentIntensity), now, 0.15);
    },
    playTac(intensity = 1) {
      if (!ctx || !isPlaying || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      if (now - lastTacTime < 0.14) return;
      lastTacTime = now;
      playPizzicato(61, now, 0.65 * intensity);
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(138.59 * intensity, now);
      osc.frequency.exponentialRampToValueAtTime(46, now + 0.06);
      g.gain.setValueAtTime(0.18 * intensity, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      osc.connect(g);
      g.connect(dryBus);
      osc.start(now);
      osc.stop(now + 0.07);
    },
    playChime(freq = 440) {
      if (!ctx || !isPlaying || ctx.state !== 'running') return;
      const midi = Math.round(69 + 12 * Math.log2(freq / 440));
      playPianoNote(midi, ctx.currentTime, 1.4, 0.65, 0.1);
      playPianoNote(midi + 7, ctx.currentTime + 0.06, 1.6, 0.52, -0.15);
    },
  };
}
