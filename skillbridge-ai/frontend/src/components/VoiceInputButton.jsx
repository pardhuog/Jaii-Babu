import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, AlertCircle, WifiOff, Volume2, RefreshCw, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en-IN', label: 'English', flag: '🇮🇳', short: 'EN' },
  { code: 'hi-IN', label: 'हिंदी',    flag: '🇮🇳', short: 'हि' },
  { code: 'te-IN', label: 'తెలుగు',   flag: '🇮🇳', short: 'TE' },
];

const SILENCE_TIMEOUT = 4000; // ms of silence before auto-stop

const isSupported = typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export default function VoiceInputButton({
  onTranscript,
  onInterimTranscript,
  size = 'md',
  className = '',
  initialLang = 'en-IN',
}) {
  const [listening, setListening]       = useState(false);
  const [langCode, setLangCode]         = useState(initialLang);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [interim, setInterim]           = useState('');
  const [error, setError]               = useState(null); // null | 'blocked' | 'unsupported' | 'no-speech' | 'network'
  const [transcript, setTranscript]     = useState('');

  const recognitionRef  = useRef(null);
  const silenceTimerRef = useRef(null);

  const selectedLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  };

  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      recognitionRef.current?.stop();
    }, SILENCE_TIMEOUT);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) { setError('unsupported'); return; }
    setError(null);
    setInterim('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang             = langCode;
    recognition.continuous       = true;
    recognition.interimResults   = true;
    recognition.maxAlternatives  = 1;

    recognition.onstart = () => {
      setListening(true);
      startSilenceTimer();
    };

    recognition.onspeechstart = () => {
      clearSilenceTimer(); // reset on new speech
    };

    recognition.onspeechend = () => {
      startSilenceTimer(); // start countdown from last word
    };

    recognition.onresult = (e) => {
      clearSilenceTimer();
      startSilenceTimer();
      let interimText = '';
      let finalText   = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + ' ';
        else interimText += t;
      }
      setInterim(interimText);
      onInterimTranscript?.(interimText);
      if (finalText) {
        setTranscript(prev => prev + finalText);
        onTranscript?.(finalText.trim());
        setInterim('');
      }
    };

    recognition.onerror = (e) => {
      clearSilenceTimer();
      setListening(false);
      if (e.error === 'not-allowed')    setError('blocked');
      else if (e.error === 'no-speech') setError('no-speech');
      else if (e.error === 'network')   setError('network');
      else setError('unsupported');
    };

    recognition.onend = () => {
      clearSilenceTimer();
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [langCode, onTranscript, onInterimTranscript, startSilenceTimer]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    recognitionRef.current?.stop();
    setListening(false);
    setInterim('');
  }, []);

  useEffect(() => () => { clearSilenceTimer(); recognitionRef.current?.abort(); }, []);

  /* Size variants */
  const sizes = { sm: 'w-9 h-9', md: 'w-11 h-11', lg: 'w-14 h-14' };
  const iconSz = { sm: 15,       md: 18,           lg: 22 }[size];

  const ERROR_CONFIGS = {
    blocked:    { icon: <MicOff size={14} className="text-g-red-500" />,   msg: 'Microphone blocked — allow access in browser settings' },
    unsupported:{ icon: <WifiOff size={14} className="text-g-text-3" />,   msg: 'Voice input not supported. Use Chrome browser.' },
    'no-speech':{ icon: <Volume2 size={14} className="text-g-yellow-500"/>, msg: 'No speech detected. Please try again.' },
    network:    { icon: <AlertCircle size={14} className="text-g-red-500"/>,msg: 'Network error. Check your connection.' },
  };

  return (
    <div className={clsx('flex flex-col items-center gap-2', className)}>
      <div className="flex items-center gap-2">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(v => !v)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-g-border bg-g-surface text-xs font-medium text-g-text-2 hover:border-g-blue-500 hover:text-g-blue-500 transition-all"
          >
            {selectedLang.flag} {selectedLang.short}
            <ChevronDown size={10} className={clsx('transition-transform', showLangMenu && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-2 left-0 bg-g-surface border border-g-border rounded-xl shadow-google-md overflow-hidden z-50 min-w-[130px]"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLangCode(lang.code); setShowLangMenu(false); }}
                    className={clsx(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-g-bg',
                      langCode === lang.code ? 'text-g-blue-500 font-medium bg-g-blue-50' : 'text-g-text'
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main mic button */}
        <div className="relative flex items-center justify-center">
          {/* Pulse rings when active */}
          {listening && (
            <>
              <span className="absolute inline-flex h-full w-full rounded-full bg-g-red-500 opacity-20 animate-ping" />
              <span className="absolute inline-flex h-full w-full rounded-full bg-g-red-500 opacity-10 animate-ping" style={{ animationDelay: '0.3s' }} />
            </>
          )}
          <button
            onClick={listening ? stopListening : startListening}
            className={clsx(
              sizes[size],
              'relative rounded-full flex items-center justify-center transition-all duration-300 select-none',
              listening
                ? 'bg-g-red-500 shadow-lg scale-110'
                : 'bg-g-blue-500 hover:bg-g-blue-600 hover:scale-105 shadow-google',
              !isSupported && 'opacity-50 cursor-not-allowed'
            )}
            title={listening ? `Stop (auto-stops after ${SILENCE_TIMEOUT/1000}s silence)` : 'Start voice input'}
            disabled={!isSupported}
          >
            {listening
              ? <MicOff size={iconSz} className="text-white" />
              : <Mic size={iconSz} className="text-white" />
            }
          </button>
        </div>
      </div>

      {/* Waveform animation */}
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-end gap-0.5 h-6"
          >
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`waveform-bar waveform-bar-${i + 1}`}
                style={{ height: `${12 + Math.random() * 10}px` }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interim ghost text */}
      <AnimatePresence>
        {interim && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-g-text-3 italic text-center max-w-[200px] leading-tight"
          >
            "{interim}…"
          </motion.p>
        )}
      </AnimatePresence>

      {/* Status hint */}
      {!listening && !error && !interim && (
        <p className="text-[10px] text-g-text-3 text-center">
          {isSupported ? `Speak in ${selectedLang.label} · auto-stops after ${SILENCE_TIMEOUT/1000}s` : 'Use Chrome for voice'}
        </p>
      )}

      {/* Error states */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 max-w-[220px]"
          >
            {ERROR_CONFIGS[error]?.icon}
            <div>
              <p className="text-[10px] text-g-red-600 leading-tight">{ERROR_CONFIGS[error]?.msg}</p>
              {error !== 'unsupported' && (
                <button
                  onClick={() => { setError(null); startListening(); }}
                  className="text-[10px] text-g-blue-500 font-medium mt-1 flex items-center gap-0.5 hover:underline"
                >
                  <RefreshCw size={9} /> Retry
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
