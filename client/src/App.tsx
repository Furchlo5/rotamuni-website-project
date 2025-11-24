import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import TodoPage from "@/pages/todo";
import CounterPage from "@/pages/counter";
import TimerPage from "@/pages/timer";
import AnalysisPage from "@/pages/analysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/todo" component={TodoPage} />
      <Route path="/counter" component={CounterPage} />
      <Route path="/timer" component={TimerPage} />
      <Route path="/analysis" component={AnalysisPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
