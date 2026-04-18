import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateResume } from '../services/api';
import ResumePreview from '../components/ResumePreview';
import { DEMO_PROFILE } from '../data/mockData';
import toast from 'react-hot-toast';

const TABS = ['📋 Basic Info','💼 Experience','🎓 Education & Projects','📄 Preview'];

const EMPTY_WORK = { title:'', company:'', duration:'', location:'', description:'' };
const EMPTY_EDU  = { degree:'', institution:'', year:'', gpa:'' };
const EMPTY_PROJ = { name:'', tech:'', description:'', link:'' };

export default function ResumePage() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [atsScore, setAtsScore] = useState(null);

  const [form, setForm] = useState({
    name:           state.profile?.name || '',
    email:          state.profile?.email || '',
    phone:          state.profile?.phone || '',
    location:       state.profile?.location || '',
    summary:        state.profile?.summary || '',
    skills:         state.profile?.skills || [],
    work_experience:state.profile?.work_experience || [],
    education:      state.profile?.education || [],
    projects:       state.profile?.projects || [],
    certifications: state.profile?.certifications || [],
  });
  const [skillInput, setSkillInput] = useState('');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addItem  = (key, blank) => update(key, [...form[key], { ...blank }]);
  const removeItem = (key, i)  => update(key, form[key].filter((_, j) => j !== i));
  const updateItem = (key, i, field, val) =>
    update(key, form[key].map((item, j) => j === i ? { ...item, [field]: val } : item));

  const loadDemo = () => {
    setForm({ ...DEMO_PROFILE, summary: '' });
    dispatch({ type: 'LOAD_DEMO' });
    toast.success('⚡ Demo resume loaded!');
  };

  const handleGenerate = async () => {
    if (!form.name) { toast.error('Add your name first.'); return; }
    setGenerating(true);
    try {
      const data = await generateResume(form);
      setGeneratedResume(data.resume);
      setAtsScore(data.ats_score);
      if (data.suggestions?.length) toast.success(data.suggestions[0]);
      setTab(3);
    } finally { setGenerating(false); }
  };

  const AtsBar = ({ score }) => {
    const color = score >= 80 ? '#34A853' : score >= 60 ? '#1A73E8' : '#FBBC04';
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work';
    return (
      <div className="card p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between mb-1 text-xs">
            <span className="font-medium text-g-text">ATS Score</span>
            <span className="font-bold" style={{ color }}>{score}% — {label}</span>
          </div>
          <div className="progress-bar-bg h-2.5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1 }}
              className="h-full rounded-full" style={{ background: color }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto page-enter bg-g-bg">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-g-text">📄 AI Resume Builder</h1>
          <p className="text-g-text-2 text-sm mt-1">ATS-optimized resume in minutes. Download as PDF.</p>
        </div>
        <button onClick={loadDemo} className="btn-primary flex items-center gap-2">⚡ Load Demo Resume</button>
      </motion.div>

      {/* Tab bar */}
      <div className="flex bg-g-surface border border-g-border rounded-2xl p-1 mb-6 gap-1 overflow-x-auto">
        {TABS.map((label, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              tab === i
                ? 'bg-g-blue-500 text-white shadow-sm'
                : 'text-g-text-2 hover:text-g-text hover:bg-g-bg'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {/* Tab 0 — Basic Info */}
          {tab === 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card space-y-4">
                <h2 className="font-semibold text-g-text">Personal Information</h2>
                {[['name','Full Name *'],['email','Email'],['phone','Phone'],['location','Location/City']].map(([k,l]) => (
                  <div key={k}>
                    <label className="label">{l}</label>
                    <input className="input-field" value={form[k]} onChange={e => update(k, e.target.value)} />
                  </div>
                ))}
                <div>
                  <label className="label">Professional Summary (leave blank to auto-generate)</label>
                  <textarea className="input-field resize-none h-24 text-sm" value={form.summary} onChange={e => update('summary', e.target.value)}
                    placeholder="Optional — AI generates this from your experience if blank…" />
                </div>
              </div>

              <div className="card">
                <h2 className="font-semibold text-g-text mb-4">Technical Skills</h2>
                <div className="flex gap-2 mb-3">
                  <input className="input-field" placeholder="Add skill → Enter" value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { if (skillInput && !form.skills.includes(skillInput)) update('skills', [...form.skills, skillInput]); setSkillInput(''); }}} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.skills.map(s => (
                    <span key={s} className="badge-blue flex items-center gap-1 text-xs">
                      {s}<button onClick={() => update('skills', form.skills.filter(x => x !== s))} className="hover:text-g-red-500">×</button>
                    </span>
                  ))}
                </div>
                {form.certifications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-g-text-2 mb-2">Certifications</p>
                    {form.certifications.map((c, i) => (
                      <span key={i} className="badge-green text-xs mr-1.5 mb-1.5 inline-flex items-center gap-1">
                        <CheckCircle size={9} />{c}
                        <button onClick={() => removeItem('certifications', i)} className="hover:text-g-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button onClick={() => { const c = prompt('Certification name:'); if (c) update('certifications', [...form.certifications, c]); }}
                  className="btn-ghost text-xs mt-3 flex items-center gap-1"><Plus size={12} /> Add Certification</button>
              </div>
            </div>
          )}

          {/* Tab 1 — Work Experience */}
          {tab === 1 && (
            <div className="space-y-4">
              {form.work_experience.map((exp, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-semibold text-g-text text-sm">Experience #{i + 1}</h3>
                    <button onClick={() => removeItem('work_experience', i)} className="text-g-red-500 hover:text-g-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[['title','Job Title'],['company','Company'],['duration','Duration (e.g. 2022–2024)'],['location','Location']].map(([k,l]) => (
                      <div key={k}>
                        <label className="label">{l}</label>
                        <input className="input-field" value={exp[k]} onChange={e => updateItem('work_experience', i, k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="label">Key Responsibilities / Achievements</label>
                    <textarea className="input-field resize-none h-20 text-sm" value={exp.description}
                      onChange={e => updateItem('work_experience', i, 'description', e.target.value)}
                      placeholder="Built REST APIs for 50K users, reduced latency by 40%…" />
                  </div>
                </motion.div>
              ))}
              <button onClick={() => addItem('work_experience', EMPTY_WORK)}
                className="btn-secondary w-full flex items-center justify-center gap-2">
                <Plus size={16} /> Add Work Experience
              </button>
            </div>
          )}

          {/* Tab 2 — Education & Projects */}
          {tab === 2 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-g-text">Education</h2>
                  <button onClick={() => addItem('education', EMPTY_EDU)} className="btn-ghost text-xs flex items-center gap-1"><Plus size={12}/> Add</button>
                </div>
                <div className="space-y-4">
                  {form.education.map((edu, i) => (
                    <div key={i} className="card space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-g-text-2 font-medium">Education #{i+1}</span>
                        <button onClick={() => removeItem('education', i)} className="text-g-red-400 hover:text-g-red-500"><Trash2 size={13}/></button>
                      </div>
                      {[['degree','Degree'],['institution','Institution'],['year','Year'],['gpa','GPA / CGPA']].map(([k,l]) => (
                        <div key={k}>
                          <label className="label">{l}</label>
                          <input className="input-field text-sm" value={edu[k]} onChange={e => updateItem('education', i, k, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  ))}
                  {!form.education.length && (
                    <div className="card border-dashed flex flex-col items-center py-8 text-center">
                      <p className="text-sm text-g-text-3">No education added yet</p>
                      <button onClick={() => addItem('education', EMPTY_EDU)} className="btn-ghost text-xs mt-2">+ Add</button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-g-text">Projects</h2>
                  <button onClick={() => addItem('projects', EMPTY_PROJ)} className="btn-ghost text-xs flex items-center gap-1"><Plus size={12}/> Add</button>
                </div>
                <div className="space-y-4">
                  {form.projects.map((proj, i) => (
                    <div key={i} className="card space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-g-text-2 font-medium">Project #{i+1}</span>
                        <button onClick={() => removeItem('projects', i)} className="text-g-red-400 hover:text-g-red-500"><Trash2 size={13}/></button>
                      </div>
                      {[['name','Project Name'],['tech','Tech Stack'],['link','GitHub / Live URL']].map(([k,l]) => (
                        <div key={k}>
                          <label className="label">{l}</label>
                          <input className="input-field text-sm" value={proj[k]} onChange={e => updateItem('projects', i, k, e.target.value)} />
                        </div>
                      ))}
                      <div>
                        <label className="label">Description</label>
                        <textarea className="input-field resize-none h-16 text-sm" value={proj.description}
                          onChange={e => updateItem('projects', i, 'description', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  {!form.projects.length && (
                    <div className="card border-dashed flex flex-col items-center py-8 text-center">
                      <p className="text-sm text-g-text-3">No projects added yet</p>
                      <button onClick={() => addItem('projects', EMPTY_PROJ)} className="btn-ghost text-xs mt-2">+ Add Project</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3 — Preview */}
          {tab === 3 && (
            <div>
              {atsScore !== null && <div className="mb-4"><AtsBar score={atsScore} /></div>}
              {generatedResume ? (
                <ResumePreview resume={generatedResume} />
              ) : (
                <div className="card flex flex-col items-center py-16 text-center">
                  <FileText size={48} className="text-g-text-3 mb-4" />
                  <p className="font-semibold text-g-text">No resume generated yet</p>
                  <p className="text-sm text-g-text-2 mt-1">Fill in your details then click Generate</p>
                  <button onClick={() => setTab(0)} className="btn-secondary mt-4 flex items-center gap-2">
                    Start Building <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom actions */}
      <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3">
          {tab > 0 && <button onClick={() => setTab(t => t - 1)} className="btn-secondary">← Back</button>}
          {tab < 3 && <button onClick={() => setTab(t => t + 1)} className="btn-secondary flex items-center gap-1">Next <ChevronRight size={14}/></button>}
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {generating ? 'Generating…' : 'Generate ATS Resume'}
        </button>
      </div>
    </div>
  );
}
