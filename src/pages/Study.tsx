import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FlashCard } from "@/components/FlashCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Check, X, RotateCcw, Trophy, Loader2, AlertCircle, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlashcards } from "@/hooks/useDecks";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Study = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const { user } = useAuth();
  const { flashcards: allFlashcards, categories, loading, updateSpacedRepetition } = useFlashcards(deckId);
  
  // Filter flashcards by category if categoryId is provided
  const flashcards = useMemo(() => {
    if (!categoryId) return allFlashcards;
    return allFlashcards.filter(card => card.category_id === categoryId);
  }, [allFlashcards, categoryId]);

  const currentCategory = useMemo(() => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId);
  }, [categories, categoryId]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answeredCards, setAnsweredCards] = useState<Set<string>>(new Set());
  const [startTime] = useState(new Date());

  const currentCard = flashcards[currentIndex];
  const isComplete = flashcards.length > 0 && answeredCards.size === flashcards.length;
  const multiplier = Math.min(Math.floor(streak / 3) + 1, 5);

  // Track max streak
  useEffect(() => {
    if (streak > maxStreak) {
      setMaxStreak(streak);
    }
  }, [streak, maxStreak]);

  const saveSession = async () => {
    if (!user || !deckId) return;

    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);

    try {
      await supabase.from('study_sessions').insert({
        user_id: user.id,
        deck_id: deckId,
        score,
        correct_count: correct,
        incorrect_count: incorrect,
        max_streak: maxStreak,
        duration_seconds: duration,
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleAnswer = useCallback(async (knew: boolean) => {
    if (!currentCard) return;

    if (!isFlipped) {
      setIsFlipped(true);
      return;
    }

    setAnsweredCards((prev) => new Set(prev).add(currentCard.id));

    if (knew) {
      setScore((prev) => prev + 10 * multiplier);
      setStreak((prev) => prev + 1);
      setCorrect((prev) => prev + 1);
    } else {
      setScore((prev) => Math.max(0, prev - 5));
      setStreak(0);
      setIncorrect((prev) => prev + 1);
    }

    // Update spaced repetition
    if (user) {
      await updateSpacedRepetition(currentCard.id, knew);
    }

    // Passer à la carte suivante
    setTimeout(() => {
      setIsFlipped(false);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setShowResult(true);
        saveSession();
      }
    }, 300);
  }, [isFlipped, currentCard, currentIndex, multiplier, flashcards.length, updateSpacedRepetition, user]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrect(0);
    setIncorrect(0);
    setShowResult(false);
    setAnsweredCards(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background gradient-hero flex flex-col">
        <header className="container py-4">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate("/decks")}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux Decks
          </Button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg max-w-md w-full text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {categoryId ? "Aucune carte dans cette catégorie" : "Aucune carte dans ce deck"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {categoryId
                ? "Ajoutez des flashcards à cette catégorie pour commencer à réviser"
                : "Ajoutez des flashcards à ce deck pour commencer à réviser"}
            </p>
            <Button variant="hero" onClick={() => navigate(`/deck/${deckId}`)}>
              Ajouter des cartes
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (showResult || isComplete) {
    const percentage = Math.round((correct / flashcards.length) * 100);
    return (
      <div className="min-h-screen bg-background gradient-hero flex flex-col">
        {/* Header */}
        <header className="container py-4">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate("/decks")}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux Decks
          </Button>
        </header>

        {/* Résultats */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg max-w-md w-full text-center animate-scale-in">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>

            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Session terminée !
            </h1>
            <p className="text-muted-foreground mb-8">
              Excellent travail pour cette session de révision
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-3xl font-display font-bold text-foreground">{score}</p>
                <p className="text-sm text-muted-foreground">Score total</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-3xl font-display font-bold text-foreground">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Précision</p>
              </div>
              <div className="bg-success/10 rounded-xl p-4">
                <p className="text-3xl font-display font-bold text-success">{correct}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="bg-destructive/10 rounded-xl p-4">
                <p className="text-3xl font-display font-bold text-destructive">{incorrect}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button variant="hero" size="lg" className="w-full gap-2" onClick={handleRestart}>
                <RotateCcw className="w-5 h-5" />
                Réviser à nouveau
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/decks")}>
                Retour aux Decks
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-hero flex flex-col">
      {/* Header */}
      <header className="container py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate("/decks")}
        >
          <ArrowLeft className="w-4 h-4" />
          Quitter
        </Button>

        <Logo size="sm" />

        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {flashcards.length}
        </div>
      </header>

      {/* Barre de progression */}
      <div className="container mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Affichage du score */}
      <div className="container flex justify-center mb-8">
        <ScoreDisplay
          score={score}
          streak={streak}
          correct={correct}
          incorrect={incorrect}
        />
      </div>

      {/* Flashcard */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-lg mb-8">
          <FlashCard
            question={currentCard.question}
            answer={currentCard.answer}
            difficulty={currentCard.difficulty}
            categoryColor={currentCard.categoryColor || 'hsl(0 75% 50%)'}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </div>

        {/* Boutons de réponse */}
        <div className="flex gap-4 w-full max-w-lg">
          <Button
            variant="dont-know"
            size="xl"
            className="flex-1 gap-2"
            onClick={() => handleAnswer(false)}
          >
            <X className="w-6 h-6" />
            {isFlipped ? "Je ne savais pas" : "Révéler"}
          </Button>
          <Button
            variant="know"
            size="xl"
            className={cn(
              "flex-1 gap-2 transition-opacity",
              !isFlipped && "opacity-50 pointer-events-none"
            )}
            onClick={() => handleAnswer(true)}
            disabled={!isFlipped}
          >
            <Check className="w-6 h-6" />
            Je savais
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Study;
