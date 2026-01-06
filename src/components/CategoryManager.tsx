import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  nom: string;
  description: string | null;
  prefix?: string;
}

// Mapping catégorie → préfixe pour code modèle auto
export const CATEGORY_PREFIXES: Record<string, string> = {
  "Accessoires": "ACC",
  "Chemises": "CHE",
  "Pantalons": "PAN",
  "Robes": "ROB",
  "T-shirts": "TSH",
  "Vestes": "VES",
  "Jupes": "JUP",
  "Chaussures": "CHA",
  "Sacs": "SAC",
  "Bijoux": "BIJ",
};

// Génère un préfixe à partir du nom de catégorie
export function generatePrefix(categoryName: string): string {
  if (CATEGORY_PREFIXES[categoryName]) {
    return CATEGORY_PREFIXES[categoryName];
  }
  // Génère un préfixe de 3 lettres à partir du nom
  const cleaned = categoryName.toUpperCase().replace(/[^A-Z]/g, "");
  return cleaned.slice(0, 3) || "CAT";
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("nom");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;

    try {
      const { error } = await supabase
        .from("categories")
        .insert({ nom: newCategory.trim() });

      if (error) throw error;

      toast({ title: "Catégorie ajoutée" });
      setNewCategory("");
      setIsAdding(false);
      loadCategories();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message?.includes("duplicate") 
          ? "Cette catégorie existe déjà" 
          : "Impossible d'ajouter la catégorie",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      const { error } = await supabase
        .from("categories")
        .update({ nom: editValue.trim() })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Catégorie modifiée" });
      setEditingId(null);
      setEditValue("");
      loadCategories();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message?.includes("duplicate") 
          ? "Cette catégorie existe déjà" 
          : "Impossible de modifier la catégorie",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({ title: "Catégorie supprimée" });
      setDeleteId(null);
      loadCategories();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer (catégorie utilisée par des produits)",
        variant: "destructive",
      });
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditValue(cat.nom);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Catégories
        </CardTitle>
        <CardDescription>
          Gérez les catégories de produits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Liste des catégories */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2 rounded-lg border bg-card"
              >
                {editingId === cat.id ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(cat.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={() => handleUpdate(cat.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium">{cat.nom}</span>
                    <Badge variant="outline" className="text-xs">
                      {generatePrefix(cat.nom)}
                    </Badge>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(cat)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}

            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune catégorie
              </p>
            )}
          </div>
        )}

        {/* Ajout nouvelle catégorie */}
        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nom de la catégorie"
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewCategory("");
                }
              }}
            />
            <Button size="icon" variant="ghost" className="text-success" onClick={handleAdd}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => { setIsAdding(false); setNewCategory(""); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une catégorie
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          Le code modèle sera généré automatiquement (ex: ROB-001 pour Robes)
        </p>
      </CardContent>

      {/* Confirmation suppression */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La catégorie ne peut être supprimée que si aucun produit ne l'utilise.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
