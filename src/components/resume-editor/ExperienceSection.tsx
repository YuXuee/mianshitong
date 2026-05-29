import { useState } from 'react';
import { Briefcase, Trash2, Plus, X, GripVertical } from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SortableSection } from './SortableSection';
import type { ExperienceItem } from '@/types/resume';

function BulletItem({ bullet, index, onChange, onDelete }: {
  bullet: string;
  index: number;
  onChange: (v: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-2 group">
      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
      <Textarea
        value={bullet}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-h-[40px] text-sm py-2 resize-none"
        rows={1}
        onInput={(e) => {
          const el = e.target as HTMLTextAreaElement;
          el.style.height = 'auto';
          el.style.height = el.scrollHeight + 'px';
        }}
      />
      <button
        onClick={onDelete}
        className="mt-2 opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function ExperienceItemEditor({ item, onChange, onDelete }: {
  item: ExperienceItem;
  onChange: (item: ExperienceItem) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const update = (field: keyof ExperienceItem, value: unknown) => {
    onChange({ ...item, [field]: value });
  };

  const updateBullet = (idx: number, val: string) => {
    const bullets = [...item.bullets];
    bullets[idx] = val;
    update('bullets', bullets);
  };

  const addBullet = () => {
    update('bullets', [...item.bullets, '']);
  };

  const deleteBullet = (idx: number) => {
    update('bullets', item.bullets.filter((_, i) => i !== idx));
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-xl bg-background overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
        <button className="drag-handle" {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">
            {item.title || '职位名称'} {item.company ? `@ ${item.company}` : ''}
          </p>
          {(item.startDate || item.current) && (
            <p className="text-xs text-muted-foreground">
              {item.startDate} — {item.current ? '至今' : item.endDate || ''}
            </p>
          )}
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
        >
          {expanded ? '收起' : '展开'}
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">公司名称</Label>
              <Input value={item.company} onChange={(e) => update('company', e.target.value)} placeholder="公司名称" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">职位</Label>
              <Input value={item.title} onChange={(e) => update('title', e.target.value)} placeholder="职位名称" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">开始时间</Label>
              <Input value={item.startDate} onChange={(e) => update('startDate', e.target.value)} placeholder="2020-03" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                结束时间
                <button
                  onClick={() => { update('current', !item.current); if (!item.current) update('endDate', ''); }}
                  className="ml-2"
                >
                  <Badge variant={item.current ? 'info' : 'secondary'} className="text-xs cursor-pointer hover:opacity-80">
                    {item.current ? '在职中' : '标为在职'}
                  </Badge>
                </button>
              </Label>
              <Input
                value={item.endDate}
                onChange={(e) => update('endDate', e.target.value)}
                placeholder="2023-06"
                disabled={item.current}
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">工作地点（可选）</Label>
              <Input value={item.location || ''} onChange={(e) => update('location', e.target.value)} placeholder="北京" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">工作职责 / 成就</Label>
            {item.bullets.map((bullet, idx) => (
              <BulletItem
                key={idx}
                bullet={bullet}
                index={idx}
                onChange={(v) => updateBullet(idx, v)}
                onDelete={() => deleteBullet(idx)}
              />
            ))}
            <button
              onClick={addBullet}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              添加一条职责
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ExperienceSectionProps {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
}

export default function ExperienceSection({ items, onChange }: ExperienceSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const addItem = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, updated: ExperienceItem) => {
    onChange(items.map((i) => (i.id === id ? updated : i)));
  };

  const deleteItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  return (
    <SortableSection
      id="experience"
      title="工作经历"
      icon={<Briefcase className="w-4 h-4" />}
      onAdd={addItem}
      addLabel="添加经历"
    >
      {items.length === 0 ? (
        <button
          onClick={addItem}
          className="w-full py-6 text-center text-sm text-muted-foreground hover:text-primary border border-dashed border-border rounded-xl hover:border-primary/50 transition-colors"
        >
          <Plus className="w-4 h-4 mx-auto mb-1" />
          添加工作经历
        </button>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd as never}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <ExperienceItemEditor
                  key={item.id}
                  item={item}
                  onChange={(updated) => updateItem(item.id, updated)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </SortableSection>
  );
}
