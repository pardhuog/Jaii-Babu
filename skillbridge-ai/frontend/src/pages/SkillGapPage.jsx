import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSkillGap } from '../services/api';
import SkillGapChart from '../components/SkillGapChart';
import { MOCK_JOBS } from '../data/mockData';
import toast from 'react-hot-toast';

export default function SkillGapPage() {
  const { state } = useApp();
  const [userSkills, setUserSkills] = useState(state.profile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [gapData, setGapData]         = useState(null);
  const [loading, setLoading]         = useState(false);

  const addSkill = s => { if (s && !userSkills.includes(s)) setUserSkills(p => [...p, s]); setSkillInput(''); };

  const loadDemo = () => {
    setUserSkills(['Python','FastAPI','SQL','React','Git']);
    setSelectedJob(MOCK_JOBS[0]);
    setGapData({ matched_skills: ['Python','FastAPI','SQL'], missing_skills: ['Docker','PostgreSQL'], match_percentage: 60, job_title: MOCK_JOBS[0].title });
    toast.success('⚡ Demo loaded!');
  };

  const analyze = async () => {
    if (!userSkills.length) { toast.error('Add your skills first.'); return; }
    if (!selectedJob) { toast.error('Select a job to compare.'); return; }
    setLoading(true);
    try {
      const data = await getSkillGap(userSkills, selectedJob.id, selectedJob.skills);
      setGapData(data);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto page-enter bg-g-bg">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-g-text">🔍 Skill Gap Analyzer</h1>
          <p className="text-g-text-2 text-sm mt-1">See exactly what skills you need — and how to get them.</p>
        </div>
        <button onClick={loadDemo} className="btn-primary">⚡ Load Demo</button>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-5">
          <div className="card">
            <h2 className="font-semibold text-g-text mb-4">Your Skills</h2>
            <div className="flex gap-2 mb-3">
              <input className="input-field" placeholder="Type skill → Enter" value={skillInput}
                onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {userSkills.map(s => (
                <span key={s} className="badge-teal flex items-center gap-1 text-xs">
                  {s}<button onClick={() => setUserSkills(p => p.filter(x => x !== s))} className="hover:text-g-red-500 ml-0.5">×</button>
                </span>
              ))}
            </div>
            {!userSkills.length && <p className="text-xs text-g-text-3 mt-2">No skills yet. Try: Python, SQL, React…</p>}
          </div>

          <div className="card">
            <h2 className="font-semibold text-g-text mb-4">Compare Against Job</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {MOCK_JOBS.map(job => (
                <button key={job.id} onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedJob?.id === job.id ? 'border-g-blue-500 bg-g-blue-50' : 'border-g-border hover:border-g-text-3'}`}>
                  <p className={`font-medium text-sm ${selectedJob?.id === job.id ? 'text-g-blue-500' : 'text-g-text'}`}>{job.title}</p>
                  <p className="text-xs text-g-text-3 mt-0.5">{job.company} · {job.salary}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {job.skills.slice(0, 3).map(s => <span key={s} className="chip text-[9px] py-0.5">{s}</span>)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={analyze} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <TrendingUp size={16} />}
            {loading ? 'Analyzing…' : 'Analyze My Skill Gap'}
          </button>
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
          {gapData ? (
            <div className="card">
              <h2 className="font-semibold text-g-text mb-5">Gap Analysis: {gapData.job_title}</h2>
              <SkillGapChart userSkills={userSkills} requiredSkills={selectedJob?.skills || []} jobTitle={gapData.job_title} />
            </div>
          ) : (
            <div className="card h-72 flex flex-col items-center justify-center gap-4 text-center">
              <TrendingUp size={40} className="text-g-text-3" />
              <div>
                <p className="font-semibold text-g-text">Select a job and analyze</p>
                <p className="text-sm text-g-text-2 mt-1">See gaps + personalized learning paths</p>
              </div>
              <button onClick={loadDemo} className="btn-primary">⚡ Try Demo</button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
