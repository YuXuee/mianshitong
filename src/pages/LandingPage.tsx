import { useNavigate } from 'react-router-dom';
import { FileText, Zap, Download, ArrowRight, CheckCircle, Star, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';

const features = [
  {
    icon: Upload,
    title: '多格式上传',
    desc: '支持 PDF、Word、图片或直接粘贴文本，快速导入你的现有简历',
  },
  {
    icon: Sparkles,
    title: 'AI 智能解析',
    desc: 'Claude AI 自动将简历解析为结构化数据，精准识别每个字段',
  },
  {
    icon: Zap,
    title: '根据 JD 优化',
    desc: '输入目标岗位的 JD，AI 针对性地优化每一条描述，提升匹配度',
  },
  {
    icon: Download,
    title: '一键导出',
    desc: '优化完成后，一键导出为 PDF 或 Word 格式，带面试通专属水印',
  },
];

const steps = [
  { num: '01', title: '上传简历', desc: '上传你的现有简历，任何格式都支持' },
  { num: '02', title: '粘贴 JD', desc: '复制目标岗位的招聘描述' },
  { num: '03', title: 'AI 优化', desc: '点击一键优化，AI 自动调整简历内容' },
  { num: '04', title: '导出简历', desc: '下载优化后的专业简历文件' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/editor/new');
    } else {
      navigate('/auth?mode=register');
    }
  };

  return (
    <div className="page-container">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, hsl(214, 100%, 99%) 0%, hsl(213, 97%, 96%) 40%, hsl(210, 40%, 98%) 100%)' }} />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full -z-10 blur-3xl opacity-20"
          style={{ background: 'linear-gradient(135deg, hsl(224, 76%, 48%), hsl(217, 91%, 60%))' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <Badge variant="info" className="mb-6 px-4 py-1.5">
            <Star className="w-3 h-3 mr-1" />
            由 Claude AI 驱动
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            让简历
            <span className="gradient-text"> 精准匹配 </span>
            每一个 JD
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            上传简历 + 粘贴 JD，AI 自动解析简历结构，针对岗位要求智能优化每一行内容，导出专业格式，面试机会翻倍。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gradient" size="xl" onClick={handleStart}>
              免费开始优化简历
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate('/auth?mode=login')}>
              已有账号，登录
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            {['免费使用', '无需信用卡', 'AI 驱动'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-title mb-3">核心功能</p>
            <h2 className="text-3xl font-bold text-foreground">一站式简历优化体验</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl border border-border bg-background hover:border-primary/30 transition-all duration-200 hover:shadow-card-hover">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, hsl(214, 100%, 95%), hsl(213, 97%, 90%))' }}>
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-title mb-3">使用流程</p>
            <h2 className="text-3xl font-bold text-foreground">4 步搞定优化简历</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-5 p-6 rounded-2xl border border-border bg-card">
                <div className="text-3xl font-bold gradient-text shrink-0">{step.num}</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, hsl(224, 76%, 48%), hsl(217, 91%, 60%))' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">立即开始优化你的简历</h2>
          <p className="text-white/80 mb-8 text-lg">免费使用，AI 帮你脱颖而出</p>
          <Button size="xl" className="bg-white text-primary hover:bg-white/90 shadow-lg" onClick={handleStart}>
            免费开始
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(224, 76%, 48%), hsl(217, 91%, 60%))' }}>
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">面试通</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 面试通. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
