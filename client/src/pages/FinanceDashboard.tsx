import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function FinanceDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [liquidationDialogOpen, setLiquidationDialogOpen] = useState(false);

  const { data: liquidations, isLoading: liquidationsLoading, refetch } = trpc.finance.pendingLiquidations.useQuery(undefined, {
    enabled: !!user && (user.role === "finance" || user.role === "admin"),
  });
  const { data: report, isLoading: reportLoading } = trpc.finance.revenueReport.useQuery(undefined, {
    enabled: !!user && (user.role === "finance" || user.role === "admin"),
  });

  const validateLiquidationMutation = trpc.finance.validateLiquidation.useMutation({
    onSuccess: (data) => {
      toast.success(`Liquidation validée. Pénalité: ${data.penalite} FCFA, Avoir client: ${data.avoirClient} FCFA`);
      setLiquidationDialogOpen(false);
      setSelectedPlan(null);
      refetch();
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

  // Allow admin and finance roles
  if (user.role !== "admin" && user.role !== "finance") {
    setLocation("/");
    return null;
  }

  const handleValidateLiquidation = () => {
    if (selectedPlan) {
      validateLiquidationMutation.mutate({ planId: selectedPlan.plan.id });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">{APP_TITLE} - Finance</h1>
          <div className="flex items-center gap-4">
            {user.role === "admin" && (
              <Button variant="ghost" onClick={() => setLocation("/admin")}>
                ← Admin
              </Button>
            )}
            <span className="text-sm text-gray-600">Finance: {user.name}</span>
            <Button variant="outline" onClick={() => logout()}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Revenue Report */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Rapport des revenus</h2>
          {reportLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : report ? (
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventes physiques</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.ventesPhysiques} FCFA</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventes digitales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.ventesDigitales} FCFA</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus exceptionnels</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{report.revenusExceptionnels} FCFA</div>
                  <p className="text-xs text-muted-foreground mt-1">Pénalités de liquidation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total net</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{report.total} FCFA</div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        {/* Pending Liquidations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Liquidations en attente
            </CardTitle>
            <CardDescription>
              Valider les demandes de rupture de contrat (1/3 pénalité, 2/3 avoir client)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {liquidationsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : liquidations && liquidations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Montant cotisé</TableHead>
                    <TableHead>Pénalité (1/3)</TableHead>
                    <TableHead>Avoir client (2/3)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liquidations.map((item) => {
                    const penalite = Math.floor(item.plan.montantCotise / 3);
                    const avoir = item.plan.montantCotise - penalite;
                    return (
                      <TableRow key={item.plan.id}>
                        <TableCell className="font-medium">{item.user.name || "N/A"}</TableCell>
                        <TableCell>{item.product?.nom || "N/A"}</TableCell>
                        <TableCell className="font-semibold">{item.plan.montantCotise} FCFA</TableCell>
                        <TableCell className="text-red-600 font-semibold">{penalite} FCFA</TableCell>
                        <TableCell className="text-green-600 font-semibold">{avoir} FCFA</TableCell>
                        <TableCell>
                          <Dialog open={liquidationDialogOpen && selectedPlan?.plan.id === item.plan.id} onOpenChange={(open) => {
                            setLiquidationDialogOpen(open);
                            if (!open) setSelectedPlan(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedPlan(item)}
                              >
                                Valider
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirmer la liquidation</DialogTitle>
                                <DialogDescription>
                                  Vous êtes sur le point de valider la liquidation du contrat de {item.user.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                  <p className="text-sm"><strong>Produit:</strong> {item.product?.nom}</p>
                                  <p className="text-sm"><strong>Montant cotisé:</strong> {item.plan.montantCotise} FCFA</p>
                                  <div className="border-t pt-2 mt-2">
                                    <p className="text-sm text-red-600">
                                      <strong>Pénalité entreprise (1/3):</strong> {penalite} FCFA
                                    </p>
                                    <p className="text-sm text-green-600">
                                      <strong>Avoir client (2/3):</strong> {avoir} FCFA
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Cette action créera automatiquement les flux comptables appropriés et créditera 
                                  le compte avoir du client.
                                </p>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                  setLiquidationDialogOpen(false);
                                  setSelectedPlan(null);
                                }}>
                                  Annuler
                                </Button>
                                <Button onClick={handleValidateLiquidation} disabled={validateLiquidationMutation.isPending}>
                                  {validateLiquidationMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Validation...
                                    </>
                                  ) : (
                                    "Confirmer"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune liquidation en attente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
