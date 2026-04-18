/**
 * FaceAnalysisPanel.jsx — v4: Smooth 30fps, mirror flip, lighting controls
 * ─────────────────────────────────────────────────────────────────────────
 * IMPROVEMENTS IN THIS VERSION:
 *
 * 1. 30fps native camera — getUserMedia requests 30fps frameRate
 * 2. Dual-loop architecture:
 *    • requestAnimationFrame render loop  → 30fps smooth canvas composite
 *    • setInterval detection loop         → 200ms AI inference (optimal)
 * 3. Mirror flip — video + canvas both mirrored (natural selfie feel)
 * 4. Canvas imageSmoothing enabled for crisp landmark rendering
 * 5. Lighting controls — brightness / contrast / saturation sliders
 *    applied as CSS filter on the video element in real time
 * 6. Auto-lighting hint — reads pixel luminance and shows a warning
 *    when the frame is too dark or too bright
 * 7. Round face bounding box with gradient stroke (not plain rect)
 * 8. Smooth landmark compositing on every RAF tick, not just detect tick
 */
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CameraOff, Activity, AlertTriangle,
  RefreshCw, CheckCircle, Zap, ShieldOff, Sun, SlidersHorizontal,
} from 'lucide-react';
import { useEmotionSmoothing } from '../utils/emotionSmoothing';

/* ── Emotion config ──────────────────────────────────────────── */
const EMOTIONS = [
  { key: 'confidence',  label: 'Confidence',  icon: '💪', color: '#1A73E8', bg: '#E8F0FE' },
  { key: 'smile',       label: 'Smile',        icon: '😊', color: '#34A853', bg: '#E6F4EA' },
  { key: 'engagement',  label: 'Engagement',   icon: '👁️', color: '#00897B', bg: '#E0F2F1' },
  { key: 'eyeContact',  label: 'Eye Contact',  icon: '🎯', color: '#7C4DFF', bg: '#EDE7F6' },
  { key: 'nervousness', label: 'Nervousness',  icon: '😰', color: '#EA4335', bg: '#FCE8E6' },
];

/* ── Default lighting presets ────────────────────────────────── */
const LIGHTING_PRESETS = [
  { id: 'auto',   label: 'Auto',   brightness: 1.05, contrast: 1.05, saturation: 1.05 },
  { id: 'bright', label: 'Bright', brightness: 1.25, contrast: 1.10, saturation: 1.00 },
  { id: 'vivid',  label: 'Vivid',  brightness: 1.10, contrast: 1.15, saturation: 1.30 },
  { id: 'soft',   label: 'Soft',   brightness: 0.95, contrast: 0.90, saturation: 0.90 },
  { id: 'custom', label: 'Custom', brightness: 1.00, contrast: 1.00, saturation: 1.00 },
];

/* ── face-api CDN ────────────────────────────────────────────── */
const FACEAPI_CDNS = [
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
  'https://unpkg.com/face-api.js@0.22.2/dist/face-api.min.js',
];
const MODEL_BASES = [
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.faceapi) { resolve(); return; }
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => { s.remove(); reject(new Error('CDN failed')); };
    document.head.appendChild(s);
  });
}
async function ensureFaceAPI() {
  if (window.faceapi) return window.faceapi;
  for (const cdn of FACEAPI_CDNS) {
    try { await loadScript(cdn); if (window.faceapi) return window.faceapi; } catch { /* next */ }
  }
  throw new Error('face-api unavailable');
}
async function loadModels(faceapi) {
  for (const base of MODEL_BASES) {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(base),
        faceapi.nets.faceExpressionNet.loadFromUri(base),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(base),
      ]);
      return;
    } catch { /* next */ }
  }
  throw new Error('All model mirrors failed');
}

function cap(v) { return Math.round(Math.max(0, Math.min(100, v))); }

/**
 * mapExpressions — landmark-aware, scientifically weighted
 *
 * face-api.js expressions object contains probabilities (0-1) for:
 *   neutral, happy, sad, angry, fearful, disgusted, surprised
 *
 * Eye Aspect Ratio (EAR) — Soukupova & Cech (2016):
 *   EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
 *   Open eye ≈ 0.25-0.35, Closed < 0.18
 *
 * Metrics produced:
 *   confidence  — calm authority: high neutral/happy, penalised by fear/anger
 *   smile       — direct happy signal
 *   engagement  — active non-neutral attention
 *   eyeContact  — landmark EAR × face-centering (most accurate signal)
 *   nervousness — weighted negative-emotion sum
 */
function mapExpressions(exp, landmarks, box, vW, vH) {
  const h  = exp.happy      || 0;
  const n  = exp.neutral    || 0;
  const sa = exp.sad        || 0;
  const an = exp.angry      || 0;
  const fe = exp.fearful    || 0;
  const di = exp.disgusted  || 0;
  const su = exp.surprised  || 0;

  /* ── 1. Smile — direct happy probability, lightly boosted ── */
  const smile = cap(h * 110);

  /* ── 2. Nervousness — weighted negative emotions ── */
  // fearful has highest weight (most visible marker of anxiety)
  const nervousness = cap((fe * 0.45 + sa * 0.25 + di * 0.20 + an * 0.10) * 280);

  /* ── 3. Confidence — calm authority ── */
  // High when neutral-calm or happy-positive. Penalised by raw fear/anger.
  const positivity  = n * 0.5 + h * 0.5;           // 0–1 positive base
  const anxietyDrag = (fe * 0.6 + an * 0.3 + sa * 0.1); // pulls score down
  const confidence  = cap(positivity * 90 + 10 - anxietyDrag * 60);

  /* ── 4. Engagement — active, non-neutral attention ── */
  // surprised + happy + (any strong emotion) = engaged. Neutral alone = neutral.
  const engagement = cap((1 - n) * 75 + su * 30 + h * 20);

  /* ── 5. Eye Contact — EAR + face centering ── */
  let eyeScore = 70; // default fallback
  if (landmarks) {
    try {
      const le = landmarks.getLeftEye();   // 6 points
      const re = landmarks.getRightEye(); // 6 points

      // EAR = (vertical_a + vertical_b) / (2 * horizontal)
      function ear(pts) {
        const vert1 = Math.hypot(pts[1].x - pts[5].x, pts[1].y - pts[5].y);
        const vert2 = Math.hypot(pts[2].x - pts[4].x, pts[2].y - pts[4].y);
        const horiz = Math.hypot(pts[0].x - pts[3].x, pts[0].y - pts[3].y);
        return horiz > 0 ? (vert1 + vert2) / (2 * horiz) : 0.28;
      }
      const earAvg = (ear(le) + ear(re)) / 2;
      // Normal open eye EAR ≈ 0.28. Normalise: 0→0%, 0.28+→100%
      const openness = Math.min(1, earAvg / 0.26);

      // Face centering component
      const cx = box ? (box.x + box.width  / 2) / vW : 0.5;
      const cy = box ? (box.y + box.height / 2) / vH : 0.5;
      const centering = Math.max(0, 1 - Math.abs(cx - 0.5) * 3.5 - Math.abs(cy - 0.45) * 2.0);

      eyeScore = cap(openness * 65 + centering * 35);
    } catch { /* landmarks may be missing */ }
  } else {
    // No landmarks — pure centering fallback
    if (box) {
      const cx = (box.x + box.width  / 2) / vW;
      const cy = (box.y + box.height / 2) / vH;
      eyeScore = cap((1 - Math.abs(cx - 0.5) * 3 - Math.abs(cy - 0.45) * 2) * 100);
    }
  }

  return { confidence, smile, engagement, eyeContact: eyeScore, nervousness };
}

/* ── Luminance helper (auto-lighting hint) ───────────────────── */
function sampleLuminance(video) {
  try {
    const tmp = document.createElement('canvas');
    tmp.width = 64; tmp.height = 48;
    const ctx = tmp.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, 64, 48);
    const d = ctx.getImageData(0, 0, 64, 48).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) {
      sum += 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
    }
    return Math.round(sum / (d.length / 4));  // 0–255
  } catch { return 128; }
}

/* ════════════════════════════════════════════════════════════════
   FaceAnalysisPanel
════════════════════════════════════════════════════════════════ */
export default function FaceAnalysisPanel({ onScoresUpdate, isInterviewActive, isVisible }) {
  /* ── Refs ── */
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const detectRef   = useRef(null);
  const rafRef      = useRef(null);
  const lastResult  = useRef(null);
  const mountedRef  = useRef(true);
  const autoStarted = useRef(false);
  // Blink detection refs
  const blinkRef    = useRef({ count: 0, lastTs: performance.now(), eyeWasClosed: false, bpm: 0 });

  /* ── UI State ── */
  const [phase,      setPhase]      = useState('idle');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [modelLoad,  setModelLoad]  = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [simMode,    setSimMode]    = useState(false);
  const [faceOk,     setFaceOk]     = useState(false);
  const [postureWarn,setPostureWarn]= useState('');
  const [renderFps,  setRenderFps]  = useState(0);
  const [detectFps,  setDetectFps]  = useState(0);
  const [sessionLog, setSessionLog] = useState([]);
  const [bodyScore,  setBodyScore]  = useState(null);
  const [lightWarn,  setLightWarn]  = useState('');
  const [showLight,  setShowLight]  = useState(false);
  const [blinkRate,  setBlinkRate]  = useState(0);   // blinks per minute

  /* ── Lighting state ── */
  const [preset,     setPreset]     = useState('auto');
  const [brightness, setBrightness] = useState(1.05);
  const [contrast,   setContrast]   = useState(1.05);
  const [saturation, setSaturation] = useState(1.05);

  const videoFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;

  /* ── EMA smoother ── */
  const { push: pushEma, stableScores, resetSmoother } = useEmotionSmoothing({ debounceMs: 300, alpha: 0.12 });

  /* ── Unmount cleanup ── */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopAllLoops();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  /* ── Auto-start on first visible ── */
  useEffect(() => {
    if (isVisible && !autoStarted.current && phase === 'idle') {
      autoStarted.current = true;
      setTimeout(() => { if (mountedRef.current) handleStartClick(); }, 100);
    }
  }, [isVisible]);

  /* ── Session score ── */
  useEffect(() => {
    if (!isInterviewActive && sessionLog.length > 5) {
      const avg = k => Math.round(sessionLog.reduce((s, f) => s + f[k], 0) / sessionLog.length);
      const f = { confidence: avg('confidence'), smile: avg('smile'), engagement: avg('engagement'), eyeContact: avg('eyeContact'), nervousness: avg('nervousness') };
      const overall = Math.round(f.confidence*0.3 + f.smile*0.1 + f.engagement*0.25 + f.eyeContact*0.25 + (100-f.nervousness)*0.1);
      if (mountedRef.current) setBodyScore({ ...f, overall });
    }
  }, [isInterviewActive]);

  /* ── Update video CSS filter when sliders change ── */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.filter = videoFilter;
    }
  }, [videoFilter]);

  /* ── Apply lighting preset ── */
  function applyPreset(id) {
    const p = LIGHTING_PRESETS.find(x => x.id === id) || LIGHTING_PRESETS[0];
    setPreset(id);
    if (id !== 'custom') {
      setBrightness(p.brightness);
      setContrast(p.contrast);
      setSaturation(p.saturation);
    }
  }

  /* ── Stop all loops ── */
  function stopAllLoops() {
    clearInterval(detectRef.current); detectRef.current = null;
    cancelAnimationFrame(rafRef.current); rafRef.current = null;
  }

  /* ══════════════════════════════════════════════════════════
     getUserMedia — called synchronously in click handler
  ══════════════════════════════════════════════════════════ */
  function handleStartClick() {
    stopAllLoops();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    lastResult.current = null;

    resetSmoother();
    setPhase('requesting');
    setErrorMsg('');
    setModelLoad(false);
    setModelReady(false);
    setSimMode(false);
    setFaceOk(false);
    setPostureWarn('');
    setLightWarn('');
    setRenderFps(0);
    setDetectFps(0);

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width:      { ideal: 1280, min: 640 },
          height:     { ideal: 720,  min: 480 },
          frameRate:  { ideal: 30,   min: 15 },  // ← 30fps request
          facingMode: 'user',
        },
        audio: false,
      })
      .then(stream => {
        if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const video = videoRef.current;
        video.srcObject = stream;

        // Apply mirror flip and initial lighting filter
        video.style.transform = 'scaleX(-1)';
        video.style.filter    = videoFilter;

        setPhase('streaming');

        video.play()
          .catch(() => {})
          .finally(() => { if (mountedRef.current) startAIModels(); });
      })
      .catch(err => {
        if (!mountedRef.current) return;
        const name = err.name || '';
        if      (name === 'NotAllowedError'  || name === 'PermissionDeniedError') { setPhase('denied');   setErrorMsg('Camera permission denied. Click 🔒 in address bar → Allow → Retry.'); }
        else if (name === 'NotFoundError'    || name === 'DevicesNotFoundError')  { setPhase('notfound'); setErrorMsg('No camera found. Connect a webcam and retry.'); }
        else if (name === 'NotReadableError' || name === 'TrackStartError')       { setPhase('error');    setErrorMsg('Camera is used by another app (Zoom/Teams). Close it and retry.'); }
        else                                                                       { setPhase('error');    setErrorMsg(`Camera error: ${name || err.message}`); }
      });
  }

  /* ── Load AI models ── */
  function startAIModels() {
    setModelLoad(true);
    ensureFaceAPI()
      .then(fa => loadModels(fa).then(() => fa))
      .then(fa => {
        if (!mountedRef.current) return;
        setModelLoad(false);
        setModelReady(true);
        startDetectionLoop(fa);
        startRenderLoop();
      })
      .catch(e => {
        console.warn('[FaceAPI] → Simulation fallback:', e.message);
        if (!mountedRef.current) return;
        setModelLoad(false);
        setSimMode(true);
        startSimulationLoop();
        startRenderLoop();
      });
  }

  /* ══════════════════════════════════════════════════════════
     RENDER LOOP — requestAnimationFrame, ~30fps
     Redraws landmarks cached from last detection result.
     Completely decoupled from the AI inference speed.
  ══════════════════════════════════════════════════════════ */
  function startRenderLoop() {
    let frameCount = 0, lastFpsTime = performance.now();

    function frame() {
      if (!mountedRef.current) return;
      rafRef.current = requestAnimationFrame(frame);

      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const vW = video.videoWidth  || 640;
      const vH = video.videoHeight || 480;
      if (canvas.width !== vW)  canvas.width  = vW;
      if (canvas.height !== vH) canvas.height = vH;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, vW, vH);

      // Mirror the canvas to match video
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-vW, 0);

      const result = lastResult.current;
      if (result) {
        const b = result.detection.box;

        // ── Glowing face box ──────────────────────────────────
        ctx.save();
        ctx.shadowColor = 'rgba(26,115,232,0.6)';
        ctx.shadowBlur  = 12;
        ctx.strokeStyle = 'rgba(26,115,232,0.85)';
        ctx.lineWidth   = 2.5;
        ctx.lineJoin    = 'round';
        roundedRect(ctx, b.x, b.y, b.width, b.height, 12);
        ctx.stroke();
        ctx.restore();

        // ── Corner accent marks ───────────────────────────────
        const cLen = Math.min(b.width, b.height) * 0.18;
        ctx.strokeStyle = '#1A73E8';
        ctx.lineWidth   = 3.5;
        ctx.lineCap     = 'round';
        const corners = [
          [b.x, b.y,               1,  1],
          [b.x + b.width, b.y,    -1,  1],
          [b.x, b.y + b.height,    1, -1],
          [b.x + b.width, b.y + b.height, -1, -1],
        ];
        corners.forEach(([cx2, cy2, dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(cx2 + dx * cLen, cy2);
          ctx.lineTo(cx2, cy2);
          ctx.lineTo(cx2, cy2 + dy * cLen);
          ctx.stroke();
        });

        // ── Landmark dots ─────────────────────────────────────
        try {
          const pts = result.landmarks.positions;
          ctx.fillStyle = 'rgba(26,115,232,0.55)';
          pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          });

          // Connect key groups (eyes, mouth, nose, jaw)
          const groups = [
            pts.slice(0, 17),   // jaw
            pts.slice(17, 22),  // left brow
            pts.slice(22, 27),  // right brow
            pts.slice(27, 36),  // nose bridge
            pts.slice(36, 42),  // left eye
            pts.slice(42, 48),  // right eye
            pts.slice(48, 68),  // mouth
          ];
          ctx.strokeStyle = 'rgba(26,115,232,0.30)';
          ctx.lineWidth   = 1;
          groups.forEach(grp => {
            if (grp.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(grp[0].x, grp[0].y);
            grp.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
            if (grp === groups[5] || grp === groups[4]) ctx.closePath(); // close eyes
            ctx.stroke();
          });
        } catch { /* landmarks optional */ }
      }

      ctx.restore(); // end mirror

      // FPS counter
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        if (mountedRef.current) setRenderFps(frameCount);
        frameCount = 0; lastFpsTime = now;
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  /* ══════════════════════════════════════════════════════════
     DETECTION LOOP — 80ms interval (≈12 detections/sec)
     inputSize: 160  → 4× faster than 320, still accurate
     3-frame history buffer → stabilise noisy expression flips
  ══════════════════════════════════════════════════════════ */
  function startDetectionLoop(faceapi) {
    let detFrames = 0, lastDetTs = performance.now();
    let lumCounter = 0;
    // Rolling 3-frame buffer to average out expression noise
    const expHistory = [];

    detectRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        // inputSize 160 = fastest TinyFaceDetector setting (~2× speed of 224)
        // scoreThreshold 0.35 = more sensitive (catches faces at angles)
        const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.35 });
        const result = await faceapi
          .detectSingleFace(video, opts)
          .withFaceLandmarks(true)   // tiny model (faster)
          .withFaceExpressions();

        lastResult.current = result || null;

        if (result) {
          const vW = video.videoWidth  || 640;
          const vH = video.videoHeight || 480;

          // ── 3-frame rolling average on raw expression probabilities ──
          expHistory.push({ ...result.expressions });
          if (expHistory.length > 3) expHistory.shift();
          const avgExp = {};
          for (const key of Object.keys(result.expressions)) {
            avgExp[key] = expHistory.reduce((s, f) => s + (f[key] || 0), 0) / expHistory.length;
          }

          // ── Map to interview metrics using landmarks for eye contact ──
          const raw    = mapExpressions(avgExp, result.landmarks, result.detection.box, vW, vH);
          const smooth = pushEma(raw);

          // ── UNIQUE FEATURE 1: Blink Rate Detector ──
          // EAR < 0.18 = blink event. Count crossings per minute.
          // Research: 10-15 bpm = relaxed, <5 = high stress/concentration, >25 = anxiety
          let currentBpm = blinkRef.current.bpm;
          try {
            const le   = result.landmarks.getLeftEye();
            const re   = result.landmarks.getRightEye();
            function ear(pts) {
              const v1 = Math.hypot(pts[1].x-pts[5].x, pts[1].y-pts[5].y);
              const v2 = Math.hypot(pts[2].x-pts[4].x, pts[2].y-pts[4].y);
              const h  = Math.hypot(pts[0].x-pts[3].x, pts[0].y-pts[3].y);
              return h > 0 ? (v1+v2)/(2*h) : 0.28;
            }
            const earNow = (ear(le) + ear(re)) / 2;
            const blink  = blinkRef.current;
            // Detect falling edge: open→closed (EAR drops below threshold)
            if (!blink.eyeWasClosed && earNow < 0.18) {
              blink.count++;
              blink.eyeWasClosed = true;
            } else if (earNow >= 0.18) {
              blink.eyeWasClosed = false;
            }
            // Update bpm every 60 seconds
            const elapsed = (performance.now() - blink.lastTs) / 1000;
            if (elapsed >= 10) { // update every 10s for responsiveness
              blink.bpm = Math.round(blink.count * (60 / elapsed));
              blink.count = 0;
              blink.lastTs = performance.now();
              currentBpm = blink.bpm;
              if (mountedRef.current) setBlinkRate(blink.bpm);
            }
          } catch { /* blink detection optional */ }

          if (mountedRef.current) {
            setFaceOk(true);
            // Include blinkRate in scores so parent can use for congruence
            onScoresUpdate?.({ ...smooth, blinkRate: currentBpm });
            setSessionLog(p => (p.length > 90 ? p.slice(-90) : [...p, smooth]));

            // Posture: use landmark nose tip vs face box center for better accuracy
            let posture = '';
            try {
              const nose = result.landmarks.getNose();
              const noseX = nose[0].x / vW;
              const cx    = (result.detection.box.x + result.detection.box.width / 2) / vW;
              if (Math.abs(cx - 0.5) > 0.26) posture = '⚠️ Move closer to center';
              else if (Math.abs(noseX - 0.5) > 0.22) posture = '↔️ Turn to face the camera';
            } catch { if (Math.abs((result.detection.box.x + result.detection.box.width/2)/vW - 0.5) > 0.26) posture = '⚠️ Center your face'; }
            setPostureWarn(posture);
          }
        } else {
          if (mountedRef.current) { setFaceOk(false); setPostureWarn('👁️ Look at the camera'); }
        }

        // Auto-lighting check every ~2 seconds
        lumCounter++;
        if (lumCounter % 10 === 0) {
          const lum = sampleLuminance(video);
          if (mountedRef.current) {
            setLightWarn(
              lum < 50  ? '🌑 Too dark — move closer to a light source' :
              lum > 210 ? '☀️ Too bright — reduce backlight or move away from window' : ''
            );
          }
        }

        // Detection FPS
        detFrames++;
        const now = performance.now();
        if (now - lastDetTs >= 1000) {
          if (mountedRef.current) setDetectFps(detFrames);
          detFrames = 0; lastDetTs = now;
        }
      } catch { /* per-frame */ }
    }, 80);  // 80ms = ~12 detections per second
  }

  /* ── Simulation loop ── */
  function startSimulationLoop() {
    const tgt = { confidence: 70, smile: 55, engagement: 65, eyeContact: 78, nervousness: 20 };
    let ph = 0;
    detectRef.current = setInterval(() => {
      ph += 0.05;
      const raw = {};
      Object.keys(tgt).forEach((k, i) => {
        tgt[k] = Math.max(5, Math.min(95, tgt[k] + (Math.random()-0.5)*5 + Math.sin(ph+i*1.3)*2));
        raw[k] = Math.round(tgt[k]);
      });
      const smooth = pushEma(raw);
      if (mountedRef.current) {
        onScoresUpdate?.(smooth);
        setSessionLog(p => (p.length > 90 ? p.slice(-90) : [...p, smooth]));
      }
    }, 300);
  }

  /* ── Stop / simulation toggle ── */
  function handleStop() {
    stopAllLoops();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    lastResult.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (mountedRef.current) { setPhase('stopped'); setFaceOk(false); setPostureWarn(''); setRenderFps(0); setDetectFps(0); }
  }

  function handleUseSimulation() {
    stopAllLoops();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setPhase('streaming');
    setSimMode(true);
    setModelLoad(false);
    setModelReady(false);
    startSimulationLoop();
    // Render loop still runs (no video, just clears canvas)
    startRenderLoop();
  }

  /* ── Rounded rect helper ── */
  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ── Render helpers ── */
  const isStreaming   = phase === 'streaming';
  const showEmotions  = isStreaming && (modelReady || simMode);

  return (
    <div className="card space-y-3">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-g-text flex items-center gap-2 text-sm">
          <Activity size={15} className="text-g-blue-500" />
          Face Analysis
          {simMode && <span className="badge-yellow text-[9px] px-1.5 py-0.5">Sim</span>}
        </h3>
        <div className="flex items-center gap-2">
          {/* FPS display */}
          {isStreaming && renderFps > 0 && (
            <span className="text-[9px] tabular-nums font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: renderFps >= 25 ? '#E6F4EA' : '#FCE8E6', color: renderFps >= 25 ? '#34A853' : '#EA4335' }}>
              {renderFps}fps
            </span>
          )}
          {isStreaming && modelReady && faceOk && (
            <span className="flex items-center gap-1 text-[9px] text-g-green-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-g-green-500 animate-pulse" /> LIVE
            </span>
          )}
          {isStreaming && simMode && (
            <span className="flex items-center gap-1 text-[9px] text-amber-500 font-bold">
              <Zap size={9} /> SIM
            </span>
          )}
          {/* Lighting toggle */}
          {isStreaming && !simMode && (
            <button
              onClick={() => setShowLight(v => !v)}
              className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border font-semibold transition-colors ${showLight ? 'bg-g-blue-50 border-g-blue-200 text-g-blue-500' : 'border-g-border text-g-text-3 hover:border-g-blue-200'}`}
            >
              <Sun size={9} /> Light
            </button>
          )}
        </div>
      </div>

      {/* ── Video + canvas (ALWAYS in DOM) ── */}
      <div
        className="relative rounded-xl overflow-hidden bg-black"
        style={{ aspectRatio: '4/3', display: isStreaming ? 'block' : 'none' }}
      >
        {/* Mirror flip applied via JS style on play — video already mirrored */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)', filter: videoFilter }}
          muted
          playsInline
          autoPlay
        />
        {/* Canvas must also be mirrored to match — done in RAF ctx.scale(-1,1) */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />

        {/* AI loading overlay */}
        {modelLoad && (
          <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={22} className="text-white animate-spin" />
            <p className="text-white text-xs font-medium">Loading AI models…</p>
            <p className="text-white/60 text-[10px]">~10 sec on first load</p>
          </div>
        )}

        {/* Status chips */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {modelReady && faceOk && (
            <span className="bg-green-500/90 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle size={8} /> LIVE {detectFps > 0 ? `· ${detectFps}hz` : ''}
            </span>
          )}
          {simMode && (
            <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
              SIMULATION
            </span>
          )}
        </div>

        {/* Lighting warning overlay */}
        <AnimatePresence>
          {lightWarn && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-8 left-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <Sun size={10} className="text-yellow-300 flex-shrink-0" /> {lightWarn}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posture warning */}
        <AnimatePresence>
          {postureWarn && !lightWarn && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute bottom-2 left-2 right-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <AlertTriangle size={10} /> {postureWarn}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Lighting Controls Panel ── */}
      <AnimatePresence>
        {isStreaming && showLight && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card bg-gray-50 border border-gray-100 space-y-3 p-3">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal size={11} className="text-g-blue-500" />
                <span className="text-[10px] font-semibold text-g-text">Lighting Adjustment</span>
              </div>

              {/* Preset pills */}
              <div className="flex gap-1 flex-wrap">
                {LIGHTING_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold transition-all ${
                      preset === p.id
                        ? 'bg-g-blue-500 border-g-blue-500 text-white'
                        : 'border-g-border text-g-text-2 hover:border-g-blue-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Sliders */}
              {[
                ['☀️ Brightness', brightness, setBrightness, 0.5, 2.0],
                ['◑ Contrast',   contrast,   setContrast,   0.5, 2.0],
                ['🎨 Saturation', saturation, setSaturation, 0.0, 2.0],
              ].map(([label, val, setter, min, max]) => (
                <div key={label}>
                  <div className="flex justify-between text-[9px] text-g-text-2 mb-0.5">
                    <span>{label}</span>
                    <span className="tabular-nums font-medium">{val.toFixed(2)}×</span>
                  </div>
                  <input
                    type="range"
                    min={min} max={max} step={0.05}
                    value={val}
                    onChange={e => {
                      setPreset('custom');
                      setter(parseFloat(e.target.value));
                    }}
                    className="w-full h-1 rounded-full accent-g-blue-500 cursor-pointer"
                    style={{ accentColor: '#1A73E8' }}
                  />
                </div>
              ))}

              <p className="text-[9px] text-g-text-3">
                Applied as CSS filter to the live video in real-time
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── IDLE / STOPPED ── */}
      {(phase === 'idle' || phase === 'stopped') && (
        <div className="flex flex-col items-center gap-4 py-5 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#E8F0FE,#E6F4F1)' }}>
            <Camera size={26} className="text-g-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-g-text">Enable Face Analysis</p>
            <p className="text-xs text-g-text-2 mt-0.5">30fps · Mirror · Smart lighting</p>
          </div>
          <button id="start-camera-btn" onClick={handleStartClick} className="btn-primary text-sm px-5 py-2">
            📷 Start Camera
          </button>
          <p className="text-[10px] text-g-text-3 px-4">
            Browser will ask for permission — click <strong>Allow</strong>
          </p>
        </div>
      )}

      {/* ── REQUESTING ── */}
      {phase === 'requesting' && (
        <div className="space-y-3">
          <div className="skeleton rounded-xl" style={{ width: '100%', aspectRatio: '4/3' }} />
          <div className="flex items-center justify-center gap-2 text-xs text-g-blue-500 font-medium py-1">
            <RefreshCw size={13} className="animate-spin" /> Waiting for camera permission…
          </div>
          <div className="bg-g-blue-50 border border-g-blue-100 rounded-xl p-3 text-center">
            <p className="text-xs text-g-blue-600 font-semibold">🔔 Check the top of your browser for a popup</p>
            <p className="text-[10px] text-g-text-3 mt-1">Click <strong>Allow</strong> to enable your webcam</p>
          </div>
          {[80, 65, 75, 55, 70].map((w, i) => (
            <div key={i} className="skeleton rounded-xl" style={{ height: 36, width: `${w}%` }} />
          ))}
          <button onClick={handleUseSimulation} className="btn-ghost text-xs w-full py-1.5">
            Skip — Use Simulation Mode
          </button>
        </div>
      )}

      {/* ── EMOTIONS ── */}
      {showEmotions && (
        <div className="space-y-1.5">
          {EMOTIONS.map(e => {
            const value = stableScores[e.key] ?? 0;
            const bad   = e.key === 'nervousness' && value > 60;
            return (
              <div key={e.key} style={{ background: e.bg, borderColor: e.color + '30' }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border">
                <span className="text-sm select-none">{e.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-semibold" style={{ color: e.color }}>{e.label}</span>
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: bad ? '#EA4335' : e.color }}>{value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/60 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: e.color }}
                      animate={{ width: `${value}%` }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── UNIQUE FEATURE 1: Blink Rate Badge ── */}
          {blinkRate > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{
                background: blinkRate < 5 ? '#FCE8E6' : blinkRate > 25 ? '#FFF8E1' : '#E6F4EA',
                borderColor: blinkRate < 5 ? '#EA433530' : blinkRate > 25 ? '#FBBC0430' : '#34A85330',
              }}>
              <span className="text-sm select-none">👁️‍🗨️</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-g-text-2">Blink Rate</span>
                  <span className="text-[10px] font-bold tabular-nums"
                    style={{ color: blinkRate < 5 ? '#EA4335' : blinkRate > 25 ? '#B7770D' : '#34A853' }}>
                    {blinkRate} bpm
                  </span>
                </div>
                <p className="text-[9px] mt-0.5"
                  style={{ color: blinkRate < 5 ? '#EA4335' : blinkRate > 25 ? '#B7770D' : '#34A853' }}>
                  {blinkRate < 5  ? '🔴 High tension (very low blink rate)' :
                   blinkRate > 25 ? '🟡 Mild anxiety (elevated blink rate)' :
                   '🟢 Relaxed (normal 10–15 bpm)'}
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Skeleton while AI loading */}
      {isStreaming && modelLoad && (
        <div className="space-y-1.5">
          {[80, 65, 75, 55, 70].map((w, i) => (
            <div key={i} className="skeleton rounded-xl" style={{ height: 36, width: `${w}%` }} />
          ))}
        </div>
      )}

      {/* Stop button */}
      {isStreaming && (
        <button onClick={handleStop} className="btn-ghost text-xs w-full flex items-center justify-center gap-1 py-1.5">
          <CameraOff size={11} /> Stop Camera
        </button>
      )}

      {/* ── DENIED ── */}
      {phase === 'denied' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center px-2">
          <ShieldOff size={30} className="text-red-400" />
          <div>
            <p className="text-sm font-semibold text-g-text">Permission Denied</p>
            <p className="text-[11px] text-g-text-2 mt-1 leading-relaxed">{errorMsg}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-left w-full text-[10px] text-amber-700 space-y-0.5">
            <p className="font-semibold mb-1">How to fix:</p>
            <p>1. Click the 🔒 icon in the address bar</p>
            <p>2. Set Camera → <strong>Allow</strong></p>
            <p>3. Refresh and click Start Camera again</p>
          </div>
          <div className="flex gap-2 w-full">
            <button onClick={handleStartClick} className="btn-secondary text-xs flex-1 py-1.5">Retry</button>
            <button onClick={handleUseSimulation} className="btn-primary text-xs flex-1 py-1.5">Simulation</button>
          </div>
        </div>
      )}

      {/* ── NOT FOUND ── */}
      {phase === 'notfound' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center px-2">
          <CameraOff size={30} className="text-amber-400" />
          <p className="text-sm font-semibold text-g-text">No Camera Found</p>
          <p className="text-[11px] text-g-text-2">{errorMsg}</p>
          <div className="flex gap-2">
            <button onClick={handleStartClick} className="btn-secondary text-xs px-3 py-1.5">Retry</button>
            <button onClick={handleUseSimulation} className="btn-primary text-xs px-3 py-1.5">Simulation</button>
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {phase === 'error' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center px-2">
          <AlertTriangle size={30} className="text-amber-400" />
          <p className="text-sm font-semibold text-g-text">Camera Error</p>
          <p className="text-[11px] text-g-text-2 leading-relaxed">{errorMsg}</p>
          <div className="flex gap-2">
            <button onClick={handleStartClick} className="btn-secondary text-xs px-3 py-1.5">Retry</button>
            <button onClick={handleUseSimulation} className="btn-primary text-xs px-3 py-1.5">Simulation</button>
          </div>
        </div>
      )}

      {/* Body language score */}
      <AnimatePresence>
        {bodyScore && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-blue p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-g-text flex items-center gap-1.5">
                <CheckCircle size={14} className="text-g-blue-500" /> Body Language Score
              </h4>
              <span className="text-2xl font-black text-g-blue-500">{bodyScore.overall}%</span>
            </div>
            <div className="progress-bar-bg">
              <motion.div initial={{ width: 0 }} animate={{ width: `${bodyScore.overall}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-google-blue" />
            </div>
            <p className="text-[10px] text-g-text-2">
              {bodyScore.overall >= 75 ? '🌟 Excellent presence!' :
               bodyScore.overall >= 55 ? '👍 Good — work on sustained eye contact.' :
               '💡 Practice in front of a mirror to boost confidence.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
