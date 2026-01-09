import { useStats } from "@/hooks/useStats";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BarChart3, Flame, Trophy, Target, TrendingUp } from "lucide-react";

export const StatsDisplay = () => {
  const { stats, loading } = useStats();

  if (loading || !stats) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium">{stats.currentStreak}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <h4 className="font-display font-bold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Vos Statistiques
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Win Rate */}
            <div className="bg-success/10 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">{stats.winRate}%</p>
              <p className="text-xs text-muted-foreground">Taux de réussite</p>
            </div>

            {/* Average Score */}
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{stats.averageScore}</p>
              <p className="text-xs text-muted-foreground">Score moyen</p>
            </div>

            {/* Current Streak */}
            <div className="bg-orange-500/10 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-500">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Streak actuel</p>
            </div>

            {/* Max Streak */}
            <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-500">{stats.maxStreak}</p>
              <p className="text-xs text-muted-foreground">Record streak</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sessions totales</span>
              <span className="font-medium">{stats.totalSessions}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Réponses correctes</span>
              <span className="font-medium text-success">{stats.totalCorrect}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Réponses incorrectes</span>
              <span className="font-medium text-destructive">{stats.totalIncorrect}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
