import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Package, CheckCircle, Truck } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function LogisticsDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: pendingDeliveries, isLoading: pendingLoading, refetch: refetchPending } = trpc.logistics.pendingDeliveries.useQuery(undefined, {
    enabled: !!user && (user.role === "logistique" || user.role === "admin"),
  });
  const { data: allDeliveries, isLoading: allLoading, refetch: refetchAll } = trpc.logistics.allDeliveries.useQuery(undefined, {
    enabled: !!user && (user.role === "logistique" || user.role === "admin"),
  });

  const validateDeliveryMutation = trpc.logistics.validateDelivery.useMutation({
    onSuccess: () => {
      toast.success("Livraison validée et mise en cours");
      setValidationDialogOpen(false);
      setSelectedDelivery(null);
      setNotes("");
      refetchPending();
      refetchAll();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const completeDeliveryMutation = trpc.logistics.completeDelivery.useMutation({
    onSuccess: () => {
      toast.success("Livraison marquée comme terminée");
      refetchPending();
      refetchAll();
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

  // Allow admin and logistique roles
  if (user.role !== "admin" && user.role !== "logistique") {
    setLocation("/");
    return null;
  }

  const handleValidate = () => {
    if (selectedDelivery) {
      validateDeliveryMutation.mutate({
        deliveryId: selectedDelivery.delivery.id,
        notes,
      });
    }
  };

  const handleComplete = (deliveryId: number) => {
    completeDeliveryMutation.mutate({ deliveryId });
  };

  const getStatusBadge = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: "bg-yellow-100 text-yellow-800",
      en_cours: "bg-blue-100 text-blue-800",
      livree: "bg-green-100 text-green-800",
      annulee: "bg-red-100 text-red-800",
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">{APP_TITLE} - Logistique</h1>
          <div className="flex items-center gap-4">
            {user.role === "admin" && (
              <Button variant="ghost" onClick={() => setLocation("/admin")}>
                ← Admin
              </Button>
            )}
            <span className="text-sm text-gray-600">Logistique: {user.name}</span>
            <Button variant="outline" onClick={() => logout()}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDeliveries?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allDeliveries?.filter(d => d.delivery.statut === "en_cours").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livrées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allDeliveries?.filter(d => d.delivery.statut === "livree").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Deliveries */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Livraisons en attente de validation</CardTitle>
            <CardDescription>Valider les livraisons déclenchées automatiquement</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : pendingDeliveries && pendingDeliveries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDeliveries.map((item) => (
                    <TableRow key={item.delivery.id}>
                      <TableCell className="font-medium">{item.user?.name || "N/A"}</TableCell>
                      <TableCell>{item.product?.nom || "N/A"}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.delivery.adresseLivraison}</TableCell>
                      <TableCell>{new Date(item.delivery.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog open={validationDialogOpen && selectedDelivery?.delivery.id === item.delivery.id} onOpenChange={(open) => {
                          setValidationDialogOpen(open);
                          if (!open) {
                            setSelectedDelivery(null);
                            setNotes("");
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedDelivery(item)}
                            >
                              Valider
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Valider la livraison</DialogTitle>
                              <DialogDescription>
                                Confirmer la prise en charge de cette livraison
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p className="text-sm"><strong>Client:</strong> {item.user?.name}</p>
                                <p className="text-sm"><strong>Email:</strong> {item.user?.email || "N/A"}</p>
                                <p className="text-sm"><strong>Téléphone:</strong> {item.user?.phone || "N/A"}</p>
                                <p className="text-sm"><strong>Produit:</strong> {item.product?.nom}</p>
                                <p className="text-sm"><strong>Adresse:</strong> {item.delivery.adresseLivraison}</p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Notes (optionnel)</Label>
                                <Textarea
                                  id="notes"
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Ajouter des notes sur la livraison..."
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setValidationDialogOpen(false);
                                setSelectedDelivery(null);
                                setNotes("");
                              }}>
                                Annuler
                              </Button>
                              <Button onClick={handleValidate} disabled={validateDeliveryMutation.isPending}>
                                {validateDeliveryMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Validation...
                                  </>
                                ) : (
                                  "Valider"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune livraison en attente</p>
            )}
          </CardContent>
        </Card>

        {/* All Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Toutes les livraisons</CardTitle>
          </CardHeader>
          <CardContent>
            {allLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : allDeliveries && allDeliveries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDeliveries.map((item) => (
                    <TableRow key={item.delivery.id}>
                      <TableCell className="font-medium">{item.user?.name || "N/A"}</TableCell>
                      <TableCell>{item.product?.nom || "N/A"}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.delivery.adresseLivraison}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(item.delivery.statut)}`}>
                          {item.delivery.statut.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(item.delivery.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {item.delivery.statut === "en_cours" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleComplete(item.delivery.id)}
                            disabled={completeDeliveryMutation.isPending}
                          >
                            Marquer livrée
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune livraison</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
