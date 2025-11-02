
import { useState, useEffect } from "react";
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

const App = () => {
  const [leagueLogo, setLeagueLogo] = useState<string | null>(null);
  const [leagueName, setLeagueName] = useState('PHL');

  useEffect(() => {
    fetch('https://functions.poehali.dev/6ba303f7-5999-4705-a914-9eea15983942?path=league-info')
      .then(res => res.json())
      .then(data => {
        if (data.logo_url) setLeagueLogo(data.logo_url);
        if (data.league_name) setLeagueName(data.league_name);
      })
      .catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <nav className="bg-primary text-primary-foreground shadow-lg">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                  <Link to="/" className="flex items-center gap-3 text-xl font-bold font-['Montserrat']">
                    {leagueLogo ? (
                      <img src={leagueLogo} alt="Logo" className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <Icon name="Trophy" size={28} />
                    )}
                    <span>{leagueName}</span>
                  </Link>
                  <div className="flex items-center gap-6">
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
};

export default App;