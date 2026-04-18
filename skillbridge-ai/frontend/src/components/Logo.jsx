import { useEffect, useRef } from 'react';

const SIZE_MAP = { sm: 32, md: 48, lg: 80 };
const WORDMARK_SIZE = { sm: 14, md: 18, lg: 26 };

export default function Logo({ size = 'md', showWordmark = true, className = '' }) {
  const px = SIZE_MAP[size];
  const fs = WORDMARK_SIZE[size];
  const id = `sb-grad-${size}`;

  return (
    <div
      className={`flex items-center gap-2 select-none ${className}`}
      style={{ '--logo-size': `${px}px` }}
    >
      {/* SVG Mark */}
      <div style={{ position: 'relative', width: px, height: px }}>
        {/* Orbiting dots */}
        <span className="sb-orbit sb-orbit-1" style={{ '--r': `${px * 0.62}px`, '--dot': `${px * 0.09}px` }} />
        <span className="sb-orbit sb-orbit-2" style={{ '--r': `${px * 0.58}px`, '--dot': `${px * 0.07}px` }} />
        <span className="sb-orbit sb-orbit-3" style={{ '--r': `${px * 0.65}px`, '--dot': `${px * 0.06}px` }} />

        <svg
          width={px}
          height={px}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 1 }}
          aria-label="SkillBridge AI logo mark"
        >
          <defs>
            <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A73E8">
                <animate attributeName="stop-color" values="#1A73E8;#00897B;#7C4DFF;#1A73E8" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#00897B">
                <animate attributeName="stop-color" values="#00897B;#7C4DFF;#1A73E8;#00897B" dur="4s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            <filter id="sb-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background circle */}
          <circle cx="40" cy="40" r="36" fill={`url(#${id})`} opacity="0.12" />
          <circle cx="40" cy="40" r="36" stroke={`url(#${id})`} strokeWidth="1.5" fill="none" opacity="0.4" />

          {/* S — curves into neural path */}
          <path
            d="M28 24 C20 24 18 30 22 34 C26 38 36 38 36 44 C36 50 30 52 24 50"
            stroke={`url(#${id})`}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#sb-glow)"
          />

          {/* Neural nodes on S */}
          <circle cx="28" cy="24" r="2.5" fill={`url(#${id})`} />
          <circle cx="36" cy="39" r="2" fill={`url(#${id})`} opacity="0.7" />
          <circle cx="24" cy="50" r="2.5" fill={`url(#${id})`} />

          {/* B — bridge arch */}
          <path
            d="M44 24 L44 52"
            stroke={`url(#${id})`}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* B top arch */}
          <path
            d="M44 24 C52 24 56 28 56 34 C56 40 52 40 44 40"
            stroke={`url(#${id})`}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#sb-glow)"
          />
          {/* B bottom arch */}
          <path
            d="M44 40 C54 40 58 44 58 46 C58 50 54 52 44 52"
            stroke={`url(#${id})`}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#sb-glow)"
          />

          {/* Connection line between S neural node and B */}
          <line x1="36" y1="39" x2="44" y2="38" stroke={`url(#${id})`} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5" />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className="sb-wordmark"
          style={{ fontSize: fs, fontFamily: "'Google Sans','Inter',sans-serif", fontWeight: 600, lineHeight: 1 }}
        >
          Skill<span style={{ color: '#1A73E8' }}>Bridge</span>
          <span
            style={{
              color: '#1A73E8',
              fontWeight: 700,
              position: 'relative',
            }}
          >
            {' '}AI
            <span className="sb-underline" />
          </span>
        </span>
      )}

      <style>{`
        .sb-orbit {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, #1A73E8, #00897B);
          top: 50%;
          left: 50%;
          transform-origin: 0 0;
          width: var(--dot);
          height: var(--dot);
          margin-left: calc(var(--dot) / -2);
          margin-top: calc(var(--dot) / -2);
          z-index: 0;
        }
        .sb-orbit-1 { animation: sbOrbit1 2s linear infinite; }
        .sb-orbit-2 { animation: sbOrbit2 3s linear infinite; background: linear-gradient(135deg,#7C4DFF,#1A73E8); }
        .sb-orbit-3 { animation: sbOrbit3 4s linear infinite; background: linear-gradient(135deg,#00897B,#7C4DFF); }

        @keyframes sbOrbit1 {
          from { transform: rotate(0deg) translateX(var(--r)) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
        }
        @keyframes sbOrbit2 {
          from { transform: rotate(120deg) translateX(var(--r)) rotate(-120deg); }
          to   { transform: rotate(480deg) translateX(var(--r)) rotate(-480deg); }
        }
        @keyframes sbOrbit3 {
          from { transform: rotate(240deg) translateX(var(--r)) rotate(-240deg); }
          to   { transform: rotate(600deg) translateX(var(--r)) rotate(-600deg); }
        }

        .sb-wordmark {
          color: #202124;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }

        .sb-underline {
          position: absolute;
          bottom: -2px;
          left: 0;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, #1A73E8, #00897B);
          border-radius: 2px;
          animation: sbUnderlineIn 0.6s ease 0.3s forwards;
        }

        @keyframes sbUnderlineIn {
          from { width: 0; opacity: 0.5; }
          to   { width: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
