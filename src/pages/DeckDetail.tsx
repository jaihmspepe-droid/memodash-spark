import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Play,
  Trash2,
  Edit,
  Loader2,
  Star,
} from "lucide-react";
import { useFlashcards, useDecks } from "@/hooks/useDecks";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DeckDetail = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { decks } = useDecks();
  const { flashcards, categories, loading, fetchFlashcards, createFlashcard } = useFlashcards(deckId);
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newDifficulty, setNewDifficulty] = useState(3);
  const [isCreating, setIsCreating] = useState(false);

  const deck = decks.find((d) => d.id === deckId);

  const handleCreateCard = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setIsCreating(true);
    const card = await createFlashcard({
      question: newQuestion,
      answer: newAnswer,
      difficulty: newDifficulty,
    });
    setIsCreating(false);

    if (card) {
      setNewQuestion("");
      setNewAnswer("");
      setNewDifficulty(3);
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", cardId);

      if (error) throw error;

      await fetchFlashcards();
      toast({
        title: "Carte supprimée",
        description: "La carte a été supprimée avec succès",
      });
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la carte",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/decks")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">
              {deck?.title || "Deck"}
            </h1>
            <p className="text-muted-foreground">
              {flashcards.length} carte{flashcards.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="hero"
            className="gap-2"
            onClick={() => navigate(`/study/${deckId}`)}
            disabled={flashcards.length === 0}
          >
            <Play className="w-5 h-5" />
            Étudier
          </Button>
        </div>

        {/* Ajouter une carte */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 mb-6">
              <Plus className="w-5 h-5" />
              Ajouter une carte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle Flashcard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  placeholder="Écrivez votre question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Réponse</Label>
                <Textarea
                  id="answer"
                  placeholder="Écrivez la réponse..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulté</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setNewDifficulty(level)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          level <= newDifficulty
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  1 = Facile, 5 = Très difficile
                </p>
              </div>
              <Button
                variant="hero"
                className="w-full"
                onClick={handleCreateCard}
                disabled={
                  !newQuestion.trim() || !newAnswer.trim() || isCreating
                }
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer la carte"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Liste des cartes */}
        {flashcards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card) => (
              <div
                key={card.id}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Star
                        key={level}
                        className={`w-3 h-3 ${
                          level <= card.difficulty
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Question
                    </p>
                    <p className="text-foreground font-medium line-clamp-2">
                      {card.question}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Réponse
                    </p>
                    <p className="text-muted-foreground line-clamp-2">
                      {card.answer}
                    </p>
                  </div>
                </div>
                {card.review_count > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Révisée {card.review_count} fois
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Aucune carte
            </h3>
            <p className="text-muted-foreground mb-6">
              Ajoutez votre première flashcard à ce deck
            </p>
            <Button
              variant="hero"
              className="gap-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Ajouter une carte
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeckDetail;
