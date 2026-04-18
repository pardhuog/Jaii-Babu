import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Brain, FileText, TrendingUp, MessageSquare,
  Mic, ArrowRight, ChevronRight, CheckCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

/* ── i18n ─────────────────────────────────────────────────── */
const CONTENT = {
  en: {
    badge: '🚀 AI-Powered Career Platform',
    headline: ['Bridge', 'the', 'Gap', 'Between'],
    headlineAccent: ['Your', 'Skills', '&', 'Dream', 'Job'],
    sub: "Intelligent job matching, AI resume builder, skill gap analyzer, and mock interview trainer — all in one platform built for India's next billion job seekers.",
    cta: 'Get Started Free',
    demo: 'Load Demo Profile',
    featuresTitle: 'Why SkillBridge AI?',
    stats: [
      { value: 2400, suffix: '+', label: 'Jobs Matched' },
      { value: 94,   suffix: '%', label: 'Match Accuracy' },
      { value: 12,   suffix: '',  label: 'Skills Tracked' },
      { value: 3,    suffix: '',  label: 'Languages' },
    ],
  },
  hi: {
    badge: '🚀 AI-संचालित करियर प्लेटफ़ॉर्म',
    headline: ['अपने', 'कौशल', 'और'],
    headlineAccent: ['सपनों', 'की', 'नौकरी', 'के', 'बीच', 'का', 'पुल'],
    sub: 'बुद्धिमान जॉब मैचिंग, AI रेज़्यूमे बिल्डर, स्किल गैप विश्लेषक और मॉक इंटरव्यू ट्रेनर — एक ही प्लेटफ़ॉर्म में।',
    cta: 'मुफ़्त शुरू करें',
    demo: 'डेमो प्रोफाइल लोड करें',
    featuresTitle: 'SkillBridge AI क्यों?',
    stats: [
      { value: 2400, suffix: '+', label: 'जॉब मिलानें' },
      { value: 94,   suffix: '%', label: 'मिलान सटीकता' },
      { value: 12,   suffix: '',  label: 'कौशल ट्रैक' },
      { value: 3,    suffix: '',  label: 'भाषाएँ' },
    ],
  },
};

const FEATURES = [
  { icon: Brain,         to: '/jobs',      gradient: 'from-g-blue-500 to-g-blue-400',
    title: 'AI Job Matching', titleHi: 'AI जॉब मैचिंग',
    desc: 'TF-IDF + cosine similarity ranks 12+ jobs by match %, with a "Matched because of Python, SQL" explanation.',
    descHi: 'TF-IDF तकनीक से कौशल के आधार पर सर्वोत्तम नौकरियाँ।' },
  { icon: FileText,      to: '/resume',    gradient: 'from-g-teal-500 to-g-teal-400',
    title: 'AI Resume Builder', titleHi: 'AI रेज़्यूमे बिल्डर',
    desc: 'ATS-friendly resume in minutes. Auto-generates summaries and converts everyday experience into professional skills.',
    descHi: 'ATS-अनुकूल रेज़्यूमे बनाएं। अनुभव को प्रोफेशनल कौशल में बदलें।' },
  { icon: TrendingUp,    to: '/skills',    gradient: 'from-g-violet-500 to-g-violet-400',
    title: 'Skill Gap Analyzer', titleHi: 'स्किल गैप विश्लेषक',
    desc: 'Compare your skills against any job listing. See gaps instantly and get free/paid learning path recommendations.',
    descHi: 'कौशल की कमी जानें और सीखने के रास्ते पाएं।' },
  { icon: MessageSquare, to: '/interview', gradient: 'from-g-blue-400 to-g-teal-400',
    title: 'AI Interview Trainer', titleHi: 'AI इंटरव्यू ट्रेनर',
    desc: '3 personality modes: Friendly HR, Strict Interviewer, Technical Expert. Live radar chart feedback on every answer.',
    descHi: '3 पर्सनेलिटी मोड। हर जवाब पर रियल-टाइम फीडबैक।' },
  { icon: Mic,           to: '/interview', gradient: 'from-g-teal-400 to-g-blue-400',
    title: 'Voice in Any Language', titleHi: 'किसी भी भाषा में आवाज़',
    desc: 'Speak in Hindi, Telugu, or English. Web Speech API — no API key, no cost, works in Chrome.',
    descHi: 'हिंदी, तेलुगु या अंग्रेज़ी में बोलें। कोई API key नहीं।' },
  { icon: Zap,           to: '/profile',   gradient: 'from-g-violet-400 to-g-blue-500',
    title: 'Experience Converter', titleHi: 'अनुभव परिवर्तक',
    desc: '"Worked in a bike shop" → Mechanical skills, Inventory management, Customer handling. AI translates real life.',
    descHi: '"बाइक की दुकान" → मैकेनिकल, इन्वेंटरी, ग्राहक सेवा।' },
];

const TRUST_ITEMS = [
  { icon: '🔒', text: 'No login required' },
  { icon: '⚡', text: 'Works offline' },
  { icon: '🌐', text: 'Hindi + Telugu voice' },
  { icon: '📄', text: 'PDF resume export' },
];

const TYPEWRITER_PHRASES = [
  'your next dream job.',
  'skill gaps & opportunities.',
  'an AI-powered career.',
  'your professional future.',
];

/* ── Typewriter hook ─────────────────────────────────────── */
function useTypewriter(phrases, speed = 60, pause = 1800) {
  const [display, setDisplay] = useState('');
  const [pIdx, setPIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[pIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPIdx(p => (p + 1) % phrases.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, pIdx, phrases, speed, pause]);

  return display;
}

/* ── CountUp hook ───────────────────────────────────────── */
function useCountUp(target, duration = 1400, inView = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, inView]);
  return value;
}

/* ── Stat counter card ───────────────────────────────────── */
function StatCard({ value, suffix, label, inView }) {
  const count = useCountUp(value, 1400, inView);
  return (
    <motion.div whileHover={{ y: -3 }} className="card text-center py-6">
      <div className="text-3xl font-black glow-text countup-number">{count}{suffix}</div>
      <div className="text-sm text-g-text-2 mt-1">{label}</div>
    </motion.div>
  );
}

/* ── Person illustration SVG ─────────────────────────────── */
function PersonIllustration() {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 360, filter: 'drop-shadow(0 8px 24px rgba(26,115,232,0.12))' }}
      aria-hidden="true"
    >
      {/* Desk */}
      <path d="M40 180 Q160 175 280 180" stroke="#DADCE0" strokeWidth="3" strokeLinecap="round" className="animate-sketch-draw" />
      <rect x="60" y="180" width="200" height="8" rx="4" fill="#F1F3F4" />
      {/* Laptop base */}
      <rect x="90" y="148" width="140" height="34" rx="6" fill="#E8EAED" stroke="#DADCE0" strokeWidth="1.5" />
      {/* Laptop screen */}
      <rect x="96" y="96" width="128" height="84" rx="6" fill="#fff" stroke="#1A73E8" strokeWidth="2" />
      {/* Screen glow lines */}
      <rect x="106" y="110" width="60" height="5" rx="2.5" fill="#1A73E8" opacity="0.18" />
      <rect x="106" y="120" width="80" height="4" rx="2" fill="#1A73E8" opacity="0.12" />
      <rect x="106" y="130" width="52" height="4" rx="2" fill="#00897B" opacity="0.15" />
      <rect x="106" y="140" width="70" height="4" rx="2" fill="#7C4DFF" opacity="0.12" />
      {/* Code cursor blink */}
      <rect x="160" y="140" width="2" height="12" rx="1" fill="#1A73E8" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0;0.7" dur="1s" repeatCount="indefinite" />
      </rect>
      {/* Person head */}
      <circle cx="160" cy="72" r="20" fill="#FDDCAD" stroke="#DADCE0" strokeWidth="1.5" />
      {/* Hair */}
      <path d="M140 68 Q160 52 180 68" fill="#5D4037" stroke="none" />
      {/* Person body */}
      <path d="M140 92 Q160 88 180 92 L185 148 L135 148 Z" fill="#E8F0FE" stroke="#DADCE0" strokeWidth="1.2" />
      {/* Arms */}
      <path d="M140 100 Q115 118 118 142" stroke="#FDDCAD" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M180 100 Q205 118 202 142" stroke="#FDDCAD" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Floating tags */}
      <g opacity="0.85">
        <rect x="224" y="88" width="52" height="20" rx="10" fill="#E8F0FE" stroke="#1A73E8" strokeWidth="1.2" />
        <text x="250" y="102" textAnchor="middle" fill="#1A73E8" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="600">Python ✓</text>
      </g>
      <g opacity="0.7">
        <rect x="44" y="104" width="46" height="20" rx="10" fill="#E6F4F1" stroke="#00897B" strokeWidth="1.2" />
        <text x="67" y="118" textAnchor="middle" fill="#00897B" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="600">React ✓</text>
      </g>
      <g opacity="0.6">
        <rect x="228" y="118" width="48" height="20" rx="10" fill="#EDE7F6" stroke="#7C4DFF" strokeWidth="1.2" />
        <text x="252" y="132" textAnchor="middle" fill="#7C4DFF" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="600">ML 87%</text>
      </g>
      {/* Connection dots */}
      <circle cx="210" cy="98" r="2.5" fill="#1A73E8" opacity="0.5" />
      <circle cx="90" cy="114" r="2" fill="#00897B" opacity="0.5" />
      <line x1="210" y1="98" x2="224" y2="98" stroke="#1A73E8" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
      <line x1="90" y1="114" x2="90" y2="114" stroke="#00897B" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function LandingPage() {
  const { state, dispatch } = useApp();
  const t = CONTENT[state.language];
  const typeText = useTypewriter(TYPEWRITER_PHRASES);
  const statsRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStatsInView(true);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-g-surface page-enter">

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #E8F0FE, #E6F4F1, #EDE7F6)',
          backgroundSize: '400% 400%',
          animation: 'meshShift 8s ease infinite',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-120px] right-[-120px] w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #1A73E8, transparent)' }} />
        <div className="absolute bottom-[-80px] left-[-80px] w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7C4DFF, transparent)' }} />

        <div className="relative max-w-6xl mx-auto px-4 py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: text */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="badge-blue inline-flex mb-6 animate-pulse-soft">{t.badge}</span>
              </motion.div>

              {/* Word-by-word headline */}
              <h1 style={{ fontSize: 'clamp(38px, 6vw, 62px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em', color: '#202124' }}>
                {t.headline.map((word, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      marginRight: '0.25em',
                      opacity: 0,
                      animation: `wordReveal 0.5s ease ${i * 0.08}s forwards`,
                    }}
                  >
                    {word}
                  </span>
                ))}
                <br />
                {t.headlineAccent.map((word, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      marginRight: '0.25em',
                      background: 'linear-gradient(135deg, #1A73E8, #00897B)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      opacity: 0,
                      animation: `wordReveal 0.5s ease ${(t.headline.length + i) * 0.08 + 0.1}s forwards`,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </h1>

              {/* Typewriter subheadline */}
              <p className="text-lg text-g-text-2 mt-6 leading-relaxed" style={{ minHeight: '2.4rem' }}>
                Discover{' '}
                <span style={{ color: '#1A73E8', fontWeight: 600 }}>{typeText}</span>
                <span className="typewriter-cursor" />
              </p>

              <p className="text-base text-g-text-2 mt-2 max-w-xl leading-relaxed">{t.sub}</p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-10">
                <Link
                  to="/dashboard"
                  className="btn-primary text-base flex items-center gap-2 px-8 py-3.5 group"
                  style={{ position: 'relative' }}
                >
                  {t.cta} <ArrowRight size={18} />
                  {/* Sketch underline on hover */}
                  <svg
                    style={{ position: 'absolute', bottom: -6, left: 0, width: '100%', height: 8, opacity: 0, transition: 'opacity 0.2s' }}
                    className="group-hover:opacity-100"
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,5 Q25,1 50,5 Q75,9 100,4" stroke="white" strokeWidth="2" fill="none" strokeDasharray="120" strokeDashoffset="120">
                      <animate attributeName="stroke-dashoffset" from="120" to="0" dur="0.4s" fill="freeze" begin="indefinite" />
                    </path>
                  </svg>
                </Link>
                <button
                  onClick={() => dispatch({ type: 'LOAD_DEMO' })}
                  className="btn-secondary flex items-center gap-2 px-6 py-3.5"
                >
                  ⚡ {t.demo}
                </button>
              </div>

              {/* Trust chips */}
              <div className="flex flex-wrap gap-3 mt-8">
                {TRUST_ITEMS.map(item => (
                  <span key={item.text} className="chip">
                    {item.icon} {item.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: illustration */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ animation: 'float 4s ease-in-out infinite' }}
              className="hidden lg:flex items-center justify-center"
            >
              <PersonIllustration />
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {t.stats.map((stat, i) => (
              <StatCard key={i} value={stat.value} suffix={stat.suffix} label={stat.label} inView={statsInView} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-g-text">{t.featuresTitle}</h2>
          <p className="text-g-text-2 mt-2">Everything you need. Zero barriers. Zero cost.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`animate-float-${i % 6}`}
            >
              <Link to={feat.to} className="card block h-full group" style={{ display: 'block' }}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feat.icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-g-text text-base">
                  {state.language === 'hi' ? feat.titleHi : feat.title}
                </h3>
                <p className="text-g-text-2 text-sm mt-2 leading-relaxed">
                  {state.language === 'hi' ? feat.descHi : feat.desc}
                </p>
                <div className="flex items-center gap-1 text-g-blue-500 text-xs mt-4 group-hover:gap-2 transition-all font-medium">
                  Explore <ChevronRight size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-12 text-center"
        >
          <div className="absolute inset-0 hero-gradient-bg opacity-90 rounded-3xl" style={{ backgroundSize: '400% 400%' }} />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white">Ready to Find Your Dream Job?</h2>
            <p className="text-white/80 mt-3">Your AI career partner. No account required.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link to="/jobs" className="bg-white text-g-blue-500 font-semibold px-8 py-3 rounded-full hover:shadow-google-lg transition-all flex items-center gap-2">
                <Brain size={16} /> Start AI Job Match
              </Link>
              <Link to="/interview" className="border-2 border-white text-white font-medium px-8 py-3 rounded-full hover:bg-white/10 transition-all flex items-center gap-2">
                <MessageSquare size={16} /> Practice Interview
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
