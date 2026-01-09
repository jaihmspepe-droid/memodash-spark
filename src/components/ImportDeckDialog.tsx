import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Link2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ImportDeckDialogProps {
  onImport: () => void;
}

export const ImportDeckDialog = ({ onImport }: ImportDeckDialogProps) => {
  const [code, setCode] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImport = async () => {
    if (!code.trim() || !user) return;

    setIsImporting(true);

    try {
      // Find deck with this share code
      const { data: sharedDeck, error: findError } = await supabase
        .from("decks")
        .select("*")
        .eq("share_code", code.toUpperCase())
        .single();

      if (findError || !sharedDeck) {
        toast({
          title: "Code invalide",
          description: "Aucun deck trouvé avec ce code de partage",
          variant: "destructive",
        });
        setIsImporting(false);
        return;
      }

      // Copy the deck
      const { data: newDeck, error: createError } = await supabase
        .from("decks")
        .insert({
          user_id: user.id,
          title: `${sharedDeck.title} (copie)`,
          description: sharedDeck.description,
          color: sharedDeck.color,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy all flashcards
      const { data: cards, error: cardsError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", sharedDeck.id);

      if (cardsError) throw cardsError;

      if (cards && cards.length > 0) {
        const newCards = cards.map((card) => ({
          deck_id: newDeck.id,
          question: card.question,
          answer: card.answer,
          difficulty: card.difficulty,
          card_type: card.card_type,
          question_image_url: card.question_image_url,
          answer_image_url: card.answer_image_url,
          background_image_url: card.background_image_url,
        }));

        const { error: insertError } = await supabase
          .from("flashcards")
          .insert(newCards);

        if (insertError) throw insertError;
      }

      toast({
        title: "Deck importé !",
        description: `"${sharedDeck.title}" a été copié dans vos decks`,
      });

      setCode("");
      setOpen(false);
      onImport();
    } catch (error) {
      console.error("Error importing deck:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer le deck",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Importer un deck
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Importer un deck partagé
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="shareCode">Code de partage</Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="shareCode"
                placeholder="Ex: ABC12XYZ"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="pl-10 font-mono text-lg tracking-wider uppercase"
                maxLength={8}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Entrez le code à 8 caractères partagé par l'auteur du deck
            </p>
          </div>

          <Button
            variant="hero"
            className="w-full"
            onClick={handleImport}
            disabled={code.length < 8 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importation...
              </>
            ) : (
              "Importer le deck"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
