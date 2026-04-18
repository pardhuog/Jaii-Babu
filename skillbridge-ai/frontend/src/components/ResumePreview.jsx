import { useRef } from 'react';
import { Download, Mail, Phone, MapPin, Github, Star } from 'lucide-react';

export default function ResumePreview({ resume, data, atsScore = 0 }) {
  // Support both 'resume' and 'data' prop names for backwards compatibility
  const d = resume || data;
  const resumeRef = useRef(null);

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf()
      .set({
        margin: 10,
        filename: `${d?.name || 'resume'}_SkillBridgeAI.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(resumeRef.current)
      .save();
  };

  if (!d) {
    return (
      <div className="card h-full flex items-center justify-center text-g-text-3 text-sm">
        Fill in the form to preview your resume →
      </div>
    );
  }

  const { name, email, phone, location, summary, skills = [], work_experience = [], education = [], projects = [], certifications = [] } = d;

  return (
    <div className="space-y-4">
      {/* ATS score + download */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
        <span className="text-sm text-g-text-2">ATS Score:</span>
          <div className="flex items-center gap-2">
            <div className="progress-bar-bg w-24">
              <div
                className="h-full rounded-full bg-g-blue-500"
                style={{ width: `${atsScore}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-g-text">{atsScore}%</span>
          </div>
        </div>
        <button onClick={downloadPDF} className="btn-primary text-sm flex items-center gap-2 py-2">
          <Download size={14} /> Download PDF
        </button>
      </div>

      {/* Resume paper */}
      <div
        ref={resumeRef}
        className="bg-white text-gray-800 rounded-xl p-8 shadow-2xl overflow-hidden font-['Inter',_sans-serif] text-sm leading-relaxed"
        style={{ minHeight: '800px' }}
      >
        {/* Header */}
        <div className="border-b-2 border-indigo-600 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-gray-600">
            {email && <span className="flex items-center gap-1"><Mail size={10} />{email}</span>}
            {phone && <span className="flex items-center gap-1"><Phone size={10} />{phone}</span>}
            {location && <span className="flex items-center gap-1"><MapPin size={10} />{location}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1.5">Professional Summary</h2>
            <p className="text-gray-700">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1.5">Technical Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {work_experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Work Experience</h2>
            <div className="space-y-3">
              {work_experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-indigo-200 pl-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{exp.title}</p>
                      <p className="text-gray-600 text-xs">{exp.company} — {exp.location}</p>
                    </div>
                    <span className="text-xs text-gray-500">{exp.duration}</span>
                  </div>
                  {exp.description && <p className="text-gray-700 mt-1 text-xs">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Projects</h2>
            <div className="space-y-2">
              {projects.map((p, i) => (
                <div key={i} className="border-l-2 border-indigo-200 pl-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <span className="text-xs text-indigo-600 font-medium">({p.tech})</span>
                  </div>
                  {p.description && <p className="text-gray-700 text-xs mt-0.5">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Education</h2>
            {education.map((edu, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-gray-600 text-xs">{edu.institution}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>{edu.year}</p>
                  {edu.gpa && <p>GPA: {edu.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Certifications</h2>
            <ul className="list-disc list-inside space-y-0.5">
              {certifications.map((c, i) => (
                <li key={i} className="text-gray-700 text-xs">{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-gray-200 text-[9px] text-gray-400 text-center">
          Generated by SkillBridge AI • ATS-Optimized Resume
        </div>
      </div>
    </div>
  );
}
