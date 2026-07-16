"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./keepsake.module.css";
import type { Stage } from "./Scene";
import { MEMORY_CAPTIONS } from "./Scene";

const KeepsakeCanvas = dynamic(() => import("./KeepsakeCanvas"), { ssr: false });

const QUOTES = [
  "“You make patience look like a love language.”",
  "“I have never once been bored next to you. That is not a small thing.”",
  "“Home stopped being a place the day you became it.”",
  "“Every year with you has felt like the first, and also like I've known you forever.”",
];

const VOICE_SCRIPT =
  "Hey, Chinni. I know there's a lot to look through here, so here's the short version, in case you skip everything else: thank you. Thank you for five years of choosing this, choosing us, even on the days it wasn't easy. I love you today the same stubborn way I loved you on day one. Maybe more.";

const PEAK_TEXT =
  "If I had to choose all over again — every year, every ordinary Tuesday, every hard month — I would choose you. Every single time.";

const TOTAL_BEATS = 5;

function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function KeepsakeExperience() {
  const reduced = useReducedMotionPref();

  const [stage, setStage] = useState<Stage>("gate");
  const [sealBroken, setSealBroken] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [beatIndex, setBeatIndex] = useState(0);
  const [musicOn, setMusicOn] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const reverbSendRef = useRef<GainNode | null>(null);
  const musicStartedRef = useRef(false);
  const musicOnRef = useRef(false);
  const loopTimerRef = useRef<number | null>(null);
  const phraseToggleRef = useRef(0);

  function makeImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = rate * seconds;
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  function playNote(freq: number, time: number, dur: number, peak: number, dest: AudioNode) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.type = "sine";
    o1.frequency.value = freq;
    o2.type = "sine";
    o2.frequency.value = freq * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0.16;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(peak, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o1.connect(g);
    o2.connect(g2);
    g2.connect(g);
    g.connect(dest);
    o1.start(time);
    o1.stop(time + dur + 0.05);
    o2.start(time);
    o2.stop(time + dur + 0.05);
  }

  function scheduleMotif() {
    const ctx = audioCtxRef.current;
    const reverbSend = reverbSendRef.current;
    if (!ctx || !reverbSend || !musicOnRef.current) return;
    const now = ctx.currentTime + 0.1;
    const phraseA = [261.63, 311.13, 392.0, 523.25, 392.0, 311.13];
    const phraseB = [293.66, 349.23, 440.0, 349.23, 293.66, 220.0];
    const notes = phraseToggleRef.current % 2 === 0 ? phraseA : phraseB;
    phraseToggleRef.current += 1;
    notes.forEach((f, i) => playNote(f, now + i * 0.52, 1.5, 0.04, reverbSend));
    loopTimerRef.current = window.setTimeout(scheduleMotif, 5400);
  }

  function startMusic() {
    if (musicStartedRef.current) return;
    musicStartedRef.current = true;
    try {
      const AudioCtxClass =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      masterRef.current = master;

      const convolver = ctx.createConvolver();
      convolver.buffer = makeImpulse(ctx, 2.4, 2.2);
      const wetGain = ctx.createGain();
      wetGain.gain.value = 0.55;
      convolver.connect(wetGain);
      wetGain.connect(master);
      const reverbSend = ctx.createGain();
      reverbSend.gain.value = 1;
      reverbSend.connect(convolver);
      reverbSend.connect(master);
      reverbSendRef.current = reverbSend;

      [130.81, 196.0, 164.81].forEach((f, idx) => {
        const o = ctx.createOscillator();
        o.type = idx === 2 ? "triangle" : "sine";
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = idx === 2 ? 0.014 : 0.03;
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.05 + idx * 0.017;
        lfoGain.gain.value = 2.4;
        lfo.connect(lfoGain);
        lfoGain.connect(o.detune);
        o.connect(g);
        g.connect(master);
        o.start();
        lfo.start();
      });

      const now = ctx.currentTime;
      master.gain.linearRampToValueAtTime(0.5, now + 2.5);
      musicOnRef.current = true;
      setMusicOn(true);
      scheduleMotif();
    } catch {
      /* audio unavailable, fail silently */
    }
  }

  function toggleMusic() {
    if (!musicStartedRef.current) {
      startMusic();
      return;
    }
    const ctx = audioCtxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    if (musicOnRef.current) {
      master.gain.cancelScheduledValues(now);
      master.gain.linearRampToValueAtTime(0, now + 0.6);
      musicOnRef.current = false;
      setMusicOn(false);
      if (loopTimerRef.current) window.clearTimeout(loopTimerRef.current);
    } else {
      master.gain.cancelScheduledValues(now);
      master.gain.linearRampToValueAtTime(0.5, now + 0.6);
      musicOnRef.current = true;
      setMusicOn(true);
      scheduleMotif();
    }
  }

  function playChime() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const dest = reverbSendRef.current ?? ctx.destination;
    playNote(880, ctx.currentTime, 1.4, 0.09, dest);
    playNote(1108.7, ctx.currentTime + 0.12, 1.5, 0.06, dest);
  }

  function playClick() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const dest = reverbSendRef.current ?? ctx.destination;
    playNote(660, ctx.currentTime, 0.35, 0.05, dest);
  }

  useEffect(() => {
    return () => {
      if (loopTimerRef.current) window.clearTimeout(loopTimerRef.current);
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  function handleBreakSeal() {
    if (sealBroken) return;
    setSealBroken(true);
    setStage("opening");
    startMusic();
    window.setTimeout(() => setStage("ring"), reduced ? 400 : 2600);
  }

  function handleSelectCard(index: number | null) {
    if (index !== null) playClick();
    setSelectedIndex(index);
  }

  function nextBeat() {
    playClick();
    setBeatIndex((b) => Math.min(TOTAL_BEATS - 1, b + 1));
  }
  function prevBeat() {
    playClick();
    setBeatIndex((b) => Math.max(0, b - 1));
  }

  function closeLetter() {
    setStage("closing");
    window.setTimeout(playChime, reduced ? 100 : 900);
  }

  /* ---------------- voice note ---------------- */
  const words = useMemo(() => {
    let cum = 0;
    return VOICE_SCRIPT.split(" ").map((w) => {
      const start = cum;
      cum += w.length + 1;
      return { word: w, start };
    });
  }, []);
  const [speaking, setSpeaking] = useState(false);
  const [activeWord, setActiveWord] = useState(-1);
  const bars = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        delay: i * 0.05,
        duration: 0.75 + (i % 5) * 0.08,
      })),
    []
  );

  function handlePlayVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(VOICE_SCRIPT);
    utter.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /en-US|en_GB|en-GB/.test(v.lang) && v.localService) ?? voices[0];
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setSpeaking(true);
    utter.onboundary = (e) => {
      if (e.charIndex === undefined) return;
      let current = -1;
      for (let i = 0; i < words.length; i++) {
        if (words[i].start <= e.charIndex) current = i;
        else break;
      }
      setActiveWord(current);
    };
    utter.onend = () => {
      setSpeaking(false);
      setActiveWord(-1);
    };
    utter.onerror = () => {
      setSpeaking(false);
      setActiveWord(-1);
    };
    window.speechSynthesis.speak(utter);
  }

  return (
    <div className={styles.page}>
      <KeepsakeCanvas
        stage={stage}
        sealBroken={sealBroken}
        selectedIndex={selectedIndex}
        onBreakSeal={handleBreakSeal}
        onSelectCard={handleSelectCard}
        reduced={reduced}
      />

      <div className={styles.overlay}>
        <button
          className={styles.soundToggle}
          onClick={toggleMusic}
          aria-label={musicOn ? "Mute music" : "Play music"}
          aria-pressed={musicOn}
          style={{
            opacity: stage === "gate" ? 0 : 1,
            pointerEvents: stage === "gate" ? "none" : "auto",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M4 9v6h4l5 5V4L8 9H4z" />
            <path d="M16.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 6a9 9 0 0 1 0 12" />
          </svg>
        </button>

        {stage === "gate" && (
          <div className={styles.gateBlock}>
            <p className={styles.gateCaption}>a keepsake, five years in the making</p>
            <h1 className={styles.gateName}>Chinni</h1>
            <button className={styles.gateBtn} onClick={handleBreakSeal} disabled={sealBroken}>
              break the seal
            </button>
            <p className={styles.gateHint}>
              tap the seal above, or the button &mdash; best with sound on
            </p>
          </div>
        )}

        {stage === "ring" && (
          <>
            <p className={styles.sceneHint}>drag to look around &middot; tap a memory to bring it close</p>

            {selectedIndex !== null && (
              <p className={styles.captionBadge}>{MEMORY_CAPTIONS[selectedIndex]}</p>
            )}

            <div className={styles.panel}>
              {beatIndex === 0 && (
                <>
                  <p className={styles.panelLabel}>for Eswari</p>
                  <p className={styles.panelText}>
                    Five years in, and you still make ordinary Tuesdays feel worth writing about. This
                    is for you, Chinni &mdash; an unhurried, honest thank-you for choosing us, every day,
                    for five years running.
                  </p>
                </>
              )}
              {beatIndex === 1 && (
                <>
                  <p className={styles.panelLabel}>why I call you Chinni</p>
                  <p className={styles.panelText}>
                    I don&rsquo;t remember the first time it slipped out &mdash; somewhere between a bad
                    joke and a good one, your name softened into something only I get to say. Five
                    years later, it still makes the room feel like ours, no matter which room we&rsquo;re
                    in.
                  </p>
                </>
              )}
              {beatIndex === 2 && (
                <>
                  <p className={styles.panelLabel}>a few things I&rsquo;ve never said out loud</p>
                  <ul className={styles.panelQuotes}>
                    {QUOTES.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </>
              )}
              {beatIndex === 3 && (
                <>
                  <p className={styles.panelLabel}>a voice note</p>
                  <div className={styles.voiceRow}>
                    <button
                      className={styles.playBtn}
                      onClick={handlePlayVoice}
                      aria-label={speaking ? "Pause voice note" : "Play voice note"}
                    >
                      {speaking ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="5" width="4" height="14" />
                          <rect x="14" y="5" width="4" height="14" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className={styles.waveform}>
                      {bars.map((b, i) => (
                        <span
                          key={i}
                          className={styles.waveBar}
                          style={{
                            height: speaking ? "70%" : "22%",
                            transition: `height ${b.duration}s ease-in-out ${b.delay}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.panelText}>
                    {words.map((w, i) => (
                      <span
                        key={i}
                        className={`${styles.voiceWord} ${i === activeWord ? styles.voiceWordActive : ""}`}
                      >
                        {w.word}{" "}
                      </span>
                    ))}
                  </p>
                </>
              )}
              {beatIndex === 4 && (
                <>
                  <p className={styles.panelLabel}>whenever you&rsquo;re ready</p>
                  <p className={styles.panelText}>
                    Happy five years, Chinni. Here&rsquo;s to the ones we haven&rsquo;t lived yet.
                  </p>
                </>
              )}

              <div className={styles.panelActions}>
                {beatIndex > 0 && (
                  <button className={styles.continueBtn} onClick={prevBeat}>
                    back
                  </button>
                )}
                {beatIndex < TOTAL_BEATS - 1 ? (
                  <button className={styles.continueBtn} onClick={nextBeat}>
                    continue &rarr;
                  </button>
                ) : (
                  <button className={styles.continueBtn} onClick={closeLetter}>
                    close the letter
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {stage === "closing" && (
          <div className={styles.closingOverlay}>
            <p className={styles.peakLine}>{PEAK_TEXT}</p>
            <p className={styles.signature}>Always yours, and completely.</p>
          </div>
        )}
      </div>
    </div>
  );
}
