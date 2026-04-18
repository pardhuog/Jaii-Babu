import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, TrendingUp, MessageSquare, Target, Star, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_JOBS } from '../data/mockData';
import { useEffect, useRef, useState } from 'react';

/* ── Count-up hook ──────────────────────────────────────── */
function useCountUp(target, duration = 1200, inView = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const numericTarget = typeof target === 'number' ? target : parseFloat(target) || 0;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * numericTarget));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, inView]);
  return value;
}

/* ── Sparkline SVG ──────────────────────────────────────── */
function Sparkline({ data, color = '#1A73E8' }) {
  const w = 64, h = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* Filled area */}
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={color}
        opacity="0.08"
        strokeWidth="0"
      />
    </svg>
  );
}

const SPARKLINES = [
  { data: [4, 6, 5, 8, 7, 9], color: '#1A73E8' },
  { data: [80, 82, 85, 84, 87, 92], color: '#34A853' },
  { data: [2, 3, 4, 5, 5, 6], color: '#00897B' },
  { data: [60, 65, 68, 74, 78, 82], color: '#7C4DFF' },
];

const STAT_CARDS = (profile, jobs) => [
  { label: 'Jobs Matched',      rawValue: jobs.length || 8,               suffix: '',  icon: Briefcase, iconColor: 'text-g-blue-500',   bg: 'bg-g-blue-50',   to: '/jobs',    sparkIdx: 0 },
  { label: 'Top Match',         rawValue: jobs[0]?.match_score || 87,     suffix: '%', icon: Target,    iconColor: 'text-g-green-500',  bg: 'bg-green-50',    to: '/jobs',    sparkIdx: 1 },
  { label: 'Skills in Profile', rawValue: profile?.skills?.length || 0,   suffix: '',  icon: Star,      iconColor: 'text-g-teal-500',   bg: 'bg-g-teal-50',   to: '/profile', sparkIdx: 2 },
  { label: 'ATS Score',         rawValue: profile ? 82 : 0,               suffix: '%', icon: FileText,  iconColor: 'text-g-violet-500', bg: 'bg-g-violet-50', to: '/resume',  sparkIdx: 3 },
];

const QUICK_ACTIONS = [
  { label: 'AI Job Match',   desc: 'Find your best opportunities', icon: Briefcase,     to: '/jobs',      color: 'text-g-blue-500',   bg: 'bg-g-blue-50' },
  { label: 'Build Resume',   desc: 'ATS-friendly in minutes',      icon: FileText,      to: '/resume',    color: 'text-g-teal-500',   bg: 'bg-g-teal-50' },
  { label: 'Skill Gap',      desc: 'Know what to learn next',      icon: TrendingUp,    to: '/skills',    color: 'text-g-violet-500', bg: 'bg-g-violet-50' },
  { label: 'Interview Prep', desc: 'AI-powered mock sessions',     icon: MessageSquare, to: '/interview', color: 'text-g-green-500',  bg: 'bg-green-50' },
];

/* ── Animated stat card ─────────────────────────────────── */
function StatCard({ card, inView }) {
  const count = useCountUp(card.rawValue, 1200, inView);
  const spark = SPARKLINES[card.sparkIdx];

  return (
    <motion.div whileHover={{ y: -3 }}>
      <Link to={card.to} className="card block text-center p-5 group" style={{ overflow: 'hidden' }}>
        <div className={`w-10 h-10 mx-auto rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
          <card.icon size={18} className={card.iconColor} />
        </div>
        <div className="text-2xl font-black text-g-text countup-number">
          {count}{card.suffix}
        </div>
        <div className="text-xs text-g-text-2 mt-1">{card.label}</div>
        {/* Sparkline */}
        <div className="flex justify-center mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
          <Sparkline data={spark.data} color={spark.color} />
        </div>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const profile = state.profile;
  const jobs = state.matchedJobs.length ? state.matchedJobs : MOCK_JOBS;
  const statsRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsInView(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Also trigger on mount (already in view)
  useEffect(() => {
    if (statsRef.current) {
      const rect = statsRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight) setStatsInView(true);
    }
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto page-enter bg-g-bg">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-g-text">
            {profile ? `Welcome back, ${profile.name?.split(' ')[0]} 👋` : 'Welcome to SkillBridge AI 👋'}
          </h1>
          <p className="text-g-text-2 mt-1">
            {profile ? `${profile.skills?.length || 0} skills · ${profile.experience || 0} years exp` : 'Your AI-powered career dashboard'}
          </p>
        </div>
        {!profile && (
          <button onClick={() => dispatch({ type: 'LOAD_DEMO' })} className="btn-primary flex items-center gap-2">
            ⚡ Load Demo Profile
          </button>
        )}
      </motion.div>

      {/* Stat cards with count-up + sparklines */}
      <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS(profile, jobs).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <StatCard card={card} inView={statsInView} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top matches */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-g-text text-lg">Top Job Matches</h2>
            <Link to="/jobs" className="text-sm text-g-blue-500 hover:text-g-blue-600 flex items-center gap-1 font-medium">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {jobs.slice(0, 4).map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="card flex items-center gap-4 hover:shadow-google-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-g-blue-50 flex items-center justify-center text-sm font-bold text-g-blue-500 flex-shrink-0">
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-g-text text-sm truncate">{job.title}</p>
                  <p className="text-xs text-g-text-3">{job.company} · {job.location}</p>
                </div>
                <div className="text-right flex-shrink-0 w-20">
                  <p className={`text-sm font-bold ${job.match_score >= 75 ? 'text-g-green-500' : job.match_score >= 50 ? 'text-g-blue-500' : 'text-g-yellow-600'}`}>
                    {job.match_score}%
                  </p>
                  <div className="progress-bar-bg mt-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${job.match_score}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                      className={`h-full rounded-full ${job.match_score >= 75 ? 'bg-g-green-500' : job.match_score >= 50 ? 'bg-g-blue-500' : 'bg-g-yellow-500'}`}
                    />
                  </div>
                </div>
                <Link to="/jobs"><ArrowUpRight size={16} className="text-g-text-3 hover:text-g-blue-500 transition-colors" /></Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div>
            <h2 className="font-bold text-g-text text-lg mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action, i) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                >
                  <Link to={action.to} className="flex items-center gap-3 p-3 rounded-xl border border-g-border bg-g-surface hover:border-g-blue-200 hover:shadow-google transition-all group">
                    <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                      <action.icon size={16} className={action.color} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-g-text">{action.label}</p>
                      <p className="text-xs text-g-text-3">{action.desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-g-text-3 group-hover:text-g-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Profile completeness */}
          {profile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="card">
              <h3 className="text-sm font-semibold text-g-text mb-3">Profile Completeness</h3>
              {[
                { label: 'Skills',          done: (profile.skills?.length || 0) > 0 },
                { label: 'Work Experience', done: (profile.work_experience?.length || 0) > 0 },
                { label: 'Education',       done: (profile.education?.length || 0) > 0 },
                { label: 'Projects',        done: (profile.projects?.length || 0) > 0 },
                { label: 'Certifications',  done: (profile.certifications?.length || 0) > 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-g-border last:border-0">
                  <span className="text-xs text-g-text-2">{item.label}</span>
                  <span className={`text-xs font-medium ${item.done ? 'text-g-green-500' : 'text-g-text-3'}`}>
                    {item.done ? '✓' : '+ Add'}
                  </span>
                </div>
              ))}
              <div className="mt-3">
                {(() => {
                  const pct = [profile.skills, profile.work_experience, profile.education, profile.projects, profile.certifications]
                    .filter(x => x?.length > 0).length * 20;
                  return (
                    <>
                      <div className="flex justify-between text-xs text-g-text-2 mb-1"><span>Progress</span><span>{pct}%</span></div>
                      <div className="progress-bar-bg">
                        <div className="h-full bg-g-blue-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
