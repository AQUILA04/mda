import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CreatePlan() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [productId, setProductId] = useState<number | null>(null);
  const [frequence, setFrequence] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [montantParMise, setMontantParMise] = useState<string>("");

  // Get productId from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("productId");
    if (id) {
      setProductId(parseInt(id));
    }
  }, []);

  const { data: product, isLoading: productLoading } = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const createPlanMutation = trpc.cotisation.create.useMutation({
    onSuccess: () => {
      toast.success("Plan de cotisation créé avec succès !");
      setLocation("/client");
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !montantParMise) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const montant = parseInt(montantParMise);
    if (montant < 600) {
      toast.error("Le montant minimal par mise est de 600 FCFA");
      return;
    }

    createPlanMutation.mutate({
      productId,
      frequence,
      montantParMise: montant,
    });
  };

  const calculateEstimatedPayments = () => {
    if (!product || !montantParMise) return 0;
    const montant = parseInt(montantParMise);
    if (montant === 0) return 0;
    return Math.ceil(product.prixClient / montant);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900 cursor-pointer" onClick={() => setLocation("/client")}>
            {APP_TITLE}
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/client")}>
              Tableau de bord
            </Button>
            <Button variant="outline" onClick={() => logout()}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Créer un plan de cotisation</CardTitle>
            <CardDescription>
              Définissez votre rythme de paiement pour acquérir ce produit progressivement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {productLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : product ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{product.nom}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <p className="text-2xl font-bold text-blue-900">{product.prixClient} FCFA</p>
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="frequence">Fréquence de cotisation</Label>
                  <Select value={frequence} onValueChange={(value: any) => setFrequence(value)}>
                    <SelectTrigger id="frequence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount per payment */}
                <div className="space-y-2">
                  <Label htmlFor="montant">Montant par mise (minimum 600 FCFA)</Label>
                  <Input
                    id="montant"
                    type="number"
                    min="600"
                    value={montantParMise}
                    onChange={(e) => setMontantParMise(e.target.value)}
                    placeholder="Ex: 5000"
                  />
                </div>

                {/* Estimated payments */}
                {montantParMise && parseInt(montantParMise) >= 600 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Estimation</h4>
                    <p className="text-sm text-gray-600">
                      Nombre de versements estimé: <span className="font-bold">{calculateEstimatedPayments()}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Durée approximative:{" "}
                      <span className="font-bold">
                        {frequence === "daily"
                          ? `${calculateEstimatedPayments()} jours`
                          : frequence === "weekly"
                          ? `${calculateEstimatedPayments()} semaines`
                          : `${calculateEstimatedPayments()} mois`}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setLocation("/catalog")} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createPlanMutation.isPending} className="flex-1">
                    {createPlanMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer le plan"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-center text-gray-500 py-8">Produit non trouvé</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
