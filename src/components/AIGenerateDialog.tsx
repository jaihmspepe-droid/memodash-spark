import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/hooks/useDecks";

interface AIGenerateDialogProps {
  deckId: string;
  categories: Category[];
  onCardsGenerated: () => void;
}

export function AIGenerateDialog({
  deckId,
  categories,
  onCardsGenerated,
}: AIGenerateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("10");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un sujet",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "generate-flashcards",
        {
          body: {
            topic: topic.trim(),
            count: parseInt(count),
            deckId,
            categoryId,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (functionData.error) {
        throw new Error(functionData.error);
      }

      const flashcards = functionData.flashcards;

      // Insert all generated flashcards into the database
      const { error: insertError } = await supabase.from("flashcards").insert(
        flashcards.map((card: any) => ({
          deck_id: deckId,
          question: card.question,
          answer: card.answer,
          difficulty: card.difficulty,
          category_id: card.category_id,
          position: card.position,
        }))
      );

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Cartes générées !",
        description: `${flashcards.length} cartes ont été créées avec succès`,
      });

      setTopic("");
      setCount("10");
      setCategoryId(null);
      setIsOpen(false);
      onCardsGenerated();
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer les cartes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-5 h-5" />
          Générer avec IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Générer des cartes avec l'IA
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Sujet</Label>
            <Input
              id="topic"
              placeholder="Ex: Les capitales européennes, Théorème de Pythagore..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Nombre de cartes</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 cartes</SelectItem>
                <SelectItem value="10">10 cartes</SelectItem>
                <SelectItem value="15">15 cartes</SelectItem>
                <SelectItem value="20">20 cartes</SelectItem>
                <SelectItem value="30">30 cartes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Catégorie (optionnel)</Label>
              <Select
                value={categoryId || "none"}
                onValueChange={(val) => setCategoryId(val === "none" ? null : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucune catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune catégorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p>
              L'IA va générer {count} flashcards éducatives sur le sujet "{topic || "..."}".
              Chaque carte aura une question et une réponse adaptées à l'apprentissage.
            </p>
          </div>

          <Button
            variant="hero"
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Générer {count} cartes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
