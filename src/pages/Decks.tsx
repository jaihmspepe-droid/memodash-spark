import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { DeckCard } from "@/components/DeckCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, Link } from "react-router-dom";
import { useDecks } from "@/hooks/useDecks";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ImportDeckDialog } from "@/components/ImportDeckDialog";

const colorOptions = [
  "hsl(0 75% 50%)",
  "hsl(280 70% 50%)",
  "hsl(142 70% 45%)",
  "hsl(45 95% 55%)",
  "hsl(200 80% 50%)",
  "hsl(320 70% 50%)",
];

type SortOption = "recent" | "cards" | "progress" | "name";

const Decks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckColor, setNewDeckColor] = useState(colorOptions[0]);
  const [isCreating, setIsCreating] = useState(false);
  
  const navigate = useNavigate();
  const { decks, loading, createDeck, fetchDecks } = useDecks();
  const { user, loading: authLoading } = useAuth();

  const filteredAndSortedDecks = useMemo(() => {
    let result = decks.filter((deck) =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case "recent":
        result.sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
      case "cards":
        result.sort((a, b) => (b.cardCount || 0) - (a.cardCount || 0));
        break;
      case "progress":
        result.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [decks, searchQuery, sortBy]);

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) return;
    
    setIsCreating(true);
    const deck = await createDeck(newDeckTitle, undefined, newDeckColor);
    setIsCreating(false);
    
    if (deck) {
      setNewDeckTitle("");
      setNewDeckColor(colorOptions[0]);
      setIsCreateDialogOpen(false);
    }
  };

  const totalCards = decks.reduce((acc, d) => acc + (d.cardCount || 0), 0);

  // Mode démo (non connecté)
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              Mode Démo
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Connectez-vous pour créer vos propres decks et sauvegarder vos progrès.
              En mode démo, vos données ne sont pas sauvegardées.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2">
                <LogIn className="w-5 h-5" />
                Se connecter
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Mes Decks
            </h1>
            <p className="text-muted-foreground">
              {decks.length} deck{decks.length > 1 ? 's' : ''} • {totalCards} carte{totalCards > 1 ? 's' : ''} au total
            </p>
          </div>

          <div className="flex gap-2">
            <ImportDeckDialog onImport={fetchDecks} />
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Créer un Deck
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau Deck</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="deckTitle">Nom du deck</Label>
                    <Input
                      id="deckTitle"
                      placeholder="Ex: Vocabulaire Anglais"
                      value={newDeckTitle}
                      onChange={(e) => setNewDeckTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur</Label>
                    <div className="flex gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewDeckColor(color)}
                          className={`w-8 h-8 rounded-full transition-transform ${
                            newDeckColor === color ? 'scale-125 ring-2 ring-offset-2 ring-primary' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleCreateDeck}
                    disabled={!newDeckTitle.trim() || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer le Deck'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Recherche et filtres */}
        {decks.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher des decks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-48 h-12">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="cards">Plus de cartes</SelectItem>
                <SelectItem value="progress">Progression</SelectItem>
                <SelectItem value="name">Nom (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Grille de decks */}
        {filteredAndSortedDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                title={deck.title}
                cardCount={deck.cardCount || 0}
                categoryCount={deck.categoryCount || 0}
                color={deck.color}
                progress={deck.progress || 0}
                isShared={deck.share_permission !== 'none'}
                onPlay={() => navigate(`/study/${deck.id}`)}
                onClick={() => navigate(`/deck/${deck.id}`)}
              />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun deck</h3>
            <p className="text-muted-foreground mb-6">
              Créez votre premier deck pour commencer à réviser
            </p>
            <Button 
              variant="hero" 
              className="gap-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Créer votre premier Deck
            </Button>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun deck trouvé</h3>
            <p className="text-muted-foreground mb-6">
              Essayez d'ajuster votre recherche
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Decks;
