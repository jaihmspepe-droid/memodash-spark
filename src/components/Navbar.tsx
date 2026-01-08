import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Home, LayoutGrid, Settings, User, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", label: "Accueil", icon: Home },
  { path: "/decks", label: "Mes Decks", icon: LayoutGrid },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <Button
                variant={location.pathname === path ? "secondary" : "ghost"}
                className={cn(
                  "gap-2",
                  location.pathname === path && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="hero" className="gap-2">
                <User className="w-4 h-4" />
                Connexion
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
