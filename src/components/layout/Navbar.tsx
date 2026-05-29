import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, LayoutDashboard, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-foreground">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(224, 76%, 48%), hsl(217, 91%, 60%))' }}>
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:inline gradient-text text-lg">面试通</span>
            </Link>
            {title && (
              <>
                <span className="text-border">/</span>
                <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">{title}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => navigate('/editor/new')}
                  className="hidden sm:inline-flex"
                >
                  <Plus className="w-4 h-4" />
                  新建简历
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/editor/new')}
                  className="sm:hidden"
                >
                  <Plus className="w-4 h-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      我的简历
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth?mode=login')}>
                  登录
                </Button>
                <Button variant="gradient" size="sm" onClick={() => navigate('/auth?mode=register')}>
                  免费注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
