import type { ResumeData } from '@/types/resume';

export async function exportToDocx(data: ResumeData, filename: string): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, BorderStyle, WidthType, Table, TableRow, TableCell,
  } = await import('docx');

  const { personal, summary, experience, education, skills, projects, certifications } = data;

  const sectionHeading = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: '1a365d' })],
      spacing: { before: 200, after: 100 },
      border: {
        bottom: { color: 'cbd5e0', style: BorderStyle.SINGLE, size: 6 },
      },
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = [];

  // Header - name
  children.push(
    new Paragraph({
      children: [new TextRun({ text: personal.name || '姓名', bold: true, size: 36, color: '1a365d' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    })
  );

  // Job title
  if (personal.jobTitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: personal.jobTitle, size: 24, color: '4a6fa5' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      })
    );
  }

  // Contact info
  const contactParts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean);
  children.push(
    new Paragraph({
      children: [new TextRun({ text: contactParts.join(' · '), size: 18, color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Watermark note
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '本简历由「面试通」AI 智能优化 — mianshitong.ai', size: 16, color: 'aaaaaa', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Summary
  if (summary) {
    children.push(sectionHeading('个人简介'));
    children.push(new Paragraph({
      children: [new TextRun({ text: summary, size: 20 })],
      spacing: { after: 120 },
    }));
  }

  // Experience
  if (experience.length > 0) {
    children.push(sectionHeading('工作经历'));
    experience.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 22 }),
            new TextRun({ text: exp.company ? ` · ${exp.company}` : '', size: 22, color: '4a6fa5' }),
            new TextRun({ text: `   ${exp.startDate}${exp.endDate || exp.current ? ` — ${exp.current ? '至今' : exp.endDate}` : ''}`, size: 18, color: '777777' }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );
      exp.bullets.filter(Boolean).forEach((bullet) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: bullet, size: 20 })],
            bullet: { level: 0 },
            spacing: { after: 40 },
          })
        );
      });
    });
  }

  // Education
  if (education.length > 0) {
    children.push(sectionHeading('教育背景'));
    education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.school, bold: true, size: 22 }),
            new TextRun({ text: ` · ${edu.degree}${edu.field ? ` ${edu.field}` : ''}`, size: 20, color: '555555' }),
          ],
          spacing: { before: 80, after: 40 },
        })
      );
    });
  }

  // Skills
  if (skills.length > 0) {
    children.push(sectionHeading('专业技能'));
    skills.forEach((group) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: group.category ? `${group.category}：` : '', bold: true, size: 20 }),
            new TextRun({ text: group.items.join(' · '), size: 20, color: '555555' }),
          ],
          spacing: { after: 60 },
        })
      );
    });
  }

  // Projects
  if (projects.length > 0) {
    children.push(sectionHeading('项目经历'));
    projects.forEach((proj) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: proj.name, bold: true, size: 22 })],
          spacing: { before: 80, after: 40 },
        })
      );
      if (proj.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: proj.description, size: 20 })],
          spacing: { after: 40 },
        }));
      }
      if (proj.tech.length > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `技术栈：${proj.tech.join(' · ')}`, size: 18, color: '4a6fa5' })],
          spacing: { after: 60 },
        }));
      }
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
