import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FileText, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('请填写邮箱和密码');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      toast.error('两次密码不一致');
      return;
    }
    if (password.length < 6) {
      toast.error('密码至少 6 位');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message.includes('Invalid') ? '邮箱或密码错误' : error.message);
        } else {
          toast.success('登录成功');
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message.includes('already') ? '该邮箱已被注册' : error.message);
        } else {
          toast.success('注册成功，欢迎使用面试通！');
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4"
      style={{ background: 'linear-gradient(135deg, hsl(214, 100%, 99%) 0%, hsl(213, 97%, 96%) 100%)' }}>

      <div className="w-full max-w-md animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-brand"
              style={{ background: 'linear-gradient(135deg, hsl(224, 76%, 48%), hsl(217, 91%, 60%))' }}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">面试通</span>
          </Link>
        </div>

        <Card className="shadow-panel border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">
              {isLogin ? '欢迎回来' : '创建账号'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? '登录你的面试通账号' : '免费注册，开始优化简历'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="至少 6 位"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">确认密码</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    {isLogin ? '登录中...' : '注册中...'}
                  </span>
                ) : (
                  isLogin ? '登录' : '免费注册'
                )}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  还没有账号？{' '}
                  <button
                    className="text-primary hover:underline font-medium"
                    onClick={() => setIsLogin(false)}
                  >
                    免费注册
                  </button>
                </>
              ) : (
                <>
                  已有账号？{' '}
                  <button
                    className="text-primary hover:underline font-medium"
                    onClick={() => setIsLogin(true)}
                  >
                    立即登录
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
