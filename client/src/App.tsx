import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientDashboard from "./pages/ClientDashboard";
import ProductCatalog from "./pages/ProductCatalog";
import CreatePlan from "./pages/CreatePlan";
import PlanDetails from "./pages/PlanDetails";
import AdminDashboard from "./pages/AdminDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import LogisticsDashboard from "./pages/LogisticsDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/client"} component={ClientDashboard} />
      <Route path={"/catalog"} component={ProductCatalog} />
      <Route path={"/create-plan"} component={CreatePlan} />
      <Route path={"/plan/:id"} component={PlanDetails} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/finance"} component={FinanceDashboard} />
      <Route path={"/logistics"} component={LogisticsDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
