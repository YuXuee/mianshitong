import { forwardRef } from 'react';
import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, showWatermark = false }, ref) => {
  const { personal, summary, experience, education, skills, certifications, projects } = data;

  return (
    <div
      ref={ref}
      id="resume-preview-content"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '16mm 18mm',
        background: '#ffffff',
        fontFamily: '"Source Han Serif", "Noto Serif SC", Georgia, serif',
        color: '#1a1a1a',
        fontSize: '10pt',
        lineHeight: 1.5,
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Watermark */}
      {showWatermark && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 10,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                transform: `rotate(-30deg) translate(${(i % 3 - 1) * 200}px, ${(Math.floor(i / 3) - 1) * 150}px)`,
                fontSize: '28pt',
                fontWeight: 700,
                color: 'rgba(59, 130, 246, 0.08)',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                letterSpacing: '0.05em',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              面试通
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '2px solid #1a365d', paddingBottom: '12px' }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: '#1a365d', margin: '0 0 4px', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.02em' }}>
          {personal.name || '姓名'}
        </h1>
        {personal.jobTitle && (
          <p style={{ fontSize: '11pt', color: '#4a6fa5', margin: '0 0 6px', fontFamily: 'system-ui, sans-serif' }}>
            {personal.jobTitle}
          </p>
        )}
        <div style={{ fontSize: '9pt', color: '#555', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', fontFamily: 'system-ui, sans-serif' }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <><span>·</span><span>{personal.phone}</span></>}
          {personal.location && <><span>·</span><span>{personal.location}</span></>}
          {personal.linkedin && <><span>·</span><span>{personal.linkedin}</span></>}
          {personal.website && <><span>·</span><span>{personal.website}</span></>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="个人简介">
          <p style={{ fontSize: '9.5pt', color: '#333', lineHeight: 1.6, margin: 0 }}>{summary}</p>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="工作经历">
          {experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '10pt', fontFamily: 'system-ui, sans-serif' }}>{exp.title}</span>
                  {exp.company && <span style={{ fontSize: '10pt', color: '#4a6fa5', fontFamily: 'system-ui, sans-serif' }}> · {exp.company}</span>}
                </div>
                <span style={{ fontSize: '9pt', color: '#777', fontFamily: 'system-ui, sans-serif', whiteSpace: 'nowrap' }}>
                  {exp.startDate}{exp.endDate || exp.current ? ` — ${exp.current ? '至今' : exp.endDate}` : ''}
                </span>
              </div>
              {exp.location && <p style={{ fontSize: '9pt', color: '#777', margin: '0 0 3px', fontFamily: 'system-ui, sans-serif' }}>{exp.location}</p>}
              {exp.bullets.length > 0 && (
                <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} style={{ fontSize: '9.5pt', color: '#333', marginBottom: '2px', lineHeight: 1.5 }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="教育背景">
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '10pt', fontFamily: 'system-ui, sans-serif' }}>{edu.school}</span>
                <span style={{ fontSize: '9pt', color: '#777', fontFamily: 'system-ui, sans-serif' }}>
                  {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ''}
                </span>
              </div>
              <p style={{ fontSize: '9.5pt', color: '#555', margin: '1px 0', fontFamily: 'system-ui, sans-serif' }}>
                {edu.degree}{edu.field ? ` · ${edu.field}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
              </p>
              {edu.description && <p style={{ fontSize: '9pt', color: '#777', margin: '2px 0 0' }}>{edu.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="专业技能">
          {skills.map((group) => (
            <div key={group.id} style={{ display: 'flex', gap: '8px', marginBottom: '4px', flexWrap: 'wrap', alignItems: 'baseline' }}>
              {group.category && (
                <span style={{ fontWeight: 600, fontSize: '9.5pt', color: '#333', fontFamily: 'system-ui, sans-serif', minWidth: '80px' }}>
                  {group.category}：
                </span>
              )}
              <span style={{ fontSize: '9.5pt', color: '#555', flex: 1 }}>{group.items.join(' · ')}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="项目经历">
          {projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '10pt', fontFamily: 'system-ui, sans-serif' }}>{proj.name}</span>
                {(proj.startDate || proj.endDate) && (
                  <span style={{ fontSize: '9pt', color: '#777', fontFamily: 'system-ui, sans-serif' }}>
                    {proj.startDate}{proj.endDate ? ` — ${proj.endDate}` : ''}
                  </span>
                )}
              </div>
              {proj.description && <p style={{ fontSize: '9.5pt', color: '#333', margin: '2px 0', lineHeight: 1.5 }}>{proj.description}</p>}
              {proj.tech.length > 0 && (
                <p style={{ fontSize: '9pt', color: '#4a6fa5', margin: '2px 0', fontFamily: 'system-ui, sans-serif' }}>
                  技术栈：{proj.tech.join(' · ')}
                </p>
              )}
              {proj.url && <p style={{ fontSize: '9pt', color: '#777', margin: '1px 0' }}>{proj.url}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="证书 & 荣誉">
          {certifications.map((cert) => (
            <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '9.5pt', fontFamily: 'system-ui, sans-serif' }}>{cert.name}</span>
                {cert.issuer && <span style={{ fontSize: '9.5pt', color: '#555' }}> · {cert.issuer}</span>}
              </div>
              {cert.date && <span style={{ fontSize: '9pt', color: '#777', fontFamily: 'system-ui, sans-serif' }}>{cert.date}</span>}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{
        fontSize: '10.5pt',
        fontWeight: 700,
        color: '#1a365d',
        borderBottom: '1px solid #cbd5e0',
        marginBottom: '6px',
        paddingBottom: '2px',
        fontFamily: 'system-ui, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default ResumePreview;
