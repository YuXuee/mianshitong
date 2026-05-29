import { AlignLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SortableSection } from './SortableSection';

interface SummarySectionProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SummarySection({ value, onChange }: SummarySectionProps) {
  return (
    <SortableSection
      id="summary"
      title="个人简介"
      icon={<AlignLeft className="w-4 h-4" />}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="简短介绍你的专业背景、核心技能和职业目标..."
        className="min-h-[100px] text-sm"
      />
      <p className="text-xs text-muted-foreground mt-1.5">{value.length} 字符</p>
    </SortableSection>
  );
}
