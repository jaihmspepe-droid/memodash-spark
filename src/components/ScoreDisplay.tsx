import { cn } from "@/lib/utils";
import { Flame, Trophy, Zap } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  streak: number;
  correct: number;
  incorrect: number;
  className?: string;
}

export const ScoreDisplay = ({
  score,
  streak,
  correct,
  incorrect,
  className,
}: ScoreDisplayProps) => {
  const multiplier = Math.min(Math.floor(streak / 3) + 1, 5);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Score */}
      <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-2 shadow-sm">
        <Trophy className="w-5 h-5 text-accent" />
        <span className="font-display font-bold text-lg text-foreground">
          {score.toLocaleString()}
        </span>
      </div>

      {/* Streak */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm transition-all",
          streak > 0 ? "bg-warning/10" : "bg-card"
        )}
      >
        <Flame
          className={cn(
            "w-5 h-5 transition-colors",
            streak > 0 ? "text-warning" : "text-muted-foreground"
          )}
        />
        <span className="font-display font-bold text-lg text-foreground">
          {streak}
        </span>
        {multiplier > 1 && (
          <span className="flex items-center gap-0.5 text-xs font-bold text-warning bg-warning/20 px-1.5 py-0.5 rounded-full">
            <Zap className="w-3 h-3" />
            {multiplier}x
          </span>
        )}
      </div>

      {/* Correct/Incorrect */}
      <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="font-semibold text-foreground">{correct}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="font-semibold text-foreground">{incorrect}</span>
        </div>
      </div>
    </div>
  );
};
