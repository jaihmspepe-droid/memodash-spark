import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStats {
  totalSessions: number;
  totalCorrect: number;
  totalIncorrect: number;
  averageScore: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const { data: sessions, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null);

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        setStats({
          totalSessions: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          averageScore: 0,
          winRate: 0,
          currentStreak: 0,
          maxStreak: 0,
        });
        setLoading(false);
        return;
      }

      const totalSessions = sessions.length;
      const totalCorrect = sessions.reduce((acc, s) => acc + (s.correct_count || 0), 0);
      const totalIncorrect = sessions.reduce((acc, s) => acc + (s.incorrect_count || 0), 0);
      const totalAnswered = totalCorrect + totalIncorrect;
      const winRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
      const averageScore = Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions);
      const maxStreak = Math.max(...sessions.map(s => s.max_streak || 0));

      // Calculate current streak (consecutive days with sessions)
      const sortedSessions = [...sessions].sort(
        (a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
      );
      
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < sortedSessions.length; i++) {
        const sessionDate = new Date(sortedSessions[i].completed_at!);
        sessionDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        if (sessionDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else if (sessionDate.getTime() < expectedDate.getTime()) {
          break;
        }
      }

      setStats({
        totalSessions,
        totalCorrect,
        totalIncorrect,
        averageScore,
        winRate,
        currentStreak,
        maxStreak,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return { stats, loading, refetch: fetchStats };
};
