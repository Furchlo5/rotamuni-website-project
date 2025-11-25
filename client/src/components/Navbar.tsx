import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flame, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import logoImage from "@assets/Screenshot 2025-11-25 at 09.35 Background Removed.14_1764052549610.png";
import type { User } from "@shared/schema";

interface NavbarProps {
  isAuthenticated: boolean;
  user: User | null | undefined;
}

export function Navbar({ isAuthenticated, user }: NavbarProps) {
  const { data: streakData } = useQuery<{ streak: number }>({
    queryKey: ["/api/streak"],
    enabled: isAuthenticated,
  });

  return (
    <nav className="bg-[#152238]/90 backdrop-blur-sm border-b border-[#1e3a5f] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="RotamUni Logo" 
                className="h-10 w-10 object-contain"
                data-testid="img-logo"
              />
              <span className="text-white font-semibold text-lg">
                RotamUni
              </span>
            </a>
            
            {isAuthenticated && (
              <a 
                href="/streak" 
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-1.5 rounded-full hover:from-orange-500/30 hover:to-red-500/30 transition-all cursor-pointer"
              >
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-orange-400 font-bold text-sm">
                  {streakData?.streak ?? 0}
                </span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-white/10 rounded-lg"
                  >
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profil" 
                        className="h-8 w-8 rounded-full object-cover border-2 border-[#14b8a6]"
                        data-testid="img-profile"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#0891b2] flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-white/90 text-sm hidden sm:inline max-w-[120px] truncate">
                      {user.firstName || user.email?.split('@')[0] || 'Kullanıcı'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-white/60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64 bg-[#1e3a5f] border-[#2d4a6f] text-white"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2 py-2">
                      <div className="flex items-center gap-3">
                        {user.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt="Profil" 
                            className="h-10 w-10 rounded-full object-cover border-2 border-[#14b8a6]"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#0891b2] flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-white">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.firstName || 'Kullanıcı'}
                          </p>
                          <p className="text-xs text-white/60 truncate max-w-[180px]">
                            {user.email || 'E-posta yok'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#2d4a6f]" />
                  <DropdownMenuItem 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer focus:bg-red-500/10 focus:text-red-300"
                    onClick={() => window.location.href = "/api/logout"}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/login"}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  data-testid="button-signin"
                >
                  Giriş Yap
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-gradient-to-r from-[#14b8a6] to-[#0891b2] hover:from-[#2dd4bf] hover:to-[#06b6d4] text-white"
                  data-testid="button-signup"
                >
                  Kayıt Ol
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
