import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Pets from "@/pages/Pets";
import PetDetails from "@/pages/PetDetails";
import Shelters from "@/pages/Shelters";
import ShelterDetails from "@/pages/ShelterDetails";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdoptionForm from "@/pages/AdoptionForm";
import AdoptionApplicationSuccess from "@/pages/AdoptionApplicationSuccess";
import AuthPage from "@/pages/auth-page";
import MyAppointments from "@/pages/MyAppointments";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/pets" component={Pets} />
          <Route path="/pets/:id" component={PetDetails} />
          <Route path="/shelters" component={Shelters} />
          <Route path="/shelters/:id" component={ShelterDetails} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/adopt/:id" component={AdoptionForm} />
          <ProtectedRoute path="/pets/:id/adoption-success" component={AdoptionApplicationSuccess} />
          <ProtectedRoute path="/my-appointments" component={MyAppointments} />
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
