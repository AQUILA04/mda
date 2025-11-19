import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Shield, Eye, EyeOff } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showVault, setShowVault] = useState(false);

  const { data: users, isLoading: usersLoading, refetch } = trpc.admin.allUsers.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });
  const { data: vaultData, isLoading: vaultLoading } = trpc.admin.coffreFort.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Rôle mis à jour avec succès");
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

  if (user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole as any });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">{APP_TITLE} - Administration</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/finance")}>
              Finance
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/logistics")}>
              Logistique
            </Button>
            <span className="text-sm text-gray-600">Admin: {user.name}</span>
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
              <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter(u => u.role === "admin").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter(u => u.role === "client").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>Modifier les rôles et permissions des utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Rôle actuel</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name || "N/A"}</TableCell>
                      <TableCell>{u.email || "N/A"}</TableCell>
                      <TableCell>{u.phone || "N/A"}</TableCell>
                      <TableCell>
                        <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(value) => handleRoleChange(u.id, value)}
                          disabled={u.id === user.id}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="logistique">Logistique</SelectItem>
                            <SelectItem value="ambassadeur">Ambassadeur</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-4">Aucun utilisateur</p>
            )}
          </CardContent>
        </Card>

        {/* Coffre-fort Numérique */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Coffre-fort Numérique</CardTitle>
                <CardDescription>Accès sécurisé aux données financières (Admin uniquement)</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowVault(!showVault)}
                className="gap-2"
              >
                {showVault ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Masquer
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Afficher
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showVault ? (
              vaultLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : vaultData ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Flux comptables</h3>
                    {vaultData.flux.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type de flux</TableHead>
                            <TableHead>Montant net</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vaultData.flux.slice(0, 10).map((flux) => (
                            <TableRow key={flux.id}>
                              <TableCell className="capitalize">{flux.typeFlux.replace(/_/g, " ")}</TableCell>
                              <TableCell className="font-semibold">{flux.montantNet} FCFA</TableCell>
                              <TableCell>{new Date(flux.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-gray-500 text-sm">Aucun flux comptable</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Total des flux enregistrés</p>
                    <p className="text-2xl font-bold text-blue-900">{vaultData.flux.length}</p>
                  </div>
                </div>
              ) : null
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Cliquez sur "Afficher" pour accéder aux données sécurisées</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
