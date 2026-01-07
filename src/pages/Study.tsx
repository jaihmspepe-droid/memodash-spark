import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FlashCard } from "@/components/FlashCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Check, X, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample flashcards
const sampleCards = [
  { id: "1", question: "What is the capital of France?", answer: "Paris", difficulty: 2, categoryColor: "hsl(280 70% 50%)" },
  { id: "2", question: "What is 'Hello' in French?", answer: "Bonjour", difficulty: 1, categoryColor: "hsl(280 70% 50%)" },
  { id: "3", question: "What is 'Goodbye' in French?", answer: "Au revoir", difficulty: 2, categoryColor: "hsl(280 70% 50%)" },
  { id: "4", question: "What is the French word for 'cat'?", answer: "Chat", difficulty: 1, categoryColor: "hsl(280 70% 50%)" },
  { id: "5", question: "What is the French word for 'dog'?", answer: "Chien", difficulty: 1, categoryColor: "hsl(280 70% 50%)" },
  { id: "6", question: "How do you say 'Thank you' in French?", answer: "Merci", difficulty: 1, categoryColor: "hsl(280 70% 50%)" },
  { id: "7", question: "What is the French word for 'book'?", answer: "Livre", difficulty: 3, categoryColor: "hsl(280 70% 50%)" },
  { id: "8", question: "How do you count to 3 in French?", answer: "Un, Deux, Trois", difficulty: 2, categoryColor: "hsl(280 70% 50%)" },
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

    // Move to next card
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
            Back to Decks
          </Button>
        </header>

        {/* Results */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg max-w-md w-full text-center animate-scale-in">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>

            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Session Complete!
            </h1>
            <p className="text-muted-foreground mb-8">
              Great job finishing this study session
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-3xl font-display font-bold text-foreground">{score}</p>
                <p className="text-sm text-muted-foreground">Total Score</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-3xl font-display font-bold text-foreground">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
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
                Study Again
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/decks")}>
                Back to Decks
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
          Exit
        </Button>

        <Logo size="sm" />

        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {sampleCards.length}
        </div>
      </header>

      {/* Progress bar */}
      <div className="container mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / sampleCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Score display */}
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

        {/* Answer buttons */}
        <div className="flex gap-4 w-full max-w-lg">
          <Button
            variant="dont-know"
            size="xl"
            className="flex-1 gap-2"
            onClick={() => handleAnswer(false)}
          >
            <X className="w-6 h-6" />
            {isFlipped ? "Didn't Know" : "Reveal"}
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
            I Knew It
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Study;
