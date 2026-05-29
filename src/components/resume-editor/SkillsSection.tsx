import { useState } from 'react';
import { Code2, Plus, X, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SortableSection } from './SortableSection';
import type { SkillGroup } from '@/types/resume';

function SkillGroupEditor({ group, onChange, onDelete }: {
  group: SkillGroup;
  onChange: (g: SkillGroup) => void;
  onDelete: () => void;
}) {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    onChange({ ...group, items: [...group.items, skill] });
    setNewSkill('');
  };

  const removeSkill = (idx: number) => {
    onChange({ ...group, items: group.items.filter((_, i) => i !== idx) });
  };

  return (
    <div className="border border-border rounded-xl bg-background p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={group.category}
          onChange={(e) => onChange({ ...group, category: e.target.value })}
          placeholder="技能类别（如编程语言）"
          className="flex-1 text-sm h-8"
        />
        <button onClick={onDelete} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {group.items.map((skill, idx) => (
          <span key={idx} className="skill-tag group">
            {skill}
            <button onClick={() => removeSkill(idx)} className="ml-0.5 text-muted-foreground/60 hover:text-destructive transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
          placeholder="输入技能后按 Enter"
          className="flex-1 text-sm h-8"
        />
        <Button variant="outline" size="sm" className="h-8" onClick={addSkill}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface SkillsSectionProps {
  items: SkillGroup[];
  onChange: (items: SkillGroup[]) => void;
}

export default function SkillsSection({ items, onChange }: SkillsSectionProps) {
  const addGroup = () => {
    onChange([...items, { id: `skill-${Date.now()}`, category: '', items: [] }]);
  };

  return (
    <SortableSection id="skills" title="技能" icon={<Code2 className="w-4 h-4" />} onAdd={addGroup} addLabel="添加分组">
      {items.length === 0 ? (
        <button onClick={addGroup} className="w-full py-6 text-center text-sm text-muted-foreground hover:text-primary border border-dashed border-border rounded-xl hover:border-primary/50 transition-colors">
          <Plus className="w-4 h-4 mx-auto mb-1" />
          添加技能分组
        </button>
      ) : (
        <div className="space-y-3">
          {items.map((group) => (
            <SkillGroupEditor
              key={group.id}
              group={group}
              onChange={(updated) => onChange(items.map((g) => (g.id === group.id ? updated : g)))}
              onDelete={() => onChange(items.filter((g) => g.id !== group.id))}
            />
          ))}
        </div>
      )}
    </SortableSection>
  );
}
