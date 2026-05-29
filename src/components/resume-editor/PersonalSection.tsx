import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SortableSection } from './SortableSection';
import type { PersonalInfo } from '@/types/resume';

interface PersonalSectionProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export default function PersonalSection({ data, onChange }: PersonalSectionProps) {
  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <SortableSection
      id="personal"
      title="个人信息"
      icon={<User className="w-4 h-4" />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs text-muted-foreground">姓名</Label>
          <Input
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="张三"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">邮箱</Label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="example@email.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">电话</Label>
          <Input
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="138 0000 0000"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">所在地</Label>
          <Input
            value={data.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="北京市"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">期望职位</Label>
          <Input
            value={data.jobTitle || ''}
            onChange={(e) => update('jobTitle', e.target.value)}
            placeholder="前端工程师"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">LinkedIn（可选）</Label>
          <Input
            value={data.linkedin || ''}
            onChange={(e) => update('linkedin', e.target.value)}
            placeholder="linkedin.com/in/username"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">个人网站（可选）</Label>
          <Input
            value={data.website || ''}
            onChange={(e) => update('website', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </SortableSection>
  );
}
