import { useState, useEffect } from "react";
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
import { Edit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/hooks/useDecks";

const colorOptions = [
  "hsl(0 75% 50%)",
  "hsl(280 70% 50%)",
  "hsl(142 70% 45%)",
  "hsl(45 95% 55%)",
  "hsl(200 80% 50%)",
  "hsl(320 70% 50%)",
];

interface EditCategoryDialogProps {
  category: Category;
  onUpdate: () => void;
}

export const EditCategoryDialog = ({
  category,
  onUpdate,
}: EditCategoryDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(category.name);
      setColor(category.color);
    }
  }, [isOpen, category]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: name.trim(),
          color,
        })
        .eq("id", category.id);

      if (error) throw error;

      onUpdate();
      setIsOpen(false);
      toast({
        title: "Catégorie modifiée",
        description: "Les modifications ont été enregistrées",
      });
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la catégorie",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nom</Label>
            <Input
              id="categoryName"
              placeholder="Ex: Grammaire"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c
                      ? "scale-125 ring-2 ring-offset-2 ring-primary"
                      : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button
            variant="hero"
            className="w-full"
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
