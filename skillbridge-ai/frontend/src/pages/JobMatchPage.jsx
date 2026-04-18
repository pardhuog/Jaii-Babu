import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Loader2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { matchJobs } from '../services/api';
import JobCard from '../components/JobCard';
import VoiceInputButton from '../components/VoiceInputButton';
import { MOCK_JOBS } from '../data/mockData';
import toast from 'react-hot-toast';

const SKILL_SUGGESTIONS = ['Python','React','SQL','JavaScript','Node.js','Machine Learning','FastAPI','Docker','AWS','TypeScript','MongoDB','Git'];
const DOMAINS = ['Software Engineering','Data & Analytics','AI/ML','Frontend','Full Stack','DevOps','Business'];

const DEMO = {
  name: 'Arjun Sharma', skills: ['Python','FastAPI','SQL','React','Git','REST APIs'],
  experience: 2, domain: 'Software Engineering', job_type: 'Full-time', location: 'Hyderabad',
};

export default function JobMatchPage() {
  const { state, dispatch } = useApp();
  const [profile, setProfile] = useState({
    name: state.profile?.name || '', skills: state.profile?.skills || [],
    experience: state.profile?.experience || 0, domain: state.profile?.domain || '',
    job_type: '', location: state.profile?.location || '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [results, setResults]       = useState(state.matchedJobs.length ? state.matchedJobs : []);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);

  const addSkill = s => { if (s && !profile.skills.includes(s)) setProfile(p => ({ ...p, skills: [...p.skills, s] })); setSkillInput(''); };
  const removeSkill = s => setProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }));

  const handleVoice = transcript => {
    transcript.split(/[,\s]+/).filter(w => w.length > 1).forEach(w => addSkill(w.trim()));
    toast.success(`Added from voice: "${transcript}"`);
  };

  const loadDemo = () => { setProfile(DEMO); toast.success('⚡ Demo profile loaded!'); };

  const handleMatch = async () => {
    if (!profile.skills.length) { toast.error('Add at least one skill.'); return; }
    setLoading(true); setSearched(true);
    try {
      const data = await matchJobs(profile);
      setResults(data.matches || MOCK_JOBS);
      dispatch({ type: 'SET_MATCHED_JOBS', payload: data.matches || MOCK_JOBS });
      toast.success(`Found ${data.matches?.length || 0} matches!`);
    } catch { setResults(MOCK_JOBS); } finally { setLoading(false); }
  };

  const handleApply = job => {
    dispatch({ type: 'ADD_INTERACTION', payload: { type: 'apply', job_id: job.id, timestamp: Date.now() } });
    toast.success(`Applied to ${job.title}! 🎉`);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto page-enter bg-g-bg">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-g-text">🧠 AI Job Matching Engine</h1>
        <p className="text-g-text-2 text-sm mt-1">Enter your skills → get ranked job matches with AI explanations</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-5">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-g-text">Your Profile</h2>
              <button onClick={loadDemo} className="badge-blue text-xs px-3 py-1.5 cursor-pointer hover:bg-g-blue-100 transition-colors">⚡ Load Demo</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Your Name</label>
                <input className="input-field" placeholder="Arjun Sharma" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div>
                <label className="label">Skills</label>
                <div className="flex gap-2 items-center">
                  <input className="input-field" placeholder="Type skill → Enter" value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)} />
                  <VoiceInputButton onTranscript={handleVoice} size="sm" initialLang={state.language === 'hi' ? 'hi-IN' : 'en-IN'} />
                </div>
                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SKILL_SUGGESTIONS.filter(s => !profile.skills.includes(s)).slice(0, 8).map(s => (
                    <button key={s} onClick={() => addSkill(s)} className="chip text-[10px] py-0.5">+ {s}</button>
                  ))}
                </div>
                {/* Added skills */}
                {profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {profile.skills.map(s => (
                      <span key={s} className="badge-blue flex items-center gap-1 text-xs">
                        {s}
                        <button onClick={() => removeSkill(s)} className="hover:text-g-red-500 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label">Experience: <span className="text-g-blue-500 font-semibold">{profile.experience} yr{profile.experience !== 1 ? 's' : ''}</span></label>
                <input type="range" min="0" max="15" value={profile.experience}
                  onChange={e => setProfile(p => ({ ...p, experience: +e.target.value }))}
                  className="w-full accent-g-blue-500" />
                <div className="flex justify-between text-xs text-g-text-3 mt-0.5"><span>Fresher</span><span>15+ years</span></div>
              </div>

              <div>
                <label className="label">Domain</label>
                <select className="input-field" value={profile.domain} onChange={e => setProfile(p => ({ ...p, domain: e.target.value }))}>
                  <option value="">All Domains</option>
                  {DOMAINS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Job Type</label>
                <div className="flex gap-2 flex-wrap">
                  {['Full-time','Remote','Contract'].map(t => (
                    <button key={t} onClick={() => setProfile(p => ({ ...p, job_type: p.job_type === t ? '' : t }))}
                      className={`chip ${profile.job_type === t ? 'chip-active' : ''}`}>{t}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleMatch} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {loading ? 'Matching…' : 'Find My Jobs'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-3">
          {!searched && !results.length ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card h-72 flex flex-col items-center justify-center text-center gap-4">
              <Search size={40} className="text-g-text-3" />
              <div>
                <p className="font-semibold text-g-text">Ready to find your perfect job?</p>
                <p className="text-sm text-g-text-2 mt-1">Fill your skills and click "Find My Jobs"</p>
              </div>
              <button onClick={loadDemo} className="btn-primary">⚡ Try Demo Profile</button>
            </motion.div>
          ) : (
            <div>
              {results.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-g-text-2"><span className="font-semibold text-g-text">{results.length}</span> jobs matched</p>
                  <button onClick={handleMatch} className="btn-ghost text-xs flex items-center gap-1"><RefreshCw size={13} /> Refresh</button>
                </div>
              )}
              <div className="space-y-4">
                {results.map((job, i) => <JobCard key={job.id} job={job} index={i} onApply={handleApply} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
