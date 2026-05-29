import { FolderOpen, Trash2, Plus, X, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SortableSection } from './SortableSection';
import type { ProjectItem } from '@/types/resume';

function ProjectItemEditor({ item, onChange, onDelete }: {
  item: ProjectItem;
  onChange: (item: ProjectItem) => void;
  onDelete: () => void;
}) {
  const [newTech, setNewTech] = useState('');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const update = (field: keyof ProjectItem, value: unknown) => onChange({ ...item, [field]: value });

  const addTech = () => {
    const t = newTech.trim();
    if (!t) return;
    update('tech', [...item.tech, t]);
    setNewTech('');
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-xl bg-background overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
        <button className="drag-handle" {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4" />
        </button>
        <p className="flex-1 font-medium text-sm truncate">{item.name || '项目名称'}</p>
        <button onClick={onDelete} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">项目名称</Label>
            <Input value={item.name} onChange={(e) => update('name', e.target.value)} placeholder="项目名称" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">开始时间（可选）</Label>
            <Input value={item.startDate || ''} onChange={(e) => update('startDate', e.target.value)} placeholder="2022-01" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">结束时间（可选）</Label>
            <Input value={item.endDate || ''} onChange={(e) => update('endDate', e.target.value)} placeholder="2022-06" />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">项目链接（可选）</Label>
            <Input value={item.url || ''} onChange={(e) => update('url', e.target.value)} placeholder="https://github.com/..." />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">项目描述</Label>
            <Textarea value={item.description} onChange={(e) => update('description', e.target.value)} placeholder="简要描述项目背景、你的职责和取得的成果..." className="min-h-[80px] text-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">技术栈</Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {item.tech.map((t, i) => (
              <span key={i} className="skill-tag">
                {t}
                <button onClick={() => update('tech', item.tech.filter((_, idx) => idx !== i))} className="ml-1 text-muted-foreground/60 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newTech} onChange={(e) => setNewTech(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTech()} placeholder="输入技术后按 Enter" className="text-sm h-8" />
            <button onClick={addTech} className="px-2 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectsSectionProps {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
}

export default function ProjectsSection({ items, onChange }: ProjectsSectionProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = items.findIndex((i) => i.id === active.id);
      const newIdx = items.findIndex((i) => i.id === over.id);
      onChange(arrayMove(items, oldIdx, newIdx));
    }
  };

  const addItem = () => {
    onChange([...items, { id: `proj-${Date.now()}`, name: '', description: '', tech: [] }]);
  };

  return (
    <SortableSection id="projects" title="项目经历" icon={<FolderOpen className="w-4 h-4" />} onAdd={addItem} addLabel="添加项目">
      {items.length === 0 ? (
        <button onClick={addItem} className="w-full py-6 text-center text-sm text-muted-foreground hover:text-primary border border-dashed border-border rounded-xl hover:border-primary/50 transition-colors">
          <Plus className="w-4 h-4 mx-auto mb-1" />
          添加项目经历
        </button>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd as never}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <ProjectItemEditor
                  key={item.id}
                  item={item}
                  onChange={(updated) => onChange(items.map((i) => (i.id === item.id ? updated : i)))}
                  onDelete={() => onChange(items.filter((i) => i.id !== item.id))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </SortableSection>
  );
}
