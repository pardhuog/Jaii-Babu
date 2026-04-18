/**
 * InterviewPage.jsx — UPGRADE 3
 * ─────────────────────────────────────────────────────────────
 * • userLevel state (Beginner / Intermediate / Advanced)
 * • adaptive question selection
 * • richer AI scoring (clarity, confidence, structure, depth)
 * • holistic radar blending tech + body-language scores
 * • stat improvement dashboard at session end
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, RefreshCw, Loader2,
  Camera, CameraOff, ChevronRight, TrendingUp,
  Award, BarChart2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAdaptiveQuestion, evaluateAnswer } from '../services/api';
import VoiceInputButton from '../components/VoiceInputButton';
import FaceAnalysisPanel from '../components/FaceAnalysisPanel';
import { analyzeAnswer, WORD_STYLES } from '../utils/answerHeatmap';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

/* ──────────────────────────────────────────────────────────── */
const PERSONALITIES = [
  { id: 'friendly',  label: 'Friendly HR',       icon: '😊', desc: 'Warm & encouraging',  chipClass: 'bg-g-teal-50 border-g-teal-100 text-g-teal-500',
    bgSvg: <svg viewBox="0 0 900 500" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}><defs><linearGradient id="fhG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#E6F4F1"/><stop offset="100%" stopColor="#E8F0FE"/></linearGradient></defs><rect width="900" height="500" fill="url(#fhG)"/><rect x="60" y="80" width="200" height="60" rx="20" fill="#00897B" opacity="0.12"><animate attributeName="opacity" values="0.12;0.22;0.12" dur="3s" repeatCount="indefinite"/></rect><rect x="620" y="120" width="180" height="55" rx="20" fill="#1A73E8" opacity="0.10"><animate attributeName="opacity" values="0.10;0.20;0.10" dur="4s" repeatCount="indefinite"/></rect><ellipse cx="260" cy="380" rx="50" ry="60" fill="#00897B" opacity="0.08"/><circle cx="260" cy="295" r="28" fill="#00897B" opacity="0.08"/><ellipse cx="620" cy="380" rx="50" ry="60" fill="#1A73E8" opacity="0.08"/><circle cx="620" cy="295" r="28" fill="#1A73E8" opacity="0.08"/><line x1="310" y1="340" x2="570" y2="340" stroke="#00897B" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.20"/><circle cx="180" cy="370" r="40" fill="#00897B" opacity="0.06"/><circle cx="750" cy="380" r="60" fill="#00897B" opacity="0.05"/></svg> },
  { id: 'strict',    label: 'Strict Interviewer', icon: '🎯', desc: 'Direct, no fluff',   chipClass: 'bg-yellow-50 border-yellow-100 text-g-yellow-600',
    bgSvg: <svg viewBox="0 0 900 500" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}><defs><linearGradient id="siG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#E8F0FE"/><stop offset="100%" stopColor="#FFF8E1"/></linearGradient></defs><rect width="900" height="500" fill="url(#siG)"/>{[0,1,2,3,4,5,6].map(i=><line key={i} x1={i*150} y1="0" x2={i*150} y2="500" stroke="#1A73E8" strokeWidth="0.5" opacity="0.06"/>)}{[0,1,2,3].map(i=><line key={i} x1="0" y1={i*130} x2="900" y2={i*130} stroke="#1A73E8" strokeWidth="0.5" opacity="0.06"/>)}<circle cx="450" cy="250" r="180" stroke="#FBBC04" strokeWidth="1.5" fill="none" opacity="0.12"/><circle cx="450" cy="250" r="120" stroke="#FBBC04" strokeWidth="1.5" fill="none" opacity="0.10"/><circle cx="450" cy="250" r="60" stroke="#FBBC04" strokeWidth="2" fill="none" opacity="0.14"/><circle cx="450" cy="250" r="12" fill="#FBBC04" opacity="0.18"><animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite"/></circle><rect x="100" y="300" width="30" height="120" rx="4" fill="#1A73E8" opacity="0.08"/><rect x="150" y="260" width="30" height="160" rx="4" fill="#1A73E8" opacity="0.10"/><rect x="200" y="320" width="30" height="100" rx="4" fill="#FBBC04" opacity="0.10"/></svg> },
  { id: 'technical', label: 'Technical Expert',   icon: '🔬', desc: 'Deep-dives & systems', chipClass: 'bg-g-blue-50 border-g-blue-200 text-g-blue-500',
    bgSvg: <svg viewBox="0 0 900 500" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}><defs><linearGradient id="teG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EDE7F6"/><stop offset="100%" stopColor="#E8F0FE"/></linearGradient><radialGradient id="teGlow"><stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.15"/><stop offset="100%" stopColor="#7C4DFF" stopOpacity="0"/></radialGradient></defs><rect width="900" height="500" fill="url(#teG)"/><circle cx="450" cy="250" r="280" fill="url(#teGlow)"/>{[[150,120],[150,250],[150,380],[350,80],[350,200],[350,320],[350,420],[550,120],[550,250],[550,380],[750,200],[750,320]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="10" fill="#7C4DFF" opacity="0.18"><animate attributeName="opacity" values="0.18;0.38;0.18" dur={`${2+i*0.28}s`} repeatCount="indefinite"/></circle>)}{[[150,120,350,80],[150,120,350,200],[150,250,350,200],[150,250,350,320],[150,380,350,320],[350,80,550,120],[350,200,550,250],[350,320,550,380],[550,120,750,200],[550,250,750,320]].map(([x1,y1,x2,y2],i)=><line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7C4DFF" strokeWidth="1" opacity="0.10"/>)}<text x="60" y="470" fontSize="10" fontFamily="monospace" fill="#7C4DFF" opacity="0.18">O(n log n)</text><text x="750" y="50" fontSize="10" fontFamily="monospace" fill="#1A73E8" opacity="0.18">{'{ key: val }'}</text></svg> },
];

const DOMAINS  = ['General', 'Software Engineering', 'Data & Analytics', 'AI/ML'];
const LEVELS   = ['Beginner', 'Intermediate', 'Advanced'];
const LEVEL_COLORS = { Beginner: '#34A853', Intermediate: '#1A73E8', Advanced: '#7C4DFF' };
const DOMAIN_THEMES = {
  'General':              { gradient: 'linear-gradient(135deg,#FFF8E1,#E8F0FE)', accent: '#FBBC04' },
  'Software Engineering': { gradient: 'linear-gradient(135deg,#E8F0FE,#E6F4F1)', accent: '#1A73E8' },
  'Data & Analytics':     { gradient: 'linear-gradient(135deg,#E6F4F1,#EDE7F6)', accent: '#00897B' },
  'AI/ML':                { gradient: 'linear-gradient(135deg,#EDE7F6,#E8F0FE)', accent: '#7C4DFF' },
};

const DEMO_A = "I'm a backend developer with 2 years building REST APIs in Python and FastAPI for a fintech platform serving 50K users. I used PostgreSQL with proper indexing, implemented rate limiting, and wrote unit + integration tests for every endpoint.";

/* ──────────────────────────────────────────────────────────── */
export default function InterviewPage() {
  const { state }                       = useApp();

  /* Setup */
  const [domain,     setDomain]        = useState('Software Engineering');
  const [personality,setPerson]        = useState('friendly');
  const [userLevel,  setUserLevel]     = useState('Intermediate');   // UPGRADE 3

  /* Session */
  const [started,    setStarted]       = useState(false);
  const [currentQ,   setCurrentQ]      = useState(null);
  const [usedIndices,setUsedIndices]   = useState([]);
  const [answer,     setAnswer]        = useState('');
  const [loading,    setLoading]       = useState(false);
  const [messages,   setMessages]      = useState([]);

  /* Scores */
  const [latestTech, setLatestTech]    = useState(null);   // last evaluateAnswer result
  const [faceScores, setFaceScores]    = useState(null);
  const [sessionHistory, setHistory]   = useState([]);     // {tech, face} per answer
  const [consecutiveScores, setConsec] = useState([]);     // for adaptive level

  /* UI */
  const [showFace,   setShowFace]      = useState(false);
  const [showReport, setShowReport]    = useState(false);
  const bottomRef    = useRef(null);
  const textareaRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* ── Pick next question ──────────────────────────────────── */
  const pickQuestion = useCallback((level, used) => {
    return getAdaptiveQuestion(domain, level, used);
  }, [domain]);

  /* ── Start session ───────────────────────────────────────── */
  const startInterview = () => {
    const q = pickQuestion(userLevel, []);
    setCurrentQ(q);
    setUsedIndices([q.globalIndex]);
    setMessages([{ role: 'interviewer', text: q.question, qNum: 1, level: q.level }]);
    setStarted(true);
    setLatestTech(null);
    setHistory([]);
    setConsec([]);
    setShowReport(false);
  };

  /* ── Demo load ───────────────────────────────────────────── */
  const loadDemo = () => {
    setDomain('Software Engineering');
    setUserLevel('Intermediate');
    const q = pickQuestion('Intermediate', []);
    setCurrentQ(q);
    setUsedIndices([q.globalIndex]);
    setStarted(true);
    setAnswer(DEMO_A);
    setMessages([{ role: 'interviewer', text: q.question, qNum: 1, level: q.level }]);
    toast.success('⚡ Demo loaded! Click Submit to see AI feedback.');
  };

  /* ── Submit answer ───────────────────────────────────────── */
  const submitAnswer = async () => {
    if (!answer.trim()) { toast.error('Type or speak your answer first.'); return; }

    // ── UNIQUE FEATURE 2: Analyse every word BEFORE sending ──
    const heatmap = analyzeAnswer(answer);

    setMessages(p => [...p, { role: 'user', text: answer, heatmap }]);
    const saved = answer;
    setAnswer('');
    setLoading(true);

    try {
      const result = await evaluateAnswer({
        question: currentQ.question,
        userAnswer: saved,
        personality,
        level: userLevel,
        domain,
        consecutiveScores,
      });

      setLatestTech(result);

      // Update adaptive level
      const newConsec = [...consecutiveScores, result.score].slice(-3);
      setConsec(newConsec);
      if (result.nextLevel !== userLevel) {
        setUserLevel(result.nextLevel);
        toast(`Level adjusted → ${result.nextLevel}`, { icon: result.nextLevel === 'Advanced' ? '🚀' : '📘' });
      }

      // Save to history
      setHistory(prev => [...prev, { tech: result, face: faceScores ? { ...faceScores } : null }]);

      // Add feedback message
      setMessages(p => [...p, {
        role: 'interviewer', type: 'feedback',
        feedback: result.feedback_message,
        improved: result.improved_answer,
        tips: result.tips,
        scores: result.scores,
        overallScore: result.score,
      }]);

      // Pick next adaptive question
      const newUsed = [...usedIndices, ...(usedIndices.length ? [] : [currentQ.globalIndex])];
      const nextQ = pickQuestion(result.nextLevel, newUsed);
      setUsedIndices([...newUsed, nextQ.globalIndex]);
      setCurrentQ(nextQ);

      setTimeout(() => {
        setMessages(p => [...p, {
          role: 'interviewer',
          text: nextQ.question,
          qNum: (usedIndices.length),
          level: nextQ.level,
        }]);
      }, 700);
    } catch (e) {
      toast.error('AI evaluation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── End session & show report ───────────────────────────── */
  const endSession = () => { if (sessionHistory.length > 0) setShowReport(true); };

  const handleVoiceTranscript = t => { setAnswer(p => (p ? p + ' ' + t : t).trim()); textareaRef.current?.focus(); };

  /* ── Radar chart data (holistic) ─────────────────────────── */
  const radarData = latestTech ? [
    { subject: 'Clarity',     tech: latestTech.clarity    ?? 0, face: faceScores?.engagement ?? 0 },
    { subject: 'Confidence',  tech: latestTech.confidence ?? 0, face: faceScores?.confidence ?? 0 },
    { subject: 'Structure',   tech: latestTech.structure  ?? 0, face: faceScores?.eyeContact ?? 0 },
    { subject: 'Depth',       tech: latestTech.depth      ?? 0, face: faceScores?.engagement ?? 0 },
    { subject: 'Eye Contact', tech: faceScores?.eyeContact ?? 0, face: faceScores?.eyeContact ?? 0 },
    { subject: 'Composure',   tech: latestTech.confidence ?? 0, face: (100 - (faceScores?.nervousness ?? 30)) },
  ] : [];

  /* ── Session improvement report ─────────────────────────── */
  const SessionReport = () => {
    if (!sessionHistory.length) return null;
    const avgTech  = k => Math.round(sessionHistory.reduce((s, h) => s + (h.tech?.[k] ?? 0), 0) / sessionHistory.length);
    const avgFace  = k => Math.round(sessionHistory.filter(h => h.face).reduce((s, h) => s + (h.face?.[k] ?? 0), 0) / (sessionHistory.filter(h => h.face).length || 1));

    const techAvg  = { clarity: avgTech('clarity'), confidence: avgTech('confidence'), structure: avgTech('structure'), depth: avgTech('depth') };
    const faceAvg  = { confidence: avgFace('confidence'), smile: avgFace('smile'), eyeContact: avgFace('eyeContact'), nervousness: avgFace('nervousness') };
    const overall  = Math.round(
      techAvg.clarity * 0.15 + techAvg.confidence * 0.20 + techAvg.structure * 0.20 + techAvg.depth * 0.20 +
      faceAvg.eyeContact * 0.15 + (100 - faceAvg.nervousness) * 0.10
    );
    const scoreHistory = sessionHistory.map(h => h.tech?.score ?? 0);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) setShowReport(false); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-g-surface rounded-3xl shadow-google-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-g-text flex items-center gap-2">
              <Award size={20} className="text-g-blue-500" /> Session Report
            </h2>
            <span className="text-3xl font-black text-g-blue-500">{overall}%</span>
          </div>

          {/* Overall progress bar */}
          <div className="progress-bar-bg mb-6">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${overall}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-google-blue"
            />
          </div>

          {/* Score trend sparkline */}
          <div className="card mb-6">
            <p className="text-xs font-semibold text-g-text mb-3 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-g-blue-500" /> Score Progression
            </p>
            <div className="flex items-end gap-1.5" style={{ height: 60 }}>
              {scoreHistory.map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${Math.max(4, (s / 100) * 52)}px`,
                      background: s >= 70 ? '#34A853' : s >= 45 ? '#1A73E8' : '#EA4335',
                      transition: 'height 0.6s ease',
                    }}
                  />
                  <span className="text-[9px] text-g-text-3 font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Holistic radar */}
          <div className="card mb-6">
            <p className="text-xs font-semibold text-g-text mb-2 flex items-center gap-1.5">
              <BarChart2 size={12} className="text-g-blue-500" /> Holistic Skills Radar
            </p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { subject: 'Clarity',    value: techAvg.clarity,    face: faceAvg.eyeContact },
                  { subject: 'Confidence', value: techAvg.confidence, face: faceAvg.confidence },
                  { subject: 'Structure',  value: techAvg.structure,  face: faceAvg.eyeContact },
                  { subject: 'Depth',      value: techAvg.depth,      face: faceAvg.confidence },
                  { subject: 'Composure',  value: techAvg.confidence, face: 100 - faceAvg.nervousness },
                ]}>
                  <PolarGrid stroke="#DADCE0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#5F6368', fontSize: 10 }} />
                  <Radar name="Technical" dataKey="value" stroke="#1A73E8" fill="#1A73E8" fillOpacity={0.22} />
                  {sessionHistory.some(h => h.face) && (
                    <Radar name="Body Language" dataKey="face" stroke="#00897B" fill="#00897B" fillOpacity={0.16} />
                  )}
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip formatter={v => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sub-score breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              ['Clarity',    techAvg.clarity,    '#1A73E8'],
              ['Confidence', techAvg.confidence, '#34A853'],
              ['Structure',  techAvg.structure,  '#00897B'],
              ['Depth',      techAvg.depth,      '#7C4DFF'],
            ].map(([l, v, c]) => (
              <div key={l} className="card p-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-g-text-2 font-medium">{l}</span>
                  <span className="font-bold" style={{ color: c }}>{v}%</span>
                </div>
                <div className="progress-bar-bg">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full" style={{ background: c }} />
                </div>
              </div>
            ))}
          </div>

          {/* Improvement tips */}
          <div className="card bg-g-blue-50 border-g-blue-100">
            <p className="text-xs font-semibold text-g-blue-500 mb-2">🎯 Key Improvements</p>
            {[
              techAvg.clarity    < 60 && '💡 Give more specific examples — use numbers and outcomes.',
              techAvg.structure  < 60 && '📋 Practice the STAR method consistently.',
              techAvg.depth      < 55 && '🔬 Name specific tools, algorithms, or design patterns.',
              techAvg.confidence < 60 && '💪 Remove filler words — record yourself and review.',
              faceAvg.eyeContact < 55 && '👁️ Maintain steady camera eye contact during answers.',
              faceAvg.nervousness > 60 && '🧘 Practice breathing exercises before interviews.',
            ].filter(Boolean).slice(0, 4).map((tip, i) => (
              <p key={i} className="text-xs text-g-text-2 flex items-start gap-1.5 mb-1">
                <ChevronRight size={11} className="text-g-blue-500 mt-0.5 flex-shrink-0" />{tip}
              </p>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => { setShowReport(false); setStarted(false); setMessages([]); setHistory([]); }}
              className="btn-primary flex-1">New Session</button>
            <button onClick={() => setShowReport(false)} className="btn-secondary">Close</button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  /* ── Active personality ───────────────────────────────────── */
  const activeP     = PERSONALITIES.find(p => p.id === personality) || PERSONALITIES[0];
  const domainTheme = DOMAIN_THEMES[domain] || DOMAIN_THEMES['General'];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 max-w-7xl mx-auto page-enter">
      {/* Page background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, transition: 'background 0.8s ease', background: domainTheme.gradient, opacity: 0.45 }} />

      {/* Session report modal */}
      {showReport && <SessionReport />}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-5 flex-wrap gap-3 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-g-text">🎤 AI Interview Trainer</h1>
          {started && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-g-text-2">Level:</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: LEVEL_COLORS[userLevel] + '20', color: LEVEL_COLORS[userLevel] }}>
                {userLevel}
              </span>
              <span className="text-xs text-g-text-3">· {domain}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {started && sessionHistory.length > 0 && (
            <button onClick={endSession} className="btn-secondary text-sm flex items-center gap-1.5">
              <BarChart2 size={13} /> View Report
            </button>
          )}
          <button
            id="toggle-face-btn"
            onClick={() => setShowFace(v => !v)}
            className={clsx('btn-secondary text-sm flex items-center gap-1.5', showFace && 'border-g-blue-500 text-g-blue-500 bg-g-blue-50')}
          >
            {showFace ? <CameraOff size={14} /> : <Camera size={14} />}
            {showFace ? 'Hide Camera' : 'Face Analysis'}
          </button>
          <button onClick={loadDemo} className="btn-primary text-sm">⚡ Demo</button>
        </div>
      </motion.div>

      {/* Personality + level selectors (pre-start) */}
      {!started && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PERSONALITIES.map(p => (
              <motion.button
                key={p.id}
                onClick={() => setPerson(p.id)}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={clsx('relative rounded-2xl border-2 overflow-hidden text-left transition-all duration-200', personality === p.id ? 'border-g-blue-500 shadow-google-md' : 'border-g-border shadow-google hover:border-g-blue-200')}
                style={{ height: 140 }}
              >
                <div className="absolute inset-0">{p.bgSvg}</div>
                <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{p.icon}</span>
                    {personality === p.id && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-g-blue-500 flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </motion.span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-g-text text-sm">{p.label}</p>
                    <p className="text-xs text-g-text-2">{p.desc}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-4 gap-5">

        {/* ── Left panel ── */}
        <div className="space-y-4">

          {/* Setup (pre-start) */}
          {!started && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
              <h2 className="font-semibold text-g-text text-sm">Interview Setup</h2>

              {/* Domain */}
              <div>
                <label className="label">Domain</label>
                <div className="space-y-1">
                  {DOMAINS.map(d => {
                    const theme = DOMAIN_THEMES[d];
                    const active = domain === d;
                    return (
                      <button key={d} onClick={() => setDomain(d)}
                        className={clsx('w-full text-left px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all flex items-center gap-2', active ? 'border-current shadow-sm' : 'border-g-border text-g-text-2 hover:border-g-text-3')}
                        style={active ? { background: theme.gradient, borderColor: theme.accent, color: theme.accent } : {}}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: theme.accent, opacity: active ? 1 : 0.4 }} />
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Starting level */}
              <div>
                <label className="label">Starting Level</label>
                <div className="flex gap-1.5">
                  {LEVELS.map(lvl => (
                    <button key={lvl} onClick={() => setUserLevel(lvl)}
                      className={clsx('flex-1 py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all', userLevel === lvl ? 'border-current' : 'border-g-border text-g-text-3')}
                      style={userLevel === lvl ? { color: LEVEL_COLORS[lvl], borderColor: LEVEL_COLORS[lvl], background: LEVEL_COLORS[lvl] + '15' } : {}}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-g-text-3 mt-1">AI auto-adjusts as you go</p>
              </div>

              <button id="start-interview-btn" onClick={startInterview} className="btn-primary w-full flex items-center justify-center gap-2">
                <MessageSquare size={14} /> Start Interview
              </button>
            </motion.div>
          )}

          {/* Active — scores + radar */}
          {started && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-g-text">Mode</span>
                <span className={clsx('badge text-xs', activeP.chipClass)}>{activeP.icon} {activeP.label}</span>
              </div>

              {/* Live level indicator */}
              <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: LEVEL_COLORS[userLevel] + '12' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: LEVEL_COLORS[userLevel] }} />
                <span className="text-xs font-semibold" style={{ color: LEVEL_COLORS[userLevel] }}>Level: {userLevel}</span>
                <span className="text-[10px] text-g-text-3 ml-auto">{sessionHistory.length} answered</span>
              </div>

              {/* Holistic radar */}
              {radarData.length > 0 ? (
                <>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#DADCE0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#5F6368', fontSize: 8 }} />
                        <Radar name="Technical" dataKey="tech" stroke="#1A73E8" fill="#1A73E8" fillOpacity={0.22} />
                        {faceScores && <Radar name="Body" dataKey="face" stroke="#00897B" fill="#00897B" fillOpacity={0.16} />}
                        <Legend iconSize={7} wrapperStyle={{ fontSize: 9 }} />
                        <Tooltip formatter={v => `${v}%`} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  {[
                    ['Clarity',    latestTech?.clarity,    '#1A73E8'],
                    ['Confidence', latestTech?.confidence, '#34A853'],
                    ['Structure',  latestTech?.structure,  '#00897B'],
                    ['Depth',      latestTech?.depth,      '#7C4DFF'],
                  ].map(([l, v, c]) => (
                    <div key={l}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-g-text-2">{l}</span>
                        <span className="font-semibold" style={{ color: c }}>{v ?? '—'}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${v ?? 0}%` }} transition={{ duration: 0.8 }}
                          className="h-full rounded-full" style={{ background: c }} />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-[11px] text-g-text-3 text-center py-4">Scores appear after your first answer</p>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setStarted(false); setMessages([]); setHistory([]); setConsec([]); }}
                  className="btn-ghost text-xs flex-1 flex items-center justify-center gap-1">
                  <RefreshCw size={10} /> New
                </button>
                {sessionHistory.length > 0 && (
                  <button onClick={endSession} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1">
                    <BarChart2 size={10} /> Report
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Face analysis panel — always mounted, never unmounted */}
          <div style={{ display: showFace ? 'block' : 'none' }}>
            <FaceAnalysisPanel
              onScoresUpdate={setFaceScores}
              isInterviewActive={started}
              isVisible={showFace}
            />
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className="lg:col-span-3">
          {!started ? (
            <div className="card relative overflow-hidden" style={{ minHeight: 380 }}>
              <div className="absolute inset-0">{activeP.bgSvg}</div>
              <div className="relative z-10 flex flex-col items-center justify-center gap-5 text-center py-16">
                <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-3xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-google-md border border-white">
                  <span className="text-4xl">{activeP.icon}</span>
                </motion.div>
                <div>
                  <p className="font-bold text-g-text text-xl">{activeP.label}</p>
                  <p className="text-sm text-g-text-2 mt-1">{activeP.desc}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-g-text-3">Domain: <strong className="text-g-text">{domain}</strong></span>
                    <span className="text-xs text-g-text-3">·</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: LEVEL_COLORS[userLevel] + '20', color: LEVEL_COLORS[userLevel] }}>{userLevel}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={startInterview} className="btn-primary flex items-center gap-2"><MessageSquare size={14} /> Start Interview</button>
                  <button onClick={loadDemo} className="btn-secondary flex items-center gap-2">⚡ Try Demo</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden flex flex-col" style={{ height: 620 }}>
              {/* Chat header */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-g-border" style={{ background: domainTheme.gradient }}>
                <div className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-xl shadow-sm">
                  {activeP.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-g-text">{activeP.label}</p>
                  <p className="text-xs text-g-text-2">{domain} · <span style={{ color: LEVEL_COLORS[userLevel] }}>{userLevel}</span></p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-medium text-g-text-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                      className={clsx('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      {msg.role === 'interviewer' && (
                        <div className="w-7 h-7 rounded-full bg-g-blue-50 border border-g-blue-100 flex items-center justify-center flex-shrink-0 text-sm mt-1">{activeP.icon}</div>
                      )}

                      <div className={clsx('max-w-[82%]', msg.role === 'user' && 'flex flex-col items-end')}>
                        {msg.type === 'feedback' ? (
                          <div className="card border-g-blue-100 bg-g-blue-50 space-y-2.5 text-sm">
                            {/* Score badge */}
                            <div className="flex items-center justify-between">
                              <p className="text-g-text-2 text-xs leading-relaxed">{msg.feedback}</p>
                              {msg.overallScore != null && (
                                <span className="text-lg font-black ml-3 flex-shrink-0" style={{ color: msg.overallScore >= 70 ? '#34A853' : msg.overallScore >= 45 ? '#1A73E8' : '#EA4335' }}>
                                  {msg.overallScore}
                                </span>
                              )}
                            </div>
                            {/* Score breakdown mini-bars */}
                            {msg.scores && (
                              <div className="grid grid-cols-2 gap-1.5">
                                {[['Clarity','clarity','#1A73E8'],['Confidence','confidence','#34A853'],['Structure','structure','#00897B'],['Depth','depth','#7C4DFF']].map(([l,k,c])=>(
                                  <div key={k} className="bg-white rounded-lg px-2 py-1.5">
                                    <div className="flex justify-between text-[9px] mb-0.5">
                                      <span className="text-g-text-2">{l}</span>
                                      <span className="font-bold" style={{color:c}}>{msg.scores[k]}%</span>
                                    </div>
                                    <div className="h-1 rounded-full bg-g-border overflow-hidden">
                                      <div className="h-full rounded-full" style={{width:`${msg.scores[k]}%`,background:c}}/>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="bg-white rounded-xl p-2.5 border border-g-border">
                              <p className="text-[9px] text-g-text-3 mb-1 font-semibold">✨ Polished answer</p>
                              <p className="text-g-text text-xs">{msg.improved}</p>
                            </div>
                            {msg.tips?.map((tip, j) => (
                              <p key={j} className="text-[11px] text-g-text-2 flex items-start gap-1.5">
                                <ChevronRight size={10} className="text-g-blue-500 mt-0.5 flex-shrink-0" />{tip}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <div className={clsx('px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed', msg.role === 'interviewer' ? 'bg-g-surface border border-g-border text-g-text shadow-google' : 'bg-g-blue-500 text-white')}>
                            {msg.qNum && (
                              <span className="text-[9px] opacity-60 block mb-1 flex items-center gap-1">
                                Q{msg.qNum}
                                {msg.level && <span className="px-1.5 py-0.5 rounded-full text-[8px] font-semibold ml-1" style={{ background: LEVEL_COLORS[msg.level] + '25', color: LEVEL_COLORS[msg.level] }}>{msg.level}</span>}
                              </span>
                            )}
                            {msg.text}
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-g-bg border border-g-border flex items-center justify-center text-[10px] font-bold text-g-text mt-1 flex-shrink-0">
                          {state.profile?.name?.[0] || 'U'}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-g-text-3 px-2">
                    <Loader2 size={12} className="animate-spin text-g-blue-500" /> Analyzing your answer…
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-g-border p-3 bg-g-surface">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      className="input-field resize-none h-20 text-sm"
                      placeholder={`Type your ${userLevel.toLowerCase()} answer… or use the mic 🎤`}
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <VoiceInputButton onTranscript={handleVoiceTranscript} onInterimTranscript={() => {}} size="sm" initialLang={state.language === 'hi' ? 'hi-IN' : 'en-IN'} />
                    <button id="submit-answer-btn" onClick={submitAnswer} disabled={loading}
                      className="w-9 h-9 rounded-xl bg-g-blue-500 hover:bg-g-blue-600 flex items-center justify-center transition-colors disabled:opacity-60">
                      {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-g-text-3 mt-1">Enter to submit · Shift+Enter for new line</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
