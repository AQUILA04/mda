import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function ProductCatalog() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const handleCreatePlan = (productId: number) => {
    setLocation(`/create-plan?productId=${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900 cursor-pointer" onClick={() => setLocation(user ? "/client" : "/")}>
            {APP_TITLE}
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Button variant="ghost" onClick={() => setLocation("/client")}>
                  Tableau de bord
                </Button>
                <Button variant="outline" onClick={() => logout()}>
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Catalogue de produits</h2>
          <p className="text-gray-600">Choisissez un produit et créez votre plan de cotisation</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  {product.imageUrl && (
                    <div className="w-full h-48 bg-gray-200 rounded-md mb-4 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.nom}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardTitle>{product.nom}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Prix:</span>
                      <span className="font-bold text-lg">{product.prixClient} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Stock:</span>
                      <span className={product.stockActuel > 0 ? "text-green-600" : "text-red-600"}>
                        {product.stockActuel > 0 ? `${product.stockActuel} disponible(s)` : "Rupture"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {user ? (
                    <Button
                      className="w-full"
                      onClick={() => handleCreatePlan(product.id)}
                      disabled={product.stockActuel === 0}
                    >
                      Créer un plan
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => setLocation("/")}>
                      Se connecter pour commander
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
