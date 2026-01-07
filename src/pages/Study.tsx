import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FlashCard } from "@/components/FlashCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Check, X, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// Flashcards de démonstration
const sampleCards = [
  { id: "1", question: "Quelle est la capitale de la France ?", answer: "Paris", difficulty: 2, categoryColor: "hsl(280 70% 50%)" },
  { id: "2", question: "Comment dit-on 'Bonjour' en anglais ?", answer: "Hello", difficulty: 1, categoryColor: "hsl(280 70% 50%)" },
  { id: "3", question: "Comment dit-on 'Au revoir' en anglais ?", answer: "Goodbye", difficulty: 2, categoryColor: "hsl(280 70% 50%)" },
  { id: "4", question: "Quel est le mot anglais pour 'chat' ?", answer: "Cat", difficulty: 1, categoryColor: "hsl(280 70% 50%)" },
  { id: "5", question: "Quel est le mot anglais pour 'chien' ?", answer: "Dog", difficulty: 1, categoryColor: "hsl(280 70% 50%)" },
  { id: "6", question: "Comment dit-on 'Merci' en anglais ?", answer: "Thank you", difficulty: 1, categoryColor: "hsl(280 70% 50%)" },
  { id: "7", question: "Quel est le mot anglais pour 'livre' ?", answer: "Book", difficulty: 3, categoryColor: "hsl(280 70% 50%)" },
  { id: "8", question: "Comptez jusqu'à 3 en anglais", answer: "One, Two, Three", difficulty: 2, categoryColor: "hsl(280 70% 50%)" },
];

const Study = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answeredCards, setAnsweredCards] = useState<Set<string>>(new Set());

  const currentCard = sampleCards[currentIndex];
  const isComplete = answeredCards.size === sampleCards.length;
  const multiplier = Math.min(Math.floor(streak / 3) + 1, 5);

  const handleAnswer = useCallback((knew: boolean) => {
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

    // Passer à la carte suivante
    setTimeout(() => {
      setIsFlipped(false);
      if (currentIndex < sampleCards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 300);
  }, [isFlipped, currentCard, currentIndex, multiplier]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore(0);
    setStreak(0);
    setCorrect(0);
    setIncorrect(0);
    setShowResult(false);
    setAnsweredCards(new Set());
  };

  if (showResult || isComplete) {
    const percentage = Math.round((correct / sampleCards.length) * 100);
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
          {currentIndex + 1} / {sampleCards.length}
        </div>
      </header>

      {/* Barre de progression */}
      <div className="container mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / sampleCards.length) * 100}%` }}
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
            categoryColor={currentCard.categoryColor}
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
