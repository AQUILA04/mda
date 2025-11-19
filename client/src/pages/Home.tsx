import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBag, TrendingUp, Package, Shield } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "finance") {
        setLocation("/finance");
      } else if (user.role === "logistique") {
        setLocation("/logistics");
      } else {
        setLocation("/client");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">{APP_TITLE}</h1>
          {!isAuthenticated && (
            <Button onClick={() => setLocation("/login")}>
              Se connecter
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Achetez maintenant, payez progressivement
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          MDA vous permet d'acquérir vos produits préférés grâce à un système de cotisation échelonnée (Tontine individuelle). 
          Cotisez à votre rythme et recevez votre produit une fois le montant atteint.
        </p>
        {!isAuthenticated && (
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <a href={getLoginUrl()}>Commencer maintenant</a>
          </Button>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <ShoppingBag className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Catalogue varié</CardTitle>
              <CardDescription>
                Produits physiques, digitaux et pharmaceutiques disponibles
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Paiement progressif</CardTitle>
              <CardDescription>
                Cotisez selon votre rythme : quotidien, hebdomadaire ou mensuel
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Package className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Livraison automatique</CardTitle>
              <CardDescription>
                Recevez votre produit dès que votre cotisation atteint 100%
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 text-orange-600 mb-4" />
              <CardTitle>Sécurisé</CardTitle>
              <CardDescription>
                Vos paiements et données sont protégés et traçables
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h3>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">1</span>
                Choisissez votre produit
              </CardTitle>
            </CardHeader>
            <CardContent>
              Parcourez notre catalogue et sélectionnez le produit que vous souhaitez acquérir.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">2</span>
                Créez votre plan de cotisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              Définissez la fréquence de vos versements (quotidien, hebdomadaire, mensuel) et le montant par mise.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">3</span>
                Cotisez à votre rythme
              </CardTitle>
            </CardHeader>
            <CardContent>
              Effectuez vos versements selon le calendrier que vous avez défini. Suivez votre progression en temps réel.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">4</span>
                Recevez votre produit
              </CardTitle>
            </CardHeader>
            <CardContent>
              Une fois 100% du montant atteint, votre livraison est automatiquement déclenchée !
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 {APP_TITLE}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
