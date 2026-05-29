import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import Navbar from '@/components/layout/Navbar';
import { useResumes, deleteResume } from '@/hooks/useResume';
import type { Resume } from '@/types/resume';
import { toast } from 'sonner';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusLabel: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'secondary' }> = {
  ready: { label: '已完成', variant: 'success' },
  parsing: { label: '解析中', variant: 'info' },
  draft: { label: '草稿', variant: 'secondary' },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { resumes, loading, refetch } = useResumes();
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteResume(deleteTarget.id);
    if (error) {
      toast.error('删除失败，请重试');
    } else {
      toast.success('简历已删除');
      refetch();
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">我的简历</h1>
            <p className="text-muted-foreground mt-1 text-sm">{resumes.length} 份简历</p>
          </div>
          <Button variant="gradient" onClick={() => navigate('/editor/new')}>
            <Plus className="w-4 h-4" />
            新建简历
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(214, 100%, 95%), hsl(213, 97%, 90%))' }}>
              <FileText className="w-8 h-8 text-primary/60" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">还没有简历</h2>
            <p className="text-muted-foreground mb-6 text-sm">上传你的简历，让 AI 帮你针对 JD 进行优化</p>
            <Button variant="gradient" onClick={() => navigate('/editor/new')}>
              <Plus className="w-4 h-4" />
              创建第一份简历
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New card */}
            <button
              onClick={() => navigate('/editor/new')}
              className="flex flex-col items-center justify-center gap-3 h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-muted-foreground hover:text-primary group"
            >
              <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">新建简历</span>
            </button>

            {resumes.map((resume) => {
              const status = statusLabel[resume.status] || statusLabel.draft;
              return (
                <Card
                  key={resume.id}
                  className="p-5 flex flex-col gap-3 hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(`/editor/${resume.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, hsl(214, 100%, 95%), hsl(213, 97%, 90%))' }}>
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(resume); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all text-muted-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate text-sm">{resume.title}</h3>
                    {resume.jd_text && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {resume.jd_text.slice(0, 60)}...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(resume.updated_at)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                      <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <DialogTitle>删除简历</DialogTitle>
            </div>
            <DialogDescription>
              确定要删除「{deleteTarget?.title}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '删除中...' : '确认删除'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
