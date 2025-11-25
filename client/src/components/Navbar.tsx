import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
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
              <>
                {user.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover"
                    data-testid="img-profile"
                  />
                )}
                <span className="text-white/80 text-sm hidden sm:inline">
                  {user.firstName || user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  className="border-[#14b8a6] text-[#14b8a6] hover:bg-[#14b8a6]/10"
                  data-testid="button-logout"
                >
                  Çıkış Yap
                </Button>
              </>
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
