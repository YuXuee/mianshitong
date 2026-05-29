import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, FileText, Type, Upload, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import FileDropzone from '@/components/upload/FileDropzone';
import JDInput from '@/components/upload/JDInput';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { createResume } from '@/hooks/useResume';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ResumeData } from '@/types/resume';

type Step = 'upload' | 'parsing';

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractResumeContent(file: File): Promise<{ type: string; content: string; mimeType: string }> {
  if (file.type === 'text/plain') {
    const text = await file.text();
    return { type: 'text', content: text, mimeType: 'text/plain' };
  }

  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { type: 'text', content: result.value, mimeType: 'text/plain' };
  }

  // PDF or image - send as base64
  const base64 = await fileToBase64(file);
  return { type: file.type.startsWith('image/') ? 'image' : 'pdf', content: base64, mimeType: file.type };
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('upload');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  // Resume fields
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeInputMode, setResumeInputMode] = useState<'file' | 'text'>('file');
  const [resumeText, setResumeText] = useState('');

  // JD fields
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);

  // Title
  const [title, setTitle] = useState('');

  const hasResume = resumeFile || resumeText.trim();
  const canProceed = hasResume;

  const handleStart = async () => {
    if (!user || !canProceed) return;

    setStep('parsing');
    setProgress(10);
    setProgressLabel('创建简历记录...');

    try {
      // Create resume record
      const resumeTitle = title.trim() || (resumeFile ? resumeFile.name.replace(/\.[^/.]+$/, '') : '我的简历');
      const resume = await createResume(resumeTitle, user.id);
      if (!resume) throw new Error('创建简历失败');

      // Save JD text if provided
      if (jdText.trim()) {
        await supabase.from('resumes').update({ jd_text: jdText }).eq('id', resume.id);
      }

      setProgress(25);
      setProgressLabel('提取简历内容...');

      // Extract resume content
      let content: { type: string; content: string; mimeType: string };
      if (resumeText.trim()) {
        content = { type: 'text', content: resumeText, mimeType: 'text/plain' };
      } else if (resumeFile) {
        content = await extractResumeContent(resumeFile);
      } else {
        throw new Error('请上传简历');
      }

      // Extract JD content if file
      let jdContent: string = jdText;
      if (jdFile && !jdText) {
        try {
          if (jdFile.type === 'text/plain') {
            jdContent = await jdFile.text();
          } else {
            const b64 = await fileToBase64(jdFile);
            jdContent = `[JD_IMAGE:${jdFile.type}:${b64}]`;
          }
        } catch {
          // ignore JD extraction errors
        }
      }

      setProgress(50);
      setProgressLabel('AI 正在解析简历结构...');

      // Call parse-resume edge function
      await supabase.from('resumes').update({ status: 'parsing' }).eq('id', resume.id);

      const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-resume', {
        body: {
          resumeId: resume.id,
          contentType: content.type,
          content: content.content,
          mimeType: content.mimeType,
          jdText: jdContent || undefined,
        },
      });

      if (parseError) throw new Error(parseError.message);

      setProgress(85);
      setProgressLabel('保存解析结果...');

      const resumeData: ResumeData = parseResult.resumeData;
      await supabase.from('resumes').update({
        resume_data: resumeData as unknown,
        status: 'ready',
      }).eq('id', resume.id);

      setProgress(100);
      setProgressLabel('解析完成！正在跳转...');

      setTimeout(() => {
        navigate(`/editor/${resume.id}`);
      }, 600);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '解析失败';
      toast.error(msg);
      setStep('upload');
      setProgress(0);
    }
  };

  if (step === 'parsing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md px-6 text-center animate-in">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(224, 76%, 48%), hsl(217, 91%, 60%))' }}>
            <Sparkles className="w-8 h-8 text-white animate-pulse-soft" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">AI 正在解析简历</h2>
          <p className="text-sm text-muted-foreground mb-8">{progressLabel}</p>
          <Progress value={progress} className="mb-3" />
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          返回
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">新建简历</h1>
          <p className="text-muted-foreground text-sm">上传你的简历，AI 将自动解析并结构化内容</p>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">简历标题（可选）</Label>
            <Input
              id="title"
              placeholder="例如：前端工程师 - 字节跳动"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Resume upload */}
          <div className="editor-section">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(214, 100%, 92%), hsl(213, 97%, 87%))' }}>
                <FileText className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">上传简历 <span className="text-destructive">*</span></span>
            </div>

            <Tabs value={resumeInputMode} onValueChange={(v) => setResumeInputMode(v as 'file' | 'text')}>
              <TabsList className="h-9 mb-4">
                <TabsTrigger value="file" className="text-xs gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  文件上传
                </TabsTrigger>
                <TabsTrigger value="text" className="text-xs gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  粘贴文本
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file">
                <FileDropzone
                  label="拖拽或点击上传简历"
                  hint="支持 PDF、Word (.docx)、JPG、PNG"
                  onFileAccepted={setResumeFile}
                />
              </TabsContent>

              <TabsContent value="text">
                <Textarea
                  placeholder="将简历内容粘贴到这里..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[180px] text-sm"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* JD input */}
          <div className="editor-section">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(214, 100%, 92%), hsl(213, 97%, 87%))' }}>
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <span className="font-semibold text-sm text-foreground">目标岗位 JD</span>
                <span className="text-xs text-muted-foreground ml-2">（可选，用于 AI 针对性优化）</span>
              </div>
            </div>
            <JDInput
              value={jdText}
              onChange={setJdText}
              onFileAccepted={setJdFile}
            />
          </div>

          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={!canProceed}
          >
            <Sparkles className="w-4 h-4" />
            开始 AI 解析简历
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
