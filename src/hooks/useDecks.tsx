import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Deck {
  id: string;
  title: string;
  description: string | null;
  color: string;
  share_code: string | null;
  share_permission: string;
  is_offline_available: boolean;
  created_at: string;
  updated_at: string;
  cardCount?: number;
  categoryCount?: number;
  progress?: number;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  category_id: string | null;
  question: string;
  answer: string;
  question_image_url: string | null;
  answer_image_url: string | null;
  background_image_url: string | null;
  card_type: string;
  difficulty: number;
  priority: number;
  position: number;
  next_review_at: string;
  interval_days: number;
  ease_factor: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  categoryColor?: string;
}

export interface Category {
  id: string;
  deck_id: string;
  parent_id: string | null;
  name: string;
  color: string;
  position: number;
}

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDecks = async () => {
    if (!user) {
      setDecks([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch decks
      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (decksError) throw decksError;

      // Fetch card counts and category counts for each deck
      const decksWithCounts = await Promise.all(
        (decksData || []).map(async (deck) => {
          const [{ count: cardCount }, { count: categoryCount }] = await Promise.all([
            supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('deck_id', deck.id),
            supabase.from('categories').select('*', { count: 'exact', head: true }).eq('deck_id', deck.id),
          ]);

          // Calculate progress based on review_count > 0
          const { data: reviewedCards } = await supabase
            .from('flashcards')
            .select('review_count')
            .eq('deck_id', deck.id)
            .gt('review_count', 0);

          const progress = cardCount && cardCount > 0 
            ? Math.round(((reviewedCards?.length || 0) / cardCount) * 100) 
            : 0;

          return {
            ...deck,
            cardCount: cardCount || 0,
            categoryCount: categoryCount || 0,
            progress,
          };
        })
      );

      setDecks(decksWithCounts);
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos decks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (title: string, description?: string, color?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('decks')
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          color: color || 'hsl(0 75% 50%)',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchDecks();
      toast({
        title: "Deck créé",
        description: `"${title}" a été créé avec succès`
      });
      return data;
    } catch (error) {
      console.error('Error creating deck:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le deck",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateDeck = async (id: string, updates: Partial<Deck>) => {
    try {
      const { error } = await supabase
        .from('decks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchDecks();
      toast({
        title: "Deck modifié",
        description: "Les modifications ont été enregistrées"
      });
    } catch (error) {
      console.error('Error updating deck:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le deck",
        variant: "destructive"
      });
    }
  };

  const deleteDeck = async (id: string) => {
    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchDecks();
      toast({
        title: "Deck supprimé",
        description: "Le deck a été supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le deck",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [user]);

  return {
    decks,
    loading,
    fetchDecks,
    createDeck,
    updateDeck,
    deleteDeck,
  };
};

export const useFlashcards = (deckId: string | undefined) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFlashcards = async () => {
    if (!deckId || !user) {
      setFlashcards([]);
      setLoading(false);
      return;
    }

    try {
      const [{ data: cardsData, error: cardsError }, { data: categoriesData, error: categoriesError }] = await Promise.all([
        supabase
          .from('flashcards')
          .select('*')
          .eq('deck_id', deckId)
          .order('position'),
        supabase
          .from('categories')
          .select('*')
          .eq('deck_id', deckId)
          .order('position'),
      ]);

      if (cardsError) throw cardsError;
      if (categoriesError) throw categoriesError;

      const categoryColorMap = new Map<string, string>();
      (categoriesData || []).forEach(cat => categoryColorMap.set(cat.id, cat.color));

      const cardsWithColors = (cardsData || []).map(card => ({
        ...card,
        categoryColor: card.category_id ? categoryColorMap.get(card.category_id) || 'hsl(0 75% 50%)' : 'hsl(0 75% 50%)',
      }));

      setFlashcards(cardsWithColors);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les cartes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createFlashcard = async (data: { question: string; answer: string; category_id?: string; difficulty?: number }) => {
    if (!deckId || !user) return null;

    try {
      const { data: card, error } = await supabase
        .from('flashcards')
        .insert({
          deck_id: deckId,
          question: data.question,
          answer: data.answer,
          category_id: data.category_id || null,
          difficulty: data.difficulty || 3,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchFlashcards();
      return card;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la carte",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateFlashcard = async (id: string, updates: Partial<Flashcard>) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchFlashcards();
    } catch (error) {
      console.error('Error updating flashcard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la carte",
        variant: "destructive"
      });
    }
  };

  const updateSpacedRepetition = async (id: string, wasCorrect: boolean) => {
    const card = flashcards.find(c => c.id === id);
    if (!card) return;

    // Simple SM-2 algorithm
    let newEaseFactor = card.ease_factor;
    let newInterval = card.interval_days;

    if (wasCorrect) {
      if (card.review_count === 0) {
        newInterval = 1;
      } else if (card.review_count === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(card.interval_days * card.ease_factor);
      }
      newEaseFactor = Math.max(1.3, card.ease_factor + 0.1);
    } else {
      newInterval = 1;
      newEaseFactor = Math.max(1.3, card.ease_factor - 0.2);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    await updateFlashcard(id, {
      interval_days: newInterval,
      ease_factor: newEaseFactor,
      next_review_at: nextReview.toISOString(),
      review_count: card.review_count + 1,
    });
  };

  useEffect(() => {
    fetchFlashcards();
  }, [deckId, user]);

  return {
    flashcards,
    categories,
    loading,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    updateSpacedRepetition,
  };
};
