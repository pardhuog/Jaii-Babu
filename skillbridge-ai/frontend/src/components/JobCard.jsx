import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, CheckCircle, XCircle, Zap, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

/* ── Score ring with sketch-draw animation ─────────────── */
function ScoreRing({ score }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75 ? '#34A853' :
    score >= 50 ? '#1A73E8' :
    score >= 30 ? '#FBBC04' : '#EA4335';

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        {/* Track */}
        <circle cx="32" cy="32" r={radius} stroke="#DADCE0" strokeWidth="5" fill="none" />
        {/* Animated score arc — sketch-draw style */}
        <motion.circle
          cx="32" cy="32" r={radius}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 3px ${color}55)`,
          }}
        />
        {/* Sketch wobble dots at start/end */}
        <circle
          cx={32 + radius}
          cy={32}
          r="2.5"
          fill={color}
          style={{ transformOrigin: '32px 32px' }}
          opacity="0.5"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-g-text">{score}%</span>
      </div>
    </div>
  );
}

export default function JobCard({ job, index = 0, onApply }) {
  const {
    title, company, location, type, salary,
    match_score = 0, matched_skills = [], missing_skills = [],
    match_reason = '',
  } = job;

  const scoreColor =
    match_score >= 75 ? 'text-g-green-500' :
    match_score >= 50 ? 'text-g-blue-500' :
    match_score >= 30 ? 'text-g-yellow-600' : 'text-g-red-500';

  const scoreLabel =
    match_score >= 75 ? 'Excellent Match' :
    match_score >= 50 ? 'Good Match' :
    match_score >= 30 ? 'Partial Match' : 'Low Match';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="cursor-pointer group job-card-wrapper"
      style={{ position: 'relative' }}
    >
      {/* Main card */}
      <div
        className="card group-hover:shadow-google-md transition-all duration-250"
        style={{
          position: 'relative',
          transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s ease, border-color 0.22s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = '#1A73E8';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '';
        }}
      >
        {/* Sketch bracket ::before / ::after via pseudo-elements managed with CSS class */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: -1,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 28,
            color: '#1A73E8',
            fontWeight: 300,
            lineHeight: 1,
            opacity: 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: 'monospace',
          }}
          className="job-bracket-left"
        >{'['}</span>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: -1,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 28,
            color: '#1A73E8',
            fontWeight: 300,
            lineHeight: 1,
            opacity: 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: 'monospace',
          }}
          className="job-bracket-right"
        >{']'}</span>

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-google-blue opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start gap-4">
          {/* Company avatar */}
          <div className="w-12 h-12 rounded-xl bg-g-blue-50 border border-g-blue-100 flex items-center justify-center text-lg font-bold text-g-blue-500 flex-shrink-0">
            {company[0]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-g-text group-hover:text-g-blue-500 transition-colors line-clamp-1">
                  {title}
                </h3>
                <p className="text-sm text-g-text-2 mt-0.5">{company}</p>
              </div>
              <ScoreRing score={Math.round(match_score)} />
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mt-3 text-xs text-g-text-3">
              <span className="flex items-center gap-1 bg-g-bg px-2 py-1 rounded-full"><MapPin size={10} />{location}</span>
              <span className="flex items-center gap-1 bg-g-bg px-2 py-1 rounded-full"><Briefcase size={10} />{type}</span>
              <span className="flex items-center gap-1 bg-g-bg px-2 py-1 rounded-full"><DollarSign size={10} />{salary}</span>
            </div>

            {/* Match reason */}
            {match_reason && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-g-blue-500 bg-g-blue-50 border border-g-blue-100 rounded-lg px-2.5 py-1.5">
                <Zap size={11} />
                <span>{match_reason}</span>
              </div>
            )}

            {/* Skills */}
            <div className="mt-3 space-y-1.5">
              {matched_skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {matched_skills.slice(0, 4).map(s => (
                    <span key={s} className="badge-green text-[10px] flex items-center gap-1">
                      <CheckCircle size={9} /> {s}
                    </span>
                  ))}
                </div>
              )}
              {missing_skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {missing_skills.slice(0, 3).map(s => (
                    <span key={s} className="badge-red text-[10px] flex items-center gap-1">
                      <XCircle size={9} /> {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-g-border flex items-center justify-between">
          <span className={clsx('text-sm font-semibold', scoreColor)}>{scoreLabel}</span>
          <button
            onClick={() => onApply?.(job)}
            className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1"
          >
            Apply Now <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Bracket hover style injection */}
      <style>{`
        .job-card-wrapper:hover .job-bracket-left,
        .job-card-wrapper:hover .job-bracket-right {
          opacity: 1 !important;
        }
      `}</style>
    </motion.div>
  );
}
