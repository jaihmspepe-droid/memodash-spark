import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { DeckCard } from "@/components/DeckCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Share2, Wifi } from "lucide-react";
import { Link } from "react-router-dom";

// Decks de démonstration
const sampleDecks = [
  {
    id: "1",
    title: "Vocabulaire Français",
    cardCount: 150,
    categoryCount: 5,
    color: "hsl(280 70% 50%)",
    progress: 65,
  },
  {
    id: "2",
    title: "Bases de Biologie",
    cardCount: 89,
    categoryCount: 3,
    color: "hsl(142 70% 45%)",
    progress: 40,
    isShared: true,
  },
  {
    id: "3",
    title: "Essentiels JavaScript",
    cardCount: 200,
    categoryCount: 8,
    color: "hsl(45 95% 55%)",
    progress: 88,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* Section Decks Populaires */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Decks Populaires
              </h2>
              <p className="text-muted-foreground">
                Explorez les decks créés par la communauté
              </p>
            </div>
            <Link to="/decks">
              <Button variant="outline" className="gap-2">
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                title={deck.title}
                cardCount={deck.cardCount}
                categoryCount={deck.categoryCount}
                color={deck.color}
                progress={deck.progress}
                isShared={deck.isShared}
                onPlay={() => console.log("Jouer", deck.id)}
                onClick={() => console.log("Voir", deck.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Comment fonctionne MemoDeck
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trois étapes simples pour booster votre apprentissage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number={1}
              icon={BookOpen}
              title="Créez votre Deck"
              description="Construisez des decks personnalisés avec des catégories et sous-catégories illimitées"
            />
            <StepCard
              number={2}
              icon={Share2}
              title="Révisez & Partagez"
              description="Utilisez la répétition espacée pour apprendre efficacement et partagez avec vos amis"
            />
            <StepCard
              number={3}
              icon={Wifi}
              title="Apprenez Partout"
              description="Téléchargez vos decks pour réviser hors-ligne et synchronisez vos progrès"
            />
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-20 gradient-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Prêt à booster votre apprentissage ?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Rejoignez des milliers d'apprenants qui utilisent MemoDeck pour maîtriser de nouvelles compétences.
          </p>
          <Link to="/decks">
            <Button
              size="xl"
              className="bg-background text-primary hover:bg-background/90 font-bold gap-2"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 MemoDeck. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface StepCardProps {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const StepCard = ({ number, icon: Icon, title, description }: StepCardProps) => {
  return (
    <div className="relative text-center group">
      {/* Step number */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-md">
        {number}
      </div>
      
      <div className="bg-card rounded-2xl p-8 pt-10 border border-border/50 hover:border-primary/30 transition-all hover:shadow-card h-full">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display font-bold text-xl text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Index;
