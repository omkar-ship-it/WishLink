"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import styles from "./appreciation.module.css";

const QUOTES = [
  "“You make patience look like a love language.”",
  "“I have never once been bored next to you. That is not a small thing.”",
  "“Home stopped being a place the day you became it.”",
  "“Every year with you has felt like the first, and also like I've known you forever.”",
];

const MEMORIES = [
  { img: "/lab/images/coffee.jpg", cap: "morning coffee, slightly burnt", alt: "Steam rising from a mug of coffee in morning light" },
  { img: "/lab/images/road.jpg", cap: "the long drive nowhere", alt: "A winding road through golden hills at sunset" },
  { img: "/lab/images/rain.jpg", cap: "monsoon, no umbrella", alt: "Raindrops on a window pane" },
  { img: "/lab/images/night.jpg", cap: "2 a.m., still laughing", alt: "Warm string lights glowing along a garden path at night" },
  { img: "/lab/images/candle.jpg", cap: "five first anniversaries", alt: "A single candle flame glowing in the dark" },
];

const VOICE_SCRIPT =
  "Hey, Chinni. I know scrolling through all of this is a lot, so here's the short version, in case you skip everything else: thank you. Thank you for five years of choosing this, choosing us, even on the days it wasn't easy. I love you today the same stubborn way I loved you on day one. Maybe more. Okay, go back to reading. I wrote you a whole letter, don't waste it.";

const PEAK_TEXT =
  "If I had to choose all over again — every year, every ordinary Tuesday, every hard month — I would choose you. Every single time.";

/* ================= scroll-linked sections ================= */

function HeroSection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const counterRef = useRef<HTMLDivElement>(null);
  const counterInView = useInView(counterRef, { once: true, amount: 0.6 });
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!counterInView || startedRef.current) return;
    startedRef.current = true;
    if (reduced) {
      setCount(5);
      return;
    }
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= 5) window.clearInterval(id);
    }, 220);
    return () => window.clearInterval(id);
  }, [counterInView, reduced]);

  return (
    <div ref={ref} className={styles.pinOuter} style={{ height: "180vh" }}>
      <div className={styles.pinInner}>
        <motion.div className={styles.measure} style={{ opacity, scale, y }}>
          <p className={styles.eyebrow}>for Eswari</p>
          <div className={styles.heroCounter} ref={counterRef}>
            {String(count).padStart(2, "0")}
            <span className={styles.heroUnit}>years, and counting</span>
          </div>
          <h2 className={styles.heroLine}>
            Five years in, and you still make ordinary Tuesdays feel worth writing about.
          </h2>
          <p className={styles.heroSub}>
            This is for you, Chinni — an unhurried, honest thank-you for choosing us, every day, for
            five years running.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function WhySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.15], [30, 0]);

  return (
    <div ref={ref} className={styles.pinOuter} style={{ height: "160vh" }}>
      <div className={styles.pinInner}>
        <motion.div className={styles.measure} style={{ opacity, y }}>
          <div className={styles.divider} />
          <p className={styles.eyebrowDim}>why I call you</p>
          <h2 className={styles.sectionHeading}>Chinni</h2>
          <p className={styles.bodyCopy}>
            I don't remember the first time it slipped out — somewhere between a bad joke and a good
            one, your name softened into something only I get to say.
          </p>
          <p className={styles.bodyCopy}>
            Five years later, it still does the same thing it did the very first time: makes the room feel
            like ours, no matter which room we're in.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function QuoteItem({
  progress,
  index,
  count,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
}) {
  const span = 1 / count;
  const start = index * span;
  const fadeIn = start + span * 0.15;
  const fadeOut = start + span * 0.85;
  const end = start + span;
  const opacity = useTransform(progress, [start, fadeIn, fadeOut, end], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, fadeIn], [16, 0]);

  return (
    <motion.p className={styles.quoteItem} style={{ opacity, y }}>
      {QUOTES[index]}
    </motion.p>
  );
}

function QuotesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  return (
    <div ref={ref} className={styles.pinOuter} style={{ height: "260vh" }}>
      <div className={styles.pinInner}>
        <div className={styles.quoteWrap}>
          {QUOTES.map((_, i) => (
            <QuoteItem key={i} progress={scrollYProgress} index={i} count={QUOTES.length} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryItem({
  progress,
  index,
  count,
  item,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  item: (typeof MEMORIES)[number];
}) {
  const span = 1 / count;
  const start = index * span;
  const fadeIn = start + span * 0.15;
  const fadeOut = start + span * 0.85;
  const end = start + span;
  const opacity = useTransform(progress, [start, fadeIn, fadeOut, end], [0, 1, 1, 0]);
  const scale = useTransform(progress, [start, end], [1.08, 1]);

  return (
    <motion.div className={styles.galleryItem} style={{ opacity }}>
      <motion.img className={styles.galleryImg} src={item.img} alt={item.alt} style={{ scale }} />
      <p className={styles.galleryCap}>{item.cap}</p>
    </motion.div>
  );
}

function GallerySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  return (
    <div ref={ref} className={styles.pinOuter} style={{ height: "300vh" }}>
      <div className={styles.pinInner}>
        <div className={styles.galleryWrap}>
          {MEMORIES.map((m, i) => (
            <GalleryItem key={i} progress={scrollYProgress} index={i} count={MEMORIES.length} item={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VoiceSection() {
  const words = useMemo(() => {
    let cum = 0;
    return VOICE_SCRIPT.split(" ").map((w) => {
      const start = cum;
      cum += w.length + 1;
      return { word: w, start };
    });
  }, []);

  const [speaking, setSpeaking] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const bars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        delay: i * 0.045,
        duration: 0.8 + (i % 5) * 0.08,
      })),
    []
  );

  function handlePlay() {
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
      setActiveIndex(current);
    };
    utter.onend = () => {
      setSpeaking(false);
      setActiveIndex(-1);
    };
    utter.onerror = () => {
      setSpeaking(false);
      setActiveIndex(-1);
    };
    window.speechSynthesis.speak(utter);
  }

  return (
    <div className={styles.voiceSection}>
      <div className={styles.voiceCard}>
        <p className={styles.voiceLabel}>a voice note</p>
        <div className={styles.playRow}>
          <button
            className={styles.playBtn}
            onClick={handlePlay}
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
              <motion.span
                key={i}
                className={styles.waveBar}
                animate={{ height: speaking ? ["22%", "90%", "22%"] : "22%" }}
                transition={
                  speaking
                    ? { duration: b.duration, repeat: Infinity, ease: "easeInOut", delay: b.delay }
                    : { duration: 0.3 }
                }
              />
            ))}
          </div>
        </div>
        <p className={styles.voiceScript}>
          {words.map((w, i) => (
            <span
              key={i}
              className={`${styles.voiceWord} ${i === activeIndex ? styles.voiceWordActive : ""}`}
            >
              {w.word}{" "}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

function PeakSection({ onRevealed }: { onRevealed?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);

  const textRef = useRef<HTMLParagraphElement>(null);
  const inView = useInView(textRef, { once: true, amount: 0.7 });

  // Keep the latest callback in a ref so the effect only depends on `inView` —
  // `onRevealed` is a new function identity on every parent render (it closes
  // over playChime), and including it in the deps would re-fire the chime any
  // time the parent re-renders after the peak was already revealed.
  const onRevealedRef = useRef(onRevealed);
  onRevealedRef.current = onRevealed;

  useEffect(() => {
    if (inView) onRevealedRef.current?.();
  }, [inView]);

  const words = PEAK_TEXT.split(" ");

  return (
    <div ref={ref} className={styles.pinOuter} style={{ height: "260vh" }}>
      <div className={styles.pinInner}>
        <motion.p ref={textRef} className={styles.peakLine} style={{ opacity }}>
          {words.map((w, i) => (
            <motion.span
              key={i}
              className={styles.peakWord}
              initial={{ opacity: 0, y: 14, filter: "blur(3px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
              transition={{ duration: 0.6, delay: i * 0.09 }}
            >
              {w}
              {" "}
            </motion.span>
          ))}
        </motion.p>
      </div>
    </div>
  );
}

/* ================= embers background ================= */

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  color: string;
  alpha: number;
}

function useEmbers(canvasRef: RefObject<HTMLCanvasElement | null>, reduced: boolean) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    function resize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["240,168,58", "226,137,106", "246,239,228"];
    function makeParticle(): Particle {
      return {
        x: Math.random() * width,
        y: height + Math.random() * 60,
        r: 0.8 + Math.random() * 1.8,
        speed: 0.18 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.15 + Math.random() * 0.35,
      };
    }

    const count = reduced ? 0 : window.innerWidth < 640 ? 26 : 46;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const p = makeParticle();
      p.y = Math.random() * height;
      particles.push(p);
    }

    let raf = 0;
    function tick() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speed;
        p.phase += 0.02;
        p.x += Math.sin(p.phase) * p.drift;
        if (p.y < -10) {
          Object.assign(p, makeParticle());
          p.y = height + 10;
        }
        const flicker = 0.6 + Math.sin(p.phase * 2) * 0.4;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color},${p.alpha * flicker})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    if (!reduced && count > 0) raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [canvasRef, reduced]);
}

/* ================= main experience ================= */

export default function AppreciationExperience() {
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced === true;

  const [stage, setStage] = useState<"gate" | "reading">("gate");
  const [sealCracked, setSealCracked] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEmbers(canvasRef, reduced);

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
    notes.forEach((f, i) => playNote(f, now + i * 0.52, 1.5, 0.042, reverbSend));
    loopTimerRef.current = window.setTimeout(scheduleMotif, 5400);
  }

  function startMusic() {
    if (musicStartedRef.current) return;
    musicStartedRef.current = true;
    try {
      const AudioCtxClass =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const nd = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) nd[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 2200;
      noiseFilter.Q.value = 0.5;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.008;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();

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

  useEffect(() => {
    return () => {
      if (loopTimerRef.current) window.clearTimeout(loopTimerRef.current);
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  function openEnvelope() {
    if (sealCracked) return;
    setSealCracked(true);
    startMusic();
    window.setTimeout(() => setFlapOpen(true), reduced ? 50 : 350);
    window.setTimeout(() => setStage("reading"), reduced ? 200 : 2000);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        <canvas ref={canvasRef} className={styles.embers} />
        <div className={styles.vignette} />

        <button
          className={styles.soundToggle}
          onClick={toggleMusic}
          aria-label={musicOn ? "Mute music" : "Play music"}
          aria-pressed={musicOn}
          style={{
            opacity: stage === "reading" ? 1 : 0,
            pointerEvents: stage === "reading" ? "auto" : "none",
            transition: "opacity 0.5s ease",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M4 9v6h4l5 5V4L8 9H4z" />
            <path d="M16.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 6a9 9 0 0 1 0 12" />
          </svg>
        </button>

        <AnimatePresence>
          {stage === "gate" && (
            <motion.div
              className={styles.gate}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.2 : 1 }}
            >
              <p className={styles.gateCaption}>a letter, kept for five years</p>
              <h1 className={styles.gateName}>Chinni</h1>
              <div className={styles.envelope}>
                <div className={styles.envBody} />
                <motion.div
                  className={styles.envFlap}
                  style={{ transformOrigin: "50% 0%" }}
                  animate={{ rotateX: flapOpen ? -165 : 0 }}
                  transition={{ duration: reduced ? 0.2 : 1.1, ease: [0.6, 0, 0.3, 1] }}
                >
                  <div
                    className={styles.envSealWrap}
                    role="button"
                    tabIndex={0}
                    aria-label="Break the wax seal and open the letter"
                    onClick={openEnvelope}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openEnvelope();
                      }
                    }}
                  >
                    <motion.span
                      className={`${styles.sealHalf} ${styles.sealHalfL}`}
                      animate={
                        sealCracked
                          ? { x: -14, y: 4, rotate: -18, opacity: 0 }
                          : { x: 0, y: 0, rotate: 0, opacity: 1 }
                      }
                      transition={{ duration: reduced ? 0.2 : 0.7 }}
                    />
                    <motion.span
                      className={`${styles.sealHalf} ${styles.sealHalfR}`}
                      animate={
                        sealCracked
                          ? { x: 14, y: -4, rotate: 18, opacity: 0 }
                          : { x: 0, y: 0, rotate: 0, opacity: 1 }
                      }
                      transition={{ duration: reduced ? 0.2 : 0.7 }}
                    />
                    <span className={styles.envSealMark}>E</span>
                  </div>
                </motion.div>
              </div>
              <button className={styles.gateBtn} onClick={openEnvelope} disabled={sealCracked}>
                break the seal
              </button>
              <p className={styles.gateHint}>best with sound on, and five quiet minutes</p>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === "reading" && (
          <>
            <div className={styles.scrollDoc}>
              <HeroSection reduced={reduced} />
              <WhySection />
              <QuotesSection />
              <GallerySection />
            </div>
            <VoiceSection />
            <div className={styles.scrollDoc}>
              <PeakSection onRevealed={playChime} />
            </div>
            <div className={styles.closingSection}>
              <div className={styles.divider} />
              <p className={styles.closingLine}>Happy five years, Chinni.</p>
              <p className={styles.closingSub}>Here&rsquo;s to the ones we haven&rsquo;t lived yet.</p>
              <p className={styles.signature}>Always yours, and completely.</p>
              <p className={styles.footerNote}>written on a quiet evening &middot; 16 July 2026</p>
            </div>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
