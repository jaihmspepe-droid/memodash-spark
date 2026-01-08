-- Table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  primary_color TEXT DEFAULT 'hsl(0 75% 50%)',
  dark_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Table des decks
CREATE TABLE public.decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'hsl(0 75% 50%)',
  share_code TEXT UNIQUE,
  share_permission TEXT DEFAULT 'none' CHECK (share_permission IN ('none', 'read', 'write')),
  is_offline_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own decks" ON public.decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared decks" ON public.decks
  FOR SELECT USING (share_code IS NOT NULL AND share_permission IN ('read', 'write'));

CREATE POLICY "Users can insert their own decks" ON public.decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" ON public.decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" ON public.decks
  FOR DELETE USING (auth.uid() = user_id);

-- Table des catégories (structure arborescente)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'hsl(0 75% 50%)',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories of their decks" ON public.categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.decks WHERE decks.id = categories.deck_id AND decks.user_id = auth.uid())
  );

CREATE POLICY "Users can insert categories in their decks" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.decks WHERE decks.id = categories.deck_id AND decks.user_id = auth.uid())
  );

CREATE POLICY "Users can update categories of their decks" ON public.categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.decks WHERE decks.id = categories.deck_id AND decks.user_id = auth.uid())
  );

CREATE POLICY "Users can delete categories of their decks" ON public.categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.decks WHERE decks.id = categories.deck_id AND decks.user_id = auth.uid())
  );

-- Table des flashcards
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  question_image_url TEXT,
  answer_image_url TEXT,
  background_image_url TEXT,
  card_type TEXT DEFAULT 'classic' CHECK (card_type IN ('classic', 'true_false')),
  difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
  priority INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  -- Spaced repetition fields
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  interval_days REAL DEFAULT 1,
  ease_factor REAL DEFAULT 2.5,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flashcards of their decks" ON public.flashcards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.decks WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid())
  );

CREATE POLICY "Users can insert flashcards in their decks" ON public.flashcards
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.decks WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid())
  );

CREATE POLICY "Users can update flashcards of their decks" ON public.flashcards
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.decks WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid())
  );

CREATE POLICY "Users can delete flashcards of their decks" ON public.flashcards
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.decks WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid())
  );

-- Table des sessions d'étude
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their study sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their study sessions" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their study sessions" ON public.study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger pour créer un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_decks_updated_at
  BEFORE UPDATE ON public.decks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_decks_user_id ON public.decks(user_id);
CREATE INDEX idx_categories_deck_id ON public.categories(deck_id);
CREATE INDEX idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX idx_flashcards_category_id ON public.flashcards(category_id);
CREATE INDEX idx_flashcards_next_review ON public.flashcards(next_review_at);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_deck_id ON public.study_sessions(deck_id);