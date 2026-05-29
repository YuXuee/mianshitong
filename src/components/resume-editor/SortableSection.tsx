import { useState } from 'react';
import { GripVertical, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  defaultExpanded?: boolean;
}

export function SortableSection({
  id,
  title,
  icon,
  children,
  onAdd,
  addLabel = '添加',
  defaultExpanded = true,
}: SortableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'editor-section',
        isDragging && 'shadow-panel ring-1 ring-primary/20'
      )}
    >
      <div className="flex items-center gap-3">
        <button
          className="drag-handle p-0.5"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 flex-1">
          <div className="w-5 h-5 shrink-0 text-primary">{icon}</div>
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        </div>

        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            {addLabel}
          </button>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
