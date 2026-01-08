import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { ArrowRight, Brain, Sparkles, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 pt-20 pb-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 animate-float">
            <Logo size="xl" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Apprendre devient un jeu</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-display font-black text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Maîtrisez tout avec des{" "}
            <span className="text-gradient">Flashcards Intelligentes</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Créez, partagez et révisez avec la répétition espacée. 
            Suivez vos progrès et atteignez vos objectifs d'apprentissage.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/auth">
              <Button variant="hero" size="xl" className="gap-2">
                Commencer à apprendre
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/decks">
              <Button variant="hero-outline" size="xl">
                Essayer en invité
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <FeatureCard
              icon={Brain}
              title="Répétition Espacée"
              description="Planification intelligente pour une mémorisation optimale"
            />
            <FeatureCard
              icon={Target}
              title="Suivi des Progrès"
              description="Statistiques détaillées et séries pour rester motivé"
            />
            <FeatureCard
              icon={Zap}
              title="Synchronisation"
              description="Accédez à vos decks partout, même hors-ligne"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all hover:shadow-card group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-display font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
