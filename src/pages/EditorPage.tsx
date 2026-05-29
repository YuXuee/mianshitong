import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, Eye, Sparkles, ChevronLeft, Loader2, AlertCircle, Edit3, Check,
} from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import PersonalSection from '@/components/resume-editor/PersonalSection';
import SummarySection from '@/components/resume-editor/SummarySection';
import ExperienceSection from '@/components/resume-editor/ExperienceSection';
import EducationSection from '@/components/resume-editor/EducationSection';
import SkillsSection from '@/components/resume-editor/SkillsSection';
import ProjectsSection from '@/components/resume-editor/ProjectsSection';
import ResumePreview from '@/components/resume-preview/ResumePreview';
import { useResume } from '@/hooks/useResume';
import { supabase } from '@/integrations/supabase/client';
import type { ResumeData } from '@/types/resume';
import { emptyResumeData } from '@/types/resume';
import { toast } from 'sonner';

const SECTION_ORDER_DEFAULT = ['personal', 'summary', 'experience', 'education', 'skills', 'projects'];

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resume, loading, updateResume } = useResume(id);

  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData);
  const [sectionOrder, setSectionOrder] = useState(SECTION_ORDER_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [unsaved, setUnsaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Load resume data
  useEffect(() => {
    if (resume?.resume_data) {
      setResumeData(resume.resume_data as unknown as ResumeData);
    }
    if (resume?.title) {
      setTitleValue(resume.title);
    }
  }, [resume]);

  // Auto-save debounce
  const autoSave = useCallback(
    (data: ResumeData) => {
      clearTimeout(saveTimerRef.current);
      setUnsaved(true);
      saveTimerRef.current = setTimeout(async () => {
        if (!id) return;
        const { error } = await supabase.from('resumes').update({
          resume_data: data as unknown,
          status: 'ready',
        }).eq('id', id);
        if (!error) setUnsaved(false);
      }, 2000);
    },
    [id]
  );

  const handleDataChange = (newData: ResumeData) => {
    setResumeData(newData);
    autoSave(newData);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    clearTimeout(saveTimerRef.current);
    const { error } = await supabase.from('resumes').update({
      resume_data: resumeData as unknown,
      status: 'ready',
    }).eq('id', id);
    if (!error) {
      setUnsaved(false);
      toast.success('已保存');
    } else {
      toast.error('保存失败');
    }
    setSaving(false);
  };

  const handleOptimize = async () => {
    if (!resume?.jd_text) {
      toast.error('请先在上传页面提供目标岗位 JD');
      return;
    }
    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-resume', {
        body: {
          resumeData,
          jdText: resume.jd_text,
        },
      });
      if (error || !data?.success) throw new Error(data?.error || error?.message || '优化失败');
      handleDataChange(data.optimizedData);
      toast.success('简历已根据 JD 优化！');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '优化失败，请重试');
    } finally {
      setOptimizing(false);
    }
  };

  const handleTitleSave = async () => {
    if (!id || !titleValue.trim()) return;
    await updateResume({ title: titleValue.trim() });
    setEditingTitle(false);
    toast.success('标题已更新');
  };

  // DnD for sections
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSectionDragEnd = (event: { active: { id: unknown }; over: { id: unknown } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sectionOrder.indexOf(active.id as string);
    const newIdx = sectionOrder.indexOf(over.id as string);
    setSectionOrder(arrayMove(sectionOrder, oldIdx, newIdx));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">加载简历...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
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

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return (
          <PersonalSection
            key="personal"
            data={resumeData.personal}
            onChange={(d) => handleDataChange({ ...resumeData, personal: d })}
          />
        );
      case 'summary':
        return (
          <SummarySection
            key="summary"
            value={resumeData.summary}
            onChange={(v) => handleDataChange({ ...resumeData, summary: v })}
          />
        );
      case 'experience':
        return (
          <ExperienceSection
            key="experience"
            items={resumeData.experience}
            onChange={(items) => handleDataChange({ ...resumeData, experience: items })}
          />
        );
      case 'education':
        return (
          <EducationSection
            key="education"
            items={resumeData.education}
            onChange={(items) => handleDataChange({ ...resumeData, education: items })}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            key="skills"
            items={resumeData.skills}
            onChange={(items) => handleDataChange({ ...resumeData, skills: items })}
          />
        );
      case 'projects':
        return (
          <ProjectsSection
            key="projects"
            items={resumeData.projects}
            onChange={(items) => handleDataChange({ ...resumeData, projects: items })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">我的简历</span>
          </button>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditingTitle(false); }}
                  className="h-7 text-sm w-52"
                  autoFocus
                />
                <button onClick={handleTitleSave} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setEditingTitle(true)} className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors truncate max-w-[200px]">
                <span className="truncate">{resume.title}</span>
                <Edit3 className="w-3.5 h-3.5 shrink-0 opacity-50" />
              </button>
            )}
            {unsaved && <span className="text-xs text-muted-foreground shrink-0">未保存</span>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {resume.jd_text && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptimize}
                disabled={optimizing}
                className="hidden sm:inline-flex"
              >
                {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {optimizing ? '优化中...' : '根据 JD 优化'}
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">{saving ? '保存中...' : '保存'}</span>
            </Button>

            <Button variant="gradient" size="sm" onClick={() => navigate(`/editor/${id}/preview`)}>
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">预览导出</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor panels */}
        <ScrollArea className="w-full lg:w-[480px] xl:w-[520px] shrink-0 border-r border-border">
          <div className="p-4 space-y-3">
            {/* JD optimization tip */}
            {!resume.jd_text && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>未提供 JD，无法使用 AI 根据岗位优化简历。</span>
              </div>
            )}

            {resume.jd_text && (
              <button
                onClick={handleOptimize}
                disabled={optimizing}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-primary/20 text-sm font-medium text-primary hover:bg-primary/5 transition-colors lg:hidden"
              >
                {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {optimizing ? 'AI 优化中...' : '根据 JD 优化简历'}
              </button>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd as never}
            >
              <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {sectionOrder.map((sectionId) => renderSection(sectionId))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="h-8" />
          </div>
        </ScrollArea>

        {/* Right: Live preview (desktop only) */}
        <div className="hidden lg:flex flex-1 items-start justify-center bg-muted/30 overflow-auto p-8">
          <div className="shadow-panel rounded-sm overflow-hidden" style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
            <ResumePreview data={resumeData} showWatermark />
          </div>
        </div>
      </div>
    </div>
  );
}
