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
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Trash2,
  Loader2,
  Folder,
  Play,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/hooks/useDecks";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { useNavigate } from "react-router-dom";

const colorOptions = [
  "hsl(0 75% 50%)",
  "hsl(280 70% 50%)",
  "hsl(142 70% 45%)",
  "hsl(45 95% 55%)",
  "hsl(200 80% 50%)",
  "hsl(320 70% 50%)",
];

interface CategoryManagerProps {
  deckId: string;
  categories: Category[];
  onCategoriesChange: () => void;
  selectedCategoryId?: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  cardCountByCategory?: Map<string, number>;
}

export const CategoryManager = ({
  deckId,
  categories,
  onCategoriesChange,
  selectedCategoryId,
  onSelectCategory,
  cardCountByCategory,
}: CategoryManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(colorOptions[0]);
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  const rootCategories = categories.filter((c) => !c.parent_id);

  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreating(true);

    try {
      const { error } = await supabase.from("categories").insert({
        deck_id: deckId,
        name: newCategoryName,
        color: newCategoryColor,
        parent_id: parentCategoryId,
      });

      if (error) throw error;

      setNewCategoryName("");
      setNewCategoryColor(colorOptions[0]);
      setParentCategoryId(null);
      setIsCreateDialogOpen(false);
      onCategoriesChange();

      toast({
        title: "Catégorie créée",
        description: `"${newCategoryName}" a été créée avec succès`,
      });
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      onCategoriesChange();
      if (selectedCategoryId === categoryId) {
        onSelectCategory(null);
      }

      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const openCreateSubcategory = (parentId: string) => {
    setParentCategoryId(parentId);
    setIsCreateDialogOpen(true);
  };

  const renderCategory = (category: Category, depth = 0) => {
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;
    const cardCount = cardCountByCategory?.get(category.id) || 0;

    return (
      <div key={category.id} className="space-y-1">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors group/item ${
            isSelected
              ? "bg-primary/10 border border-primary/30"
              : "hover:bg-muted"
          }`}
          style={{ marginLeft: depth * 16 }}
          onClick={() => onSelectCategory(category.id)}
        >
          {hasSubcategories ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(category.id);
              }}
              className="p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />

          <span className="flex-1 text-sm font-medium truncate">
            {category.name}
          </span>

          {cardCount > 0 && (
            <span className="text-xs text-muted-foreground">{cardCount}</span>
          )}

          <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/study/${deckId}?categoryId=${category.id}`);
              }}
              title="Étudier cette catégorie"
            >
              <Play className="w-3 h-3" />
            </Button>
            <EditCategoryDialog category={category} onUpdate={onCategoriesChange} />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                openCreateSubcategory(category.id);
              }}
            >
              <FolderPlus className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(category.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {hasSubcategories && isExpanded && (
          <div>
            {subcategories.map((sub) => renderCategory(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Folder className="w-4 h-4" />
          Catégories
        </h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setParentCategoryId(null)}
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {parentCategoryId ? "Nouvelle sous-catégorie" : "Nouvelle catégorie"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nom</Label>
                <Input
                  id="categoryName"
                  placeholder="Ex: Grammaire"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                />
              </div>
              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newCategoryColor === color
                          ? "scale-125 ring-2 ring-offset-2 ring-primary"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button
                variant="hero"
                className="w-full"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* "Toutes" option */}
      <div
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
          !selectedCategoryId
            ? "bg-primary/10 border border-primary/30"
            : "hover:bg-muted"
        }`}
        onClick={() => onSelectCategory(null)}
      >
        <div className="w-5" />
        <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
        <span className="flex-1 text-sm font-medium">Toutes les cartes</span>
      </div>

      {/* Categories list */}
      <div className="space-y-1 group">
        {rootCategories.map((category) => renderCategory(category))}
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune catégorie
        </p>
      )}
    </div>
  );
};
