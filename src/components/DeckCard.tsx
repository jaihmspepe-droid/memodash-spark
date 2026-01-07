import { cn } from "@/lib/utils";
import { Layers, Play, Users } from "lucide-react";
import { Button } from "./ui/button";

interface DeckCardProps {
  title: string;
  cardCount: number;
  categoryCount: number;
  color?: string;
  isShared?: boolean;
  progress?: number;
  onPlay?: () => void;
  onClick?: () => void;
}

export const DeckCard = ({
  title,
  cardCount,
  categoryCount,
  color = "hsl(187 85% 43%)",
  isShared = false,
  progress = 0,
  onPlay,
  onClick,
}: DeckCardProps) => {
  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1",
        "border border-border/50"
      )}
      onClick={onClick}
    >
      {/* Color indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
        style={{ background: color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${color}20` }}
          >
            <Layers className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {cardCount} cards • {categoryCount} categories
            </p>
          </div>
        </div>
        {isShared && (
          <div className="bg-secondary rounded-full p-1.5">
            <Users className="w-4 h-4 text-secondary-foreground" />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: color,
            }}
          />
        </div>
      </div>

      {/* Play button */}
      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          onPlay?.();
        }}
      >
        <Play className="w-5 h-5" />
        Study Now
      </Button>
    </div>
  );
};
