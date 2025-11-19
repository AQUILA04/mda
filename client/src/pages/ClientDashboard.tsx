import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, ShoppingBag, Wallet } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function ClientDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: plans, isLoading: plansLoading } = trpc.cotisation.myPlans.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: avoirData } = trpc.profile.getAvoirBalance.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (user.role !== "client" && user.role !== "ambassadeur") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">{APP_TITLE}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Bonjour, {user.name}</span>
            <Button variant="outline" onClick={() => logout()}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans actifs</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans?.filter(p => p.plan.statut === "actif").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avoir disponible</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avoirData?.balance || 0} FCFA</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans complétés</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans?.filter(p => p.plan.statut === "complete" || p.plan.statut === "livre").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setLocation("/catalog")} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau plan de cotisation
          </Button>
          <Button variant="outline" onClick={() => setLocation("/catalog")}>
            Parcourir le catalogue
          </Button>
        </div>

        {/* Plans List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Mes plans de cotisation</h2>
          {plansLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : plans && plans.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {plans.map(({ plan, product }) => {
                const progress = (plan.montantCotise / plan.montantTotal) * 100;
                return (
                  <Card key={plan.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation(`/plan/${plan.id}`)}>
                    <CardHeader>
                      <CardTitle>{product?.nom || "Produit"}</CardTitle>
                      <CardDescription>
                        Statut: <span className="font-semibold capitalize">{plan.statut}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progression</span>
                            <span className="font-semibold">{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cotisé:</span>
                          <span className="font-semibold">{plan.montantCotise} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total:</span>
                          <span className="font-semibold">{plan.montantTotal} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Fréquence:</span>
                          <span className="capitalize">{plan.frequence}</span>
                        </div>
                        {plan.prochaineEcheance && plan.statut === "actif" && (
                          <div className="flex justify-between text-sm">
                            <span>Prochaine échéance:</span>
                            <span>{new Date(plan.prochaineEcheance).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 mb-4">Vous n'avez pas encore de plan de cotisation.</p>
                <Button onClick={() => setLocation("/catalog")}>
                  Créer mon premier plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
