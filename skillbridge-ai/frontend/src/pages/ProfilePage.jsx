import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_PROFILE } from '../data/mockData';
import toast from 'react-hot-toast';

const EXPERIENCE_CONVERSIONS = {
  'bike shop':    ['Mechanical skills', 'Inventory management', 'Customer handling', 'Sales'],
  'grocery store':['Inventory management', 'Customer handling', 'Billing/POS', 'Stock management'],
  'call center':  ['Communication', 'CRM', 'Problem solving', 'Customer handling'],
  teaching:       ['Communication', 'Content creation', 'Mentoring', 'Presentation'],
  driving:        ['Logistics', 'Route planning', 'Time management', 'GPS navigation'],
  farming:        ['Logistics', 'Resource management', 'Physical endurance', 'Planning'],
  tailoring:      ['Attention to detail', 'Design sense', 'Inventory', 'Time management'],
  cooking:        ['Food safety', 'Inventory', 'Time management', 'Team coordination'],
};

const DOMAINS = ['Software Engineering','Data & Analytics','AI/ML','Frontend','Full Stack','DevOps','Business','Mobile'];

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({
    name:           state.profile?.name || '',
    email:          state.profile?.email || '',
    phone:          state.profile?.phone || '',
    location:       state.profile?.location || '',
    domain:         state.profile?.domain || '',
    experience:     state.profile?.experience || 0,
    skills:         state.profile?.skills || [],
    rawExperience:  '',
    convertedSkills:[],
  });
  const [skillInput, setSkillInput] = useState('');

  const detect = text => {
    const lower = text.toLowerCase();
    const found = [];
    for (const [kw, skills] of Object.entries(EXPERIENCE_CONVERSIONS)) {
      if (lower.includes(kw)) found.push(...skills);
    }
    return [...new Set(found)];
  };

  const handleRaw = text => setForm(f => ({ ...f, rawExperience: text, convertedSkills: detect(text) }));
  const addConvertedSkill = s => { if (!form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] })); toast.success(`Added: ${s}`); };
  const addSkill = s => { if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] })); setSkillInput(''); };

  const loadDemo = () => { setForm({ ...DEMO_PROFILE, rawExperience: '', convertedSkills: [] }); dispatch({ type: 'LOAD_DEMO' }); toast.success('⚡ Demo loaded!'); };
  const save = () => { dispatch({ type: 'SET_PROFILE', payload: form }); toast.success('Profile saved!'); };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto page-enter bg-g-bg">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-g-text">👤 Your Profile</h1>
          <p className="text-g-text-2 text-sm mt-1">Saved locally — no account needed. Load demo to explore instantly.</p>
        </div>
        <button onClick={loadDemo} className="btn-primary flex items-center gap-2">⚡ Load Demo Profile</button>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic info */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-g-border">
            <div className="w-12 h-12 rounded-full bg-g-blue-500 flex items-center justify-center text-xl font-bold text-white">
              {form.name?.[0] || 'U'}
            </div>
            <div>
              <p className="font-semibold text-g-text">{form.name || 'Your Name'}</p>
              <p className="text-xs text-g-text-2">{form.domain || 'No domain set'}</p>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-g-text">Basic Information</h2>
          {[['name','Full Name'],['email','Email Address'],['phone','Phone Number'],['location','Location']].map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input-field" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}

          <div>
            <label className="label">Domain</label>
            <select className="input-field" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}>
              <option value="">Select Domain</option>
              {DOMAINS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Years of Experience: <span className="text-g-blue-500 font-semibold">{form.experience}</span></label>
            <input type="range" min={0} max={15} value={form.experience}
              onChange={e => setForm(f => ({ ...f, experience: +e.target.value }))}
              className="w-full accent-g-blue-500" />
          </div>
        </motion.div>

        {/* Skills + Experience Converter */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="card">
            <h2 className="font-semibold text-g-text mb-4">Technical Skills</h2>
            <div className="flex gap-2 mb-3">
              <input className="input-field" placeholder="Add skill → Enter" value={skillInput}
                onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.skills.map(s => (
                <span key={s} className="badge-blue flex items-center gap-1 text-xs">
                  {s}<button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))} className="hover:text-g-red-500 ml-0.5">×</button>
                </span>
              ))}
            </div>
            {!form.skills.length && <p className="text-xs text-g-text-3 mt-2">No skills yet. Add Python, SQL, React…</p>}
          </div>

          {/* Experience converter */}
          <div className="card border-g-yellow-500/30 bg-yellow-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-g-yellow-600" />
              <h2 className="text-sm font-semibold text-g-text">Experience → Skills Converter</h2>
            </div>
            <p className="text-xs text-g-text-2 mb-3">Describe your real-life work — AI converts it to professional skills.</p>
            <textarea
              className="input-field resize-none h-20 text-sm"
              placeholder={`e.g. "I worked in a bike shop for 2 years repairing motorcycles and managing inventory"`}
              value={form.rawExperience}
              onChange={e => handleRaw(e.target.value)}
            />
            {form.convertedSkills.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-g-yellow-600 font-medium mb-2">✨ Detected professional skills — click to add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {form.convertedSkills.map(s => (
                    <button key={s} onClick={() => addConvertedSkill(s)}
                      className="badge-yellow cursor-pointer hover:bg-yellow-100 transition-colors text-xs">+ {s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 flex justify-end">
        <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={16} /> Save Profile</button>
      </motion.div>

      {/* Activity log */}
      {state.interactions.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 card">
          <h2 className="font-semibold text-g-text mb-3">📊 Your Activity</h2>
          <div className="space-y-2">
            {state.interactions.slice(-5).reverse().map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-g-text-2 py-1.5 border-b border-g-border last:border-0">
                <span className="w-1.5 h-1.5 rounded-full bg-g-blue-500 flex-shrink-0" />
                <span className="flex-1">{item.type === 'apply' ? `Applied to job: ${item.job_id}` : item.type}</span>
                <span className="text-g-text-3">{new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
