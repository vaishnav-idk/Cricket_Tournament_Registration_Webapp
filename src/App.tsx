import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Registration from "./pages/Registration";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import AdminLogin from "./pages/admin/Login";
// import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

// import RegisterMen from "./pages/register/RegisterMen";
// import RegisterWomen from "./pages/register/RegisterWomen";

import AdminDashboard_v2 from "./pages/admin/Dashboard_v2";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Registration />} />
          {/* <Route path="/register/men" element={<RegisterMen />} /> */}
          {/* <Route path="/register/women" element={<RegisterWomen />} /> */}
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/admin" element={<AdminLogin />} />
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          <Route path="/admin/dashboard_v2" element={<AdminDashboard_v2 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
