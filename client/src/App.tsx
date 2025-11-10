import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import HomePage from "@/pages/HomePage";
import OnboardingPage from "@/pages/OnboardingPage";
import EditorPage from "@/pages/EditorPage";
import GalleryPage from "@/pages/GalleryPage";
import AccountPage from "@/pages/AccountPage";
import SignInPage from "@/pages/SignInPage";
import NotFound from "@/pages/not-found";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <header className="flex items-center gap-2 p-4 border-b">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
        </header>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  // Routes that use the dashboard layout with sidebar
  const dashboardRoutes = ["/editor", "/gallery", "/account"];
  const useDashboard = dashboardRoutes.some(route => location.startsWith(route));

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/signin" component={SignInPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/editor">
        {useDashboard ? <DashboardLayout><EditorPage /></DashboardLayout> : <EditorPage />}
      </Route>
      <Route path="/gallery">
        {useDashboard ? <DashboardLayout><GalleryPage /></DashboardLayout> : <GalleryPage />}
      </Route>
      <Route path="/account">
        {useDashboard ? <DashboardLayout><AccountPage /></DashboardLayout> : <AccountPage />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Routes that should not show the header
  const noHeaderRoutes = ["/signin", "/editor", "/gallery", "/account"];
  const showHeader = !noHeaderRoutes.some(route => location.startsWith(route));

  // Routes that use the sidebar
  const dashboardRoutes = ["/editor", "/gallery", "/account"];
  const useSidebar = dashboardRoutes.some(route => location.startsWith(route));

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {useSidebar ? (
          <SidebarProvider style={style as React.CSSProperties}>
            <Router />
            <Toaster />
          </SidebarProvider>
        ) : (
          <div className="min-h-screen flex flex-col">
            {showHeader && <Header />}
            <main className="flex-1">
              <Router />
            </main>
            <Toaster />
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
