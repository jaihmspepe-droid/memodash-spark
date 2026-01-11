import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Deck } from "@/hooks/useDecks";

const colorOptions = [
  "hsl(0 75% 50%)",
  "hsl(280 70% 50%)",
  "hsl(142 70% 45%)",
  "hsl(45 95% 55%)",
  "hsl(200 80% 50%)",
  "hsl(320 70% 50%)",
];

interface EditDeckDialogProps {
  deck: Deck;
  onUpdate: (id: string, updates: Partial<Deck>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export const EditDeckDialog = ({
  deck,
  onUpdate,
  onDelete,
  trigger,
}: EditDeckDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description || "");
  const [color, setColor] = useState(deck.color);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(deck.title);
      setDescription(deck.description || "");
      setColor(deck.color);
    }
  }, [isOpen, deck]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    await onUpdate(deck.id, {
      title: title.trim(),
      description: description.trim() || null,
      color,
    });
    setIsSaving(false);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(deck.id);
    setIsDeleting(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le Deck</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="deckTitle">Nom du deck</Label>
            <Input
              id="deckTitle"
              placeholder="Ex: Vocabulaire Anglais"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deckDescription">Description (optionnelle)</Label>
            <Textarea
              id="deckDescription"
              placeholder="Décrivez votre deck..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
          <div className="flex gap-2 pt-2">
            <Button
              variant="hero"
              className="flex-1"
              onClick={handleSave}
              disabled={!title.trim() || isSaving}
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce deck ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes les cartes et
                    catégories de ce deck seront également supprimées.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
