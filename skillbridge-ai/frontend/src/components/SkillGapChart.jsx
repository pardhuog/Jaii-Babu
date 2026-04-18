import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { LEARNING_PATHS } from '../data/mockData';

export default function SkillGapChart({ userSkills = [], requiredSkills = [], jobTitle = '' }) {
  const userSet  = new Set(userSkills.map(s => s.toLowerCase()));
  const matched  = requiredSkills.filter(s => userSet.has(s.toLowerCase()));
  const missing  = requiredSkills.filter(s => !userSet.has(s.toLowerCase()));
  const pct = requiredSkills.length ? Math.round((matched.length / requiredSkills.length) * 100) : 0;

  const barColor = pct >= 75 ? 'bg-g-green-500' : pct >= 50 ? 'bg-g-blue-500' : pct >= 30 ? 'bg-g-yellow-500' : 'bg-g-red-500';
  const pctColor = pct >= 75 ? 'text-g-green-500' : pct >= 50 ? 'text-g-blue-500' : pct >= 30 ? 'text-g-yellow-600' : 'text-g-red-500';

  return (
    <div className="space-y-6">
      {/* Overall bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-g-text">Skill Match {jobTitle ? `— ${jobTitle}` : ''}</span>
          <span className={`text-xl font-black ${pctColor}`}>{pct}%</span>
        </div>
        <div className="progress-bar-bg h-3">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`h-full rounded-full ${barColor}`} />
        </div>
        <p className="text-xs text-g-text-3 mt-1">{matched.length} of {requiredSkills.length} required skills matched</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Matched */}
        <div className="card border-green-200 bg-green-50">
          <h4 className="text-sm font-semibold text-g-green-600 mb-3 flex items-center gap-1.5">
            <CheckCircle size={14} /> You Have These
          </h4>
          <div className="space-y-2">
            {matched.length ? matched.map(s => (
              <motion.div key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm text-g-green-700">
                <div className="w-1.5 h-1.5 rounded-full bg-g-green-500" />{s}
              </motion.div>
            )) : <p className="text-xs text-g-text-3">No matching skills found</p>}
          </div>
        </div>

        {/* Missing */}
        <div className="card border-red-200 bg-red-50">
          <h4 className="text-sm font-semibold text-g-red-500 mb-3 flex items-center gap-1.5">
            <XCircle size={14} /> Skills to Learn
          </h4>
          <div className="space-y-2">
            {missing.length ? missing.map(s => (
              <motion.div key={s} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm text-g-red-600">
                <div className="w-1.5 h-1.5 rounded-full bg-g-red-500" />{s}
              </motion.div>
            )) : <p className="text-xs text-g-green-600 font-medium">🎉 You have all required skills!</p>}
          </div>
        </div>
      </div>

      {/* Learning paths */}
      {missing.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-g-text mb-3">📚 Recommended Learning Paths</h4>
          <div className="space-y-3">
            {missing.slice(0, 4).map(skill => {
              const paths = LEARNING_PATHS[skill] || LEARNING_PATHS.default;
              return (
                <div key={skill} className="card p-4">
                  <p className="text-sm font-semibold text-g-blue-500 mb-2">{skill}</p>
                  {paths.map(p => (
                    <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between text-xs text-g-text-2 hover:text-g-blue-500 py-1.5 group transition-colors">
                      <span className="flex items-center gap-1.5">
                        <ArrowRight size={10} className="text-g-blue-400 group-hover:translate-x-0.5 transition-transform" />
                        {p.name}
                        {p.free && <span className="badge-green text-[9px] py-0.5 px-1.5">FREE</span>}
                      </span>
                      <span className="text-g-text-3">{p.duration}</span>
                    </a>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
