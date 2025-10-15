import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LoginForm } from "@/components/auth/LoginForm";
import { PsychologistLayout } from "@/layouts/PsychologistLayout";
import { ChildLayout } from "@/layouts/ChildLayout";
import { PsychologistDashboard } from "@/components/psychologist/Dashboard";
import { PatientsView } from "@/components/psychologist/Patients";
import { SessionsView } from "@/components/psychologist/Sessions";
import { AnalysisTEAView } from "@/components/psychologist/AnalysisTEA";
import { BiometricView } from "@/components/psychologist/BiometricView";
import { SettingsView } from "@/components/psychologist/Settings";
import { EmotionalWorld } from "@/components/child/EmotionalWorld";
import { AudioProvider } from "@/components/shared/AudioSystem";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user, theme } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider>
          <Toaster />
          <Sonner />
          
          {!isAuthenticated || !user ? (
            <LoginForm />
          ) : (
            <div className={theme === 'psychologist' ? 'psychologist-theme' : 'child-theme'}>
              <BrowserRouter>
                {user.role === 'psychologist' ? (
                  <PsychologistLayout>
                    <Routes>
                      <Route path="/" element={<PsychologistDashboard />} />
                      <Route path="/dashboard" element={<PsychologistDashboard />} />
                      <Route path="/patients" element={<PatientsView />} />
                      <Route path="/sessions" element={<SessionsView />} />
                      <Route path="/analysis" element={<AnalysisTEAView />} />
                      <Route path="/biometric" element={<BiometricView />} />
                      <Route path="/settings" element={<SettingsView />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </PsychologistLayout>
                ) : (
                  <ChildLayout>
                    <Routes>
                      <Route path="/" element={<EmotionalWorld />} />
                      <Route path="/emotions" element={<EmotionalWorld />} />
                      {/* ADD ALL CHILD ROUTES HERE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ChildLayout>
                )}
              </BrowserRouter>
            </div>
          )}
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
