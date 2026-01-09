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
import { Share2, Copy, Check, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShareDeckDialogProps {
  deckId: string;
  deckTitle: string;
  currentShareCode?: string | null;
  currentPermission?: string;
  onUpdate: () => void;
}

export const ShareDeckDialog = ({
  deckId,
  deckTitle,
  currentShareCode,
  currentPermission = "none",
  onUpdate,
}: ShareDeckDialogProps) => {
  const [shareCode, setShareCode] = useState(currentShareCode || "");
  const [permission, setPermission] = useState(currentPermission);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareCode = async () => {
    setIsGenerating(true);
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      const { error } = await supabase
        .from("decks")
        .update({ share_code: code, share_permission: "read" })
        .eq("id", deckId);

      if (error) throw error;

      setShareCode(code);
      setPermission("read");
      onUpdate();
      toast({
        title: "Code généré",
        description: "Votre code de partage a été créé",
      });
    } catch (error) {
      console.error("Error generating share code:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeShare = async () => {
    try {
      const { error } = await supabase
        .from("decks")
        .update({ share_code: null, share_permission: "none" })
        .eq("id", deckId);

      if (error) throw error;

      setShareCode("");
      setPermission("none");
      onUpdate();
      toast({
        title: "Partage révoqué",
        description: "Le deck n'est plus partagé",
      });
    } catch (error) {
      console.error("Error revoking share:", error);
      toast({
        title: "Erreur",
        description: "Impossible de révoquer le partage",
        variant: "destructive",
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copié !",
      description: "Le code a été copié dans le presse-papier",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Partager "{deckTitle}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {shareCode ? (
            <>
              <div className="space-y-2">
                <Label>Code de partage</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={shareCode}
                      readOnly
                      className="pl-10 font-mono text-lg tracking-wider"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={copyCode}>
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Partagez ce code avec vos amis pour qu'ils puissent accéder au deck
                </p>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={revokeShare}
              >
                Révoquer le partage
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Deck non partagé
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Générez un code pour partager ce deck avec d'autres utilisateurs
              </p>
              <Button
                variant="hero"
                onClick={generateShareCode}
                disabled={isGenerating}
              >
                {isGenerating ? "Génération..." : "Générer un code"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
