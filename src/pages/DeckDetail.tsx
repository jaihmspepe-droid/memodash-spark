import { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Play,
  Trash2,
  Loader2,
  Star,
  Folder,
  Edit,
} from "lucide-react";
import { useFlashcards, useDecks } from "@/hooks/useDecks";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CategoryManager } from "@/components/CategoryManager";
import { ShareDeckDialog } from "@/components/ShareDeckDialog";
import { EditDeckDialog } from "@/components/EditDeckDialog";
import { AIGenerateDialog } from "@/components/AIGenerateDialog";

const DeckDetail = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { decks, fetchDecks, updateDeck, deleteDeck } = useDecks();
  const { flashcards, categories, loading, fetchFlashcards, createFlashcard } =
    useFlashcards(deckId);
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newDifficulty, setNewDifficulty] = useState(3);
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const deck = decks.find((d) => d.id === deckId);

  const filteredFlashcards = useMemo(() => {
    if (!selectedCategoryId) return flashcards;
    return flashcards.filter((card) => card.category_id === selectedCategoryId);
  }, [flashcards, selectedCategoryId]);

  const cardCountByCategory = useMemo(() => {
    const countMap = new Map<string, number>();
    flashcards.forEach((card) => {
      if (card.category_id) {
        countMap.set(card.category_id, (countMap.get(card.category_id) || 0) + 1);
      }
    });
    return countMap;
  }, [flashcards]);

  const handleDeleteDeck = async (id: string) => {
    await deleteDeck(id);
    navigate("/decks");
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId)?.name || null;
  };

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId)?.color || null;
  };

  const handleCreateCard = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setIsCreating(true);
    const card = await createFlashcard({
      question: newQuestion,
      answer: newAnswer,
      difficulty: newDifficulty,
      category_id: newCategoryId || undefined,
    });
    setIsCreating(false);

    if (card) {
      setNewQuestion("");
      setNewAnswer("");
      setNewDifficulty(3);
      setNewCategoryId(null);
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

  const handleUpdateCardCategory = async (cardId: string, categoryId: string | null) => {
    try {
      const { error } = await supabase
        .from("flashcards")
        .update({ category_id: categoryId })
        .eq("id", cardId);

      if (error) throw error;

      await fetchFlashcards();
      toast({
        title: "Carte mise à jour",
        description: "La catégorie a été modifiée",
      });
    } catch (error) {
      console.error("Error updating card:", error);
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
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/decks")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold text-foreground">
                {deck?.title || "Deck"}
              </h1>
              {deck && (
                <EditDeckDialog
                  deck={deck}
                  onUpdate={updateDeck}
                  onDelete={handleDeleteDeck}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                  }
                />
              )}
            </div>
            <p className="text-muted-foreground">
              {flashcards.length} carte{flashcards.length > 1 ? "s" : ""} •{" "}
              {categories.length} catégorie{categories.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <ShareDeckDialog
              deckId={deckId!}
              deckTitle={deck?.title || ""}
              currentShareCode={deck?.share_code}
              currentPermission={deck?.share_permission}
              onUpdate={fetchDecks}
            />
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-4 sticky top-24">
              <CategoryManager
                deckId={deckId!}
                categories={categories}
                onCategoriesChange={fetchFlashcards}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                cardCountByCategory={cardCountByCategory}
              />
            </div>
          </div>

          {/* Main content - Cards */}
          <div className="lg:col-span-3">
            {/* Boutons d'action */}
            <div className="flex gap-3 mb-6">
              <AIGenerateDialog
                deckId={deckId!}
                categories={categories}
                onCardsGenerated={fetchFlashcards}
              />
              {/* Ajouter une carte */}
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
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
                    {categories.length > 0 && (
                      <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Select
                          value={newCategoryId || "none"}
                          onValueChange={(val) =>
                            setNewCategoryId(val === "none" ? null : val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Aucune catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucune catégorie</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  {cat.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
            </div>

            {/* Liste des cartes */}
            {filteredFlashcards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFlashcards.map((card) => {
                  const categoryName = getCategoryName(card.category_id);
                  const categoryColor = getCategoryColor(card.category_id);

                  return (
                    <div
                      key={card.id}
                      className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
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
                          {categoryName && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: categoryColor || undefined }}
                            >
                              {categoryName}
                            </span>
                          )}
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
                      {categories.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <Select
                            value={card.category_id || "none"}
                            onValueChange={(val) =>
                              handleUpdateCardCategory(
                                card.id,
                                val === "none" ? null : val
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <Folder className="w-3 h-3 mr-1" />
                              <SelectValue placeholder="Déplacer..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Aucune catégorie
                              </SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: cat.color }}
                                    />
                                    {cat.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {card.review_count > 0 && (
                        <p className="text-xs text-muted-foreground mt-3">
                          Révisée {card.review_count} fois
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {selectedCategoryId ? "Aucune carte dans cette catégorie" : "Aucune carte"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {selectedCategoryId
                    ? "Ajoutez des cartes à cette catégorie"
                    : "Ajoutez votre première flashcard à ce deck"}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeckDetail;
