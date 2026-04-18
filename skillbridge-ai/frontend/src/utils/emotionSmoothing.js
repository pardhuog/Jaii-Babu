/**
 * emotionSmoothing.js
 * ──────────────────────────────────────────────────────────────
 * Exponential Moving Average (EMA) smoother for face-api emotion
 * scores.  Eliminates per-frame "fluttering" in the UI.
 *
 * Usage:
 *   const smoother = createEmotionSmoother();
 *   smoother.push(rawScores);          // call from detection loop
 *   const stable = smoother.get();     // read stable averaged value
 */

const EMOTION_KEYS = ['confidence', 'smile', 'engagement', 'eyeContact', 'nervousness'];

/**
 * EMA alpha — controls how quickly the average adapts.
 * Lower = smoother but slower.  0.10 ≈ "last 20 frames".
 */
const EMA_ALPHA = 0.10;

/**
 * createEmotionSmoother()
 * Returns a stateful smoother object to be held in a ref.
 */
export function createEmotionSmoother(alpha = EMA_ALPHA) {
  let ema = { confidence: 65, smile: 50, engagement: 60, eyeContact: 70, nervousness: 20 };
  let lastPushTime = 0;

  return {
    /** Push a new raw frame. Returns new EMA. */
    push(raw) {
      if (!raw) return ema;
      EMOTION_KEYS.forEach(k => {
        const v = typeof raw[k] === 'number' ? raw[k] : ema[k];
        ema[k] = Math.round(alpha * v + (1 - alpha) * ema[k]);
      });
      lastPushTime = Date.now();
      return { ...ema };
    },

    /** Returns current stable EMA snapshot. */
    get() {
      return { ...ema };
    },

    /** Seed with known starting values (e.g. on camera restart). */
    seed(values) {
      EMOTION_KEYS.forEach(k => {
        if (typeof values[k] === 'number') ema[k] = values[k];
      });
    },

    /** Ms since last push (used to detect stale data). */
    msSinceLastPush() {
      return lastPushTime ? Date.now() - lastPushTime : Infinity;
    },
  };
}

/**
 * useEmotionSmoothing()
 * React hook that wraps createEmotionSmoother.
 *
 * Returns:
 *   { push, stableScores, resetSmoother }
 *
 * stableScores is only updated in React state every `debounceMs`
 * (default 300 ms), completely decoupling the 30fps detection
 * loop from React renders.
 */
import { useRef, useState, useEffect, useCallback } from 'react';

export function useEmotionSmoothing({ debounceMs = 300, alpha = EMA_ALPHA } = {}) {
  const smootherRef = useRef(createEmotionSmoother(alpha));
  const timerRef    = useRef(null);
  const [stableScores, setStableScores] = useState(smootherRef.current.get());

  // Flush EMA into React state at most once every debounceMs
  const scheduleFlush = useCallback(() => {
    if (timerRef.current) return;           // already scheduled
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setStableScores(smootherRef.current.get());
    }, debounceMs);
  }, [debounceMs]);

  /** Call this from your detection loop with raw frame scores. */
  const push = useCallback((rawScores) => {
    smootherRef.current.push(rawScores);
    scheduleFlush();
  }, [scheduleFlush]);

  /** Reset the smoother (e.g. on camera restart). */
  const resetSmoother = useCallback((seed) => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    smootherRef.current = createEmotionSmoother(alpha);
    if (seed) smootherRef.current.seed(seed);
    setStableScores(smootherRef.current.get());
  }, [alpha]);

  // Cleanup debounce on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { push, stableScores, resetSmoother };
}
