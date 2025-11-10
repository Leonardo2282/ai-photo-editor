import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import LandingPage from "@/pages/LandingPage";
import HomePage from "@/pages/HomePage";
import OnboardingPage from "@/pages/OnboardingPage";
import EditorPage from "@/pages/EditorPage";
import GalleryPage from "@/pages/GalleryPage";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="*" component={LandingPage} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/editor" component={EditorPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
