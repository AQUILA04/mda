import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function PlanDetails() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const planId = parseInt(params.id || "0");
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [liquidationDialogOpen, setLiquidationDialogOpen] = useState(false);
  const [montant, setMontant] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("MoMo");

  const { data: planData, isLoading, refetch } = trpc.cotisation.getPlan.useQuery({ id: planId });
  const { data: payments, refetch: refetchPayments } = trpc.cotisation.getPayments.useQuery({ planId });

  const makePaymentMutation = trpc.cotisation.makePayment.useMutation({
    onSuccess: (data) => {
      toast.success(data.planComplete ? "Plan complété ! Livraison en cours." : "Paiement effectué avec succès !");
      setPaymentDialogOpen(false);
      setMontant("");
      refetch();
      refetchPayments();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const requestLiquidationMutation = trpc.cotisation.requestLiquidation.useMutation({
    onSuccess: () => {
      toast.success("Demande de liquidation envoyée");
      setLiquidationDialogOpen(false);
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

  const handlePayment = () => {
    if (!montant || parseInt(montant) < 600) {
      toast.error("Le montant minimal est de 600 FCFA");
      return;
    }

    makePaymentMutation.mutate({
      planId,
      montant: parseInt(montant),
      paymentMethod,
    });
  };

  const handleLiquidation = () => {
    requestLiquidationMutation.mutate({ planId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Plan non trouvé</p>
      </div>
    );
  }

  const { plan, product } = planData;
  const progress = (plan.montantCotise / plan.montantTotal) * 100;
  const restant = plan.montantTotal - plan.montantCotise;

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

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Product & Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{product?.nom}</CardTitle>
            <CardDescription>
              Statut: <span className="font-semibold capitalize">{plan.statut}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progression</span>
                <span className="text-sm font-bold">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Montant cotisé</p>
                <p className="text-2xl font-bold text-blue-900">{plan.montantCotise} FCFA</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Montant total</p>
                <p className="text-2xl font-bold text-green-900">{plan.montantTotal} FCFA</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Restant</p>
                <p className="text-2xl font-bold text-orange-900">{restant} FCFA</p>
              </div>
            </div>

            {/* Plan Details */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Fréquence</p>
                <p className="font-semibold capitalize">{plan.frequence}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant par mise</p>
                <p className="font-semibold">{plan.montantParMise} FCFA</p>
              </div>
              {plan.prochaineEcheance && plan.statut === "actif" && (
                <div>
                  <p className="text-sm text-gray-600">Prochaine échéance</p>
                  <p className="font-semibold">{new Date(plan.prochaineEcheance).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Date de début</p>
                <p className="font-semibold">{new Date(plan.dateDebut).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Actions */}
            {plan.statut === "actif" && (
              <div className="flex gap-4 pt-4">
                <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 gap-2">
                      <CreditCard className="w-4 h-4" />
                      Effectuer un versement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Effectuer un versement</DialogTitle>
                      <DialogDescription>
                        Ajoutez un paiement à votre plan de cotisation
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="montant">Montant (minimum 600 FCFA)</Label>
                        <Input
                          id="montant"
                          type="number"
                          min="600"
                          value={montant}
                          onChange={(e) => setMontant(e.target.value)}
                          placeholder="Ex: 5000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="method">Moyen de paiement</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger id="method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MoMo">Mobile Money (MoMo)</SelectItem>
                            <SelectItem value="T-money">T-money</SelectItem>
                            <SelectItem value="PayPal">PayPal</SelectItem>
                            <SelectItem value="Carte">Carte bancaire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handlePayment} disabled={makePaymentMutation.isPending}>
                        {makePaymentMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          "Confirmer"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={liquidationDialogOpen} onOpenChange={setLiquidationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="flex-1 gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Demander la liquidation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Liquidation du contrat</DialogTitle>
                      <DialogDescription>
                        Attention : En liquidant ce contrat, vous récupérerez 2/3 du montant cotisé en avoir client. 
                        1/3 sera retenu comme pénalité.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Calcul de la liquidation :</p>
                      <p className="text-sm">Montant cotisé : {plan.montantCotise} FCFA</p>
                      <p className="text-sm">Pénalité (1/3) : {Math.floor(plan.montantCotise / 3)} FCFA</p>
                      <p className="text-sm font-bold text-green-700">
                        Avoir client (2/3) : {plan.montantCotise - Math.floor(plan.montantCotise / 3)} FCFA
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setLiquidationDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button variant="destructive" onClick={handleLiquidation} disabled={requestLiquidationMutation.isPending}>
                        {requestLiquidationMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          "Confirmer la liquidation"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des versements</CardTitle>
          </CardHeader>
          <CardContent>
            {payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{payment.montant} FCFA</p>
                      <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{payment.transactionRef}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Aucun versement effectué</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
