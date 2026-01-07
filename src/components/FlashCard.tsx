import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface FlashCardProps {
  question: string;
  answer: string;
  difficulty?: number;
  categoryColor?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
}

export const FlashCard = ({
  question,
  answer,
  difficulty = 3,
  categoryColor = "hsl(0 75% 50%)",
  isFlipped = false,
  onFlip,
}: FlashCardProps) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  
  const flipped = onFlip ? isFlipped : internalFlipped;
  const handleFlip = onFlip || (() => setInternalFlipped(!internalFlipped));

  return (
    <div 
      className="perspective-1000 w-full max-w-md mx-auto cursor-pointer"
      onClick={handleFlip}
    >
      <div
        className={cn(
          "relative w-full aspect-[4/3] preserve-3d transition-transform duration-500 ease-out",
          flipped && "rotate-y-180"
        )}
      >
        {/* Front - Question */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl bg-card p-6 flex flex-col shadow-card hover:shadow-card-hover transition-shadow"
          style={{ borderLeft: `6px solid ${categoryColor}` }}
        >
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-4 h-4 transition-colors",
                  star <= difficulty 
                    ? "fill-accent text-accent" 
                    : "text-muted"
                )}
              />
            ))}
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl font-semibold text-center text-foreground">
              {question}
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground text-center mt-4">
            Appuyez pour révéler la réponse
          </p>
        </div>

        {/* Back - Answer */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-card p-6 flex flex-col shadow-card-hover"
          style={{ borderLeft: `6px solid ${categoryColor}` }}
        >
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl font-semibold text-center text-foreground">
              {answer}
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground text-center mt-4">
            Appuyez pour voir la question
          </p>
        </div>
      </div>
    </div>
  );
};
