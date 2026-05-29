import { GraduationCap, Trash2, Plus, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SortableSection } from './SortableSection';
import type { EducationItem } from '@/types/resume';

function EducationItemEditor({ item, onChange, onDelete }: {
  item: EducationItem;
  onChange: (item: EducationItem) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const update = (field: keyof EducationItem, value: string) => onChange({ ...item, [field]: value });

  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-xl bg-background overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
        <button className="drag-handle" {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.school || '学校名称'}</p>
          <p className="text-xs text-muted-foreground">{item.degree} {item.field && `· ${item.field}`}</p>
        </div>
        <button onClick={onDelete} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-xs text-muted-foreground">学校名称</Label>
          <Input value={item.school} onChange={(e) => update('school', e.target.value)} placeholder="北京大学" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">学位</Label>
          <Input value={item.degree} onChange={(e) => update('degree', e.target.value)} placeholder="本科/硕士/博士" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">专业</Label>
          <Input value={item.field} onChange={(e) => update('field', e.target.value)} placeholder="计算机科学" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">入学时间</Label>
          <Input value={item.startDate} onChange={(e) => update('startDate', e.target.value)} placeholder="2016-09" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">毕业时间</Label>
          <Input value={item.endDate} onChange={(e) => update('endDate', e.target.value)} placeholder="2020-06" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">GPA（可选）</Label>
          <Input value={item.gpa || ''} onChange={(e) => update('gpa', e.target.value)} placeholder="3.8/4.0" />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-xs text-muted-foreground">补充说明（可选）</Label>
          <Textarea value={item.description || ''} onChange={(e) => update('description', e.target.value)} placeholder="奖学金、荣誉、相关课程..." className="min-h-[60px] text-sm" />
        </div>
      </div>
    </div>
  );
}

interface EducationSectionProps {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}

export default function EducationSection({ items, onChange }: EducationSectionProps) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = items.findIndex((i) => i.id === active.id);
      const newIdx = items.findIndex((i) => i.id === over.id);
      onChange(arrayMove(items, oldIdx, newIdx));
    }
  };

  const addItem = () => {
    onChange([...items, { id: `edu-${Date.now()}`, school: '', degree: '', field: '', startDate: '', endDate: '' }]);
  };

  return (
    <SortableSection id="education" title="教育背景" icon={<GraduationCap className="w-4 h-4" />} onAdd={addItem} addLabel="添加教育">
      {items.length === 0 ? (
        <button onClick={addItem} className="w-full py-6 text-center text-sm text-muted-foreground hover:text-primary border border-dashed border-border rounded-xl hover:border-primary/50 transition-colors">
          <Plus className="w-4 h-4 mx-auto mb-1" />
          添加教育背景
        </button>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd as never}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <EducationItemEditor
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
