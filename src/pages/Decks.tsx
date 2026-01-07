import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DeckCard } from "@/components/DeckCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

// Sample user decks
const userDecks = [
  {
    id: "1",
    title: "French Vocabulary",
    cardCount: 150,
    categoryCount: 5,
    color: "hsl(280 70% 50%)",
    progress: 65,
  },
  {
    id: "2",
    title: "Biology Basics",
    cardCount: 89,
    categoryCount: 3,
    color: "hsl(142 70% 45%)",
    progress: 40,
    isShared: true,
  },
  {
    id: "3",
    title: "JavaScript Essentials",
    cardCount: 200,
    categoryCount: 8,
    color: "hsl(45 95% 55%)",
    progress: 88,
  },
  {
    id: "4",
    title: "World History",
    cardCount: 120,
    categoryCount: 6,
    color: "hsl(15 85% 55%)",
    progress: 25,
  },
  {
    id: "5",
    title: "Medical Terminology",
    cardCount: 300,
    categoryCount: 12,
    color: "hsl(200 80% 50%)",
    progress: 15,
    isShared: true,
  },
];

const Decks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredDecks = userDecks.filter((deck) =>
    deck.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              My Decks
            </h1>
            <p className="text-muted-foreground">
              {userDecks.length} decks • {userDecks.reduce((acc, d) => acc + d.cardCount, 0)} total cards
            </p>
          </div>

          <Button variant="hero" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create Deck
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Button variant="outline" size="lg" className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Decks grid */}
        {filteredDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                title={deck.title}
                cardCount={deck.cardCount}
                categoryCount={deck.categoryCount}
                color={deck.color}
                progress={deck.progress}
                isShared={deck.isShared}
                onPlay={() => navigate(`/study/${deck.id}`)}
                onClick={() => console.log("View deck", deck.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No decks found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or create a new deck
            </p>
            <Button variant="hero" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Your First Deck
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Decks;
