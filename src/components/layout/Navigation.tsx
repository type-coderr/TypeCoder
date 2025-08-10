import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Code, Trophy, User, Zap } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Code },
    { path: "/dashboard", label: "Dashboard", icon: Zap },
    { path: "/practice", label: "Practice", icon: Code },
    { path: "/multiplayer", label: "Multiplayer", icon: Trophy },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Code className="w-8 h-8 text-primary group-hover:text-primary-glow transition-colors" />
              <div className="absolute inset-0 animate-glow-pulse" />
            </div>
            <span className="text-2xl font-bold hero-gradient">CodeRace</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;