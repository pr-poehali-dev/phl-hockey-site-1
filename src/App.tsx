
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Icon from "@/components/ui/icon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <nav className="bg-primary text-primary-foreground shadow-lg">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold font-['Montserrat']">
                  <Icon name="Trophy" size={28} />
                  <span>PHL</span>
                </Link>
                <div className="flex gap-6">
                  <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
                    <Icon name="Home" size={20} />
                    <span>Главная</span>
                  </Link>
                  <Link to="/admin" className="hover:opacity-80 transition-opacity flex items-center gap-2">
                    <Icon name="Settings" size={20} />
                    <span>Админка</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;