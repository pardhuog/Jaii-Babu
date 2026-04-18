/**
 * api.js — SkillBridge AI service layer
 * ─────────────────────────────────────────────────────────────
 * UPGRADE 3: Adaptive question selection + richer AI scoring
 */
import axios from 'axios';
import {
  MOCK_JOBS,
  MOCK_INTERVIEW_QA,
  ADAPTIVE_QUESTIONS,
  DEMO_PROFILE,
} from '../data/mockData';

const api = axios.create({ baseURL: '/api', timeout: 8000 });

/* ── Generic try-real / fall-back-to-mock wrapper ──────────── */
async function withFallback(apiCall, fallback) {
  try {
    const res = await apiCall();
    return res.data;
  } catch {
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}

/* ────────────────────────────────────────────────────────────
   Job Matching
   ─────────────────────────────────────────────────────────── */
export async function matchJobs(profile) {
  return withFallback(
    () => api.post('/match-jobs', profile),
    {
      matches: MOCK_JOBS,
      adjacent_roles: ['DevOps Engineer', 'Data Engineer', 'Cloud Developer'],
      total_jobs_scanned: 12,
    }
  );
}

/* ────────────────────────────────────────────────────────────
   Skill Gap
   ─────────────────────────────────────────────────────────── */
export async function getSkillGap(userSkills, jobId, jobSkills) {
  return withFallback(
    () => api.post('/skill-gap', { user_skills: userSkills, job_id: jobId, job_skills: jobSkills }),
    generateMockSkillGap(userSkills, jobSkills || [])
  );
}

function generateMockSkillGap(userSkills, jobSkills) {
  const userSet = new Set(userSkills.map(s => s.toLowerCase()));
  const matched = jobSkills.filter(s => userSet.has(s.toLowerCase()));
  const missing = jobSkills.filter(s => !userSet.has(s.toLowerCase()));
  const pct = jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0;
  return { job_title: 'Selected Role', matched_skills: matched, missing_skills: missing, match_percentage: pct, learning_paths: {} };
}

/* ────────────────────────────────────────────────────────────
   Resume
   ─────────────────────────────────────────────────────────── */
export async function generateResume(data) {
  return withFallback(
    () => api.post('/generate-resume', data),
    { resume: data, ats_score: 82, suggestions: ['Add measurable project outcomes', 'Include 1–2 certifications'] }
  );
}

export async function extractSkills(text) {
  return withFallback(
    () => api.post('/extract-skills', { text }),
    { extracted_skills: [], converted_from_experience: [], all_skills: [] }
  );
}

/* ════════════════════════════════════════════════════════════
   ADAPTIVE INTERVIEW ENGINE  (UPGRADE 3)
   ════════════════════════════════════════════════════════════

   User levels:  'Beginner' | 'Intermediate' | 'Advanced'

   Level transitions (auto-adapt based on rolling score):
     score ≥ 75 for 2 consecutive answers  → go up one level
     score < 45 for 2 consecutive answers  → go down one level
*/

const LEVEL_ORDER = ['Beginner', 'Intermediate', 'Advanced'];

/**
 * getAdaptiveQuestion
 * ─────────────────────────────────────────────────────────────
 * Returns the next question for the given domain + level.
 * Tracks which questions have already been shown (by index)
 * so we never repeat within a session.
 *
 * @param {string}   domain       e.g. 'Software Engineering'
 * @param {string}   level        'Beginner' | 'Intermediate' | 'Advanced'
 * @param {number[]} usedIndices  array of already-seen global indices
 * @returns {{ question, questionNumber, level, totalInLevel, globalIndex }}
 */
export function getAdaptiveQuestion(domain, level, usedIndices = []) {
  const bank = ADAPTIVE_QUESTIONS[domain]?.[level]
    ?? ADAPTIVE_QUESTIONS['General'][level]
    ?? ADAPTIVE_QUESTIONS['General']['Intermediate'];

  // Find an unused question
  const used = new Set(usedIndices);
  let idx = usedIndices.length % bank.length;
  let attempts = 0;
  while (used.has(idx) && attempts < bank.length) {
    idx = (idx + 1) % bank.length;
    attempts++;
  }

  return {
    question:      bank[idx],
    questionNumber: usedIndices.length + 1,
    level,
    totalInLevel:  bank.length,
    globalIndex:   idx,
  };
}

/* Backward-compat: flat question pool (used by old code paths) */
export function getNextQuestion(domain, index) {
  const questions = MOCK_INTERVIEW_QA[domain] || MOCK_INTERVIEW_QA['General'];
  const idx = index % questions.length;
  return {
    question:        questions[idx],
    question_number: idx + 1,
    total_questions: questions.length,
    domain,
  };
}

/* ────────────────────────────────────────────────────────────
   Adaptive scoring + feedback  (UPGRADE 3)
   ─────────────────────────────────────────────────────────── */

/**
 * evaluateAnswer
 * ─────────────────────────────────────────────────────────────
 * Sends the answer to the backend (falls back to local scoring).
 * Returns a richer object:
 *   {
 *     score:        0-100  (technical accuracy)
 *     feedback:     string  actionable tip
 *     clarity:      0-100
 *     confidence:   0-100
 *     structure:    0-100
 *     depth:        0-100  ← NEW: technical depth
 *     nextLevel:    'Beginner'|'Intermediate'|'Advanced'
 *     tips:         string[]
 *     improved_answer: string
 *     feedback_message: string
 *   }
 */
export async function evaluateAnswer({ question, userAnswer, personality = 'friendly', level = 'Intermediate', domain = 'General', consecutiveScores = [] }) {
  return withFallback(
    () => api.post('/interview/evaluate', { question, user_answer: userAnswer, personality, level, domain }),
    () => localEvaluate({ question, userAnswer, personality, level, domain, consecutiveScores })
  );
}

/* Keep old name for backward compat */
export async function improveAnswer(question, userAnswer, personality = 'friendly') {
  return evaluateAnswer({ question, userAnswer, personality });
}

/* ────────────────────────────────────────────────────────────
   Local evaluation engine (offline / fallback)
   ─────────────────────────────────────────────────────────── */
const FILLER_RE   = /\b(um|uh|not sure|maybe|kind of|like|you know|basically)\b/gi;
const STAR_RE     = /\b(first|second|because|therefore|result|example|situation|task|action|impact)\b/gi;
const TECH_TERMS  = /\b(algorithm|complexity|database|API|async|cache|index|query|pipeline|model|train|deploy|container|async|promise|closure|recursion|O\(n\))\b/gi;

const PERSONALITIES_MAP = {
  friendly:  { label: 'Friendly HR',       icon: '😊', tone: 'warm and encouraging' },
  strict:    { label: 'Strict Interviewer', icon: '🎯', tone: 'precise and demanding' },
  technical: { label: 'Technical Expert',   icon: '🔬', tone: 'deep and analytical' },
};

function localEvaluate({ question, userAnswer, personality, level, domain, consecutiveScores }) {
  const words      = userAnswer.trim().split(/\s+/).filter(Boolean);
  const wordCount  = words.length;
  const filler     = (userAnswer.match(FILLER_RE)  || []).length;
  const starKws    = (userAnswer.match(STAR_RE)     || []).length;
  const techKws    = (userAnswer.match(TECH_TERMS)  || []).length;

  // ── Raw sub-scores ──────────────────────────────────────────
  const clarity    = clamp(Math.min(100, wordCount * 2.5) - filler * 8,   5, 100);
  const confidence = clamp(90 - filler * 12,                               20, 100);
  const structure  = clamp(starKws >= 3 ? 85 : starKws * 18 + 15,        10, 100);
  const depth      = clamp(
    techKws * 15 +
    (level === 'Beginner' ? 20 : level === 'Intermediate' ? 10 : 0) +
    (wordCount > 60 ? 20 : wordCount > 30 ? 10 : 0),
    5, 100
  );

  // Overall technical score (weighted)
  const score = clamp(
    clarity * 0.25 + confidence * 0.20 + structure * 0.25 + depth * 0.30
  );

  // ── Adaptive level decision ─────────────────────────────────
  const recent = [...(consecutiveScores || []), score].slice(-3);
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const currentLevelIdx = LEVEL_ORDER.indexOf(level);
  let nextLevel = level;
  if (avgRecent >= 75 && currentLevelIdx < LEVEL_ORDER.length - 1) {
    nextLevel = LEVEL_ORDER[currentLevelIdx + 1];
  } else if (avgRecent < 45 && currentLevelIdx > 0) {
    nextLevel = LEVEL_ORDER[currentLevelIdx - 1];
  }

  // ── Tips ───────────────────────────────────────────────────
  const tips = [];
  if (clarity    < 55) tips.push('💡 Expand your answer with a concrete example or metric.');
  if (confidence < 55) tips.push('💪 Eliminate filler words — speak with direct, confident statements.');
  if (structure  < 55) tips.push('📋 Use the STAR method: Situation → Task → Action → Result.');
  if (depth      < 45) tips.push('🔬 Add technical details — name tools, algorithms, or design decisions.');
  if (!tips.length)    tips.push('✅ Strong answer — structured, confident, and technically solid!');

  // ── Improved version ───────────────────────────────────────
  const opener = score >= 70
    ? 'Drawing on my hands-on experience, '
    : wordCount > 15 ? 'To elaborate further, ' : 'To answer more precisely, ';
  const improved = `${opener}${userAnswer.trim().replace(/[.!?]*$/, '')}. This directly demonstrates my ability to deliver results in ${domain}, aligning with the role's core requirements.`;

  // ── Feedback message ───────────────────────────────────────
  const p = PERSONALITIES_MAP[personality] || PERSONALITIES_MAP.friendly;
  const levelUp   = nextLevel !== level && LEVEL_ORDER.indexOf(nextLevel) > currentLevelIdx;
  const levelDown = nextLevel !== level && LEVEL_ORDER.indexOf(nextLevel) < currentLevelIdx;
  const levelMsg  = levelUp   ? ` 🚀 Leveling up to ${nextLevel} questions!`
                  : levelDown ? ` 📉 Adjusting to ${nextLevel} questions for better practice.`
                  : '';

  const feedback_message = `[${p.label} ${p.icon}] Score: ${score}/100 · ${score >= 70 ? 'Strong' : score >= 50 ? 'Satisfactory' : 'Needs work'}.${levelMsg}`;

  return {
    score,
    clarity,
    confidence,
    structure,
    depth,
    nextLevel,
    tips,
    improved_answer: improved,
    feedback_message,
    personality,
    scores: { clarity, confidence, structure, depth },
  };
}

function clamp(v, min = 0, max = 100) { return Math.round(Math.max(min, Math.min(max, v))); }
