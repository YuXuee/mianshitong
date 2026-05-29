import type { ResumeData } from '@/types/resume';

export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');

  const element = document.getElementById(elementId);
  if (!element) throw new Error('找不到预览元素');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let position = 0;
  let remainingHeight = imgHeight;

  while (remainingHeight > 0) {
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    remainingHeight -= pageHeight;
    position -= pageHeight;
    if (remainingHeight > 0) {
      pdf.addPage();
    }
  }

  pdf.save(`${filename}.pdf`);
}
