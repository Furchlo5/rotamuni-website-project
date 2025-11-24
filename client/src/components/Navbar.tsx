import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/logo_son_1764010143596.png";

export function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="bg-[#152238] border-b border-[#1e3a5f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="YKS Yol Arkadaşım Logo" 
              className="h-10 w-10 object-contain"
              data-testid="img-logo"
            />
            <span className="text-white font-semibold text-lg hidden sm:inline">
              YKS Yol Arkadaşım
            </span>
          </div>

          {/* Auth Buttons */}
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
                  Sign Out
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
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-gradient-to-r from-[#14b8a6] to-[#0891b2] hover:from-[#2dd4bf] hover:to-[#06b6d4] text-white"
                  data-testid="button-signup"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
