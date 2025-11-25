import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TimerProvider } from "@/contexts/TimerContext";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import TodoPage from "@/pages/todo";
import CounterPage from "@/pages/counter";
import TimerPage from "@/pages/timer";
import AnalysisPage from "@/pages/analysis";
import StreakPage from "@/pages/streak";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} user={user} />
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/todo" component={TodoPage} />
            <Route path="/counter" component={CounterPage} />
            <Route path="/timer" component={TimerPage} />
            <Route path="/analysis" component={AnalysisPage} />
            <Route path="/streak" component={StreakPage} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TimerProvider>
          <Toaster />
          <Router />
        </TimerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
