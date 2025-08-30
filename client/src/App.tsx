import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Calculator from "@/pages/calculator";
import Invoicing from "@/pages/invoicing";
import History from "@/pages/history";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Switch>
              <ProtectedRoute path="/" component={Dashboard} />
              <ProtectedRoute path="/customers" component={Customers} />
              <ProtectedRoute path="/calculator" component={Calculator} />
              <ProtectedRoute path="/invoicing" component={Invoicing} />
              <ProtectedRoute path="/history" component={History} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Switch>
              <Route path="/auth">
                <AuthPage />
              </Route>
              <Route>
                <Header />
                <Router />
              </Route>
            </Switch>
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
