import { useState } from 'react';
import { Type, Upload } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import FileDropzone from './FileDropzone';

interface JDInputProps {
  value: string;
  onChange: (text: string) => void;
  onFileAccepted?: (file: File) => void;
}

const JD_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

export default function JDInput({ value, onChange, onFileAccepted }: JDInputProps) {
  const [tab, setTab] = useState<'text' | 'file'>('text');

  const handleFile = async (file: File) => {
    onFileAccepted?.(file);
    // If it's a text-based reading, we can extract some preview text
    if (file.type === 'text/plain') {
      const text = await file.text();
      onChange(text);
    }
  };

  return (
    <div className="space-y-3">
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'text' | 'file')}>
        <TabsList className="h-9">
          <TabsTrigger value="text" className="text-xs gap-1.5">
            <Type className="w-3.5 h-3.5" />
            粘贴文本
          </TabsTrigger>
          <TabsTrigger value="file" className="text-xs gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            上传图片/文件
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-3">
          <Textarea
            placeholder="将职位描述(JD)粘贴到这里...

例如：
岗位职责：
1. 负责前端项目的开发与维护...
2. 与产品、设计团队协作...

任职要求：
1. 3年以上前端开发经验...
2. 熟练掌握 React、Vue 等框架..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[200px] text-sm"
          />
          {value && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {value.length} 字符
            </p>
          )}
        </TabsContent>

        <TabsContent value="file" className="mt-3">
          <FileDropzone
            label="拖拽或点击上传 JD 图片/文件"
            hint="支持 PDF、JPG、PNG（AI 将识别图片中的文字）"
            accept={JD_ACCEPT}
            onFileAccepted={handleFile}
          />
          {value && (
            <p className="text-xs text-muted-foreground mt-2 p-3 bg-muted rounded-lg">
              已识别文本：{value.slice(0, 100)}{value.length > 100 ? '...' : ''}
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
