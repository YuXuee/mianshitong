import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ResumePreview from '@/components/resume-preview/ResumePreview';
import { useResume } from '@/hooks/useResume';
import { exportToPDF } from '@/lib/export-pdf';
import { exportToDocx } from '@/lib/export-docx';
import type { ResumeData } from '@/types/resume';
import { toast } from 'sonner';

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resume, loading } = useResume(id);
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);

  const resumeData = resume?.resume_data as unknown as ResumeData | null;
  const filename = resume?.title || '我的简历';

  const handleExportPDF = async () => {
    if (!resumeData) return;
    setExporting('pdf');
    try {
      await exportToPDF('resume-preview-content', filename);
      toast.success('PDF 导出成功！');
    } catch (err) {
      toast.error('PDF 导出失败，请重试');
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportDocx = async () => {
    if (!resumeData) return;
    setExporting('docx');
    try {
      await exportToDocx(resumeData, filename);
      toast.success('Word 文档导出成功！');
    } catch (err) {
      toast.error('Word 导出失败，请重试');
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!resume || !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-2">找不到简历</h2>
          <Button onClick={() => navigate('/dashboard')}>返回我的简历</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 h-14">
          <button
            onClick={() => navigate(`/editor/${id}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回编辑
          </button>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">{resume.title}</span>
            <Badge variant="success" className="hidden sm:inline-flex">预览</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDocx}
              disabled={!!exporting}
            >
              {exporting === 'docx' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">导出 Word</span>
            </Button>

            <Button
              variant="gradient"
              size="sm"
              onClick={handleExportPDF}
              disabled={!!exporting}
            >
              {exporting === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting === 'pdf' ? '导出中...' : '导出 PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 flex flex-col items-center py-8 px-4">
        {/* Info banner */}
        <div className="w-full max-w-2xl mb-6 p-3 rounded-xl bg-card border border-border flex items-center gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <p className="text-muted-foreground flex-1">
            导出的 PDF 和 Word 文档将包含「<span className="text-foreground font-medium">面试通</span>」水印
          </p>
          <Badge variant="info" className="shrink-0">含水印</Badge>
        </div>

        {/* Resume preview */}
        <div className="shadow-panel rounded-sm overflow-hidden">
          <ResumePreview
            ref={previewRef}
            data={resumeData}
            showWatermark
          />
        </div>

        {/* Export buttons (bottom) */}
        <div className="flex gap-3 mt-8 mb-4">
          <Button variant="outline" size="lg" onClick={handleExportDocx} disabled={!!exporting}>
            {exporting === 'docx' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {exporting === 'docx' ? '导出中...' : '导出为 Word (.docx)'}
          </Button>
          <Button variant="gradient" size="lg" onClick={handleExportPDF} disabled={!!exporting}>
            {exporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting === 'pdf' ? '导出中...' : '导出为 PDF'}
          </Button>
        </div>
      </div>
    </div>
  );
}
