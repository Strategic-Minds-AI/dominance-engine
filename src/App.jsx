import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
// Add page imports here
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import OpportunityRadar from '@/pages/admin/OpportunityRadar';
import WebsiteFactory from '@/pages/admin/WebsiteFactory';
import Preview from '@/pages/admin/Preview';
import Provisioning from '@/pages/admin/Provisioning';
import GptSync from '@/pages/admin/GptSync';
import Packs from '@/pages/admin/Packs';
import Pipeline from '@/pages/admin/Pipeline';
import SuperAgents from '@/pages/admin/SuperAgents';
import ApexControl from '@/pages/ApexControl';
import SyncDashboard from '@/pages/SyncDashboard';
import LaunchedSites from '@/pages/LaunchedSites';
import Programmatic from '@/pages/Programmatic';
import Studio from '@/pages/Studio';
import Dominance from '@/pages/Dominance';
import Experiments from '@/pages/Experiments';
import SocialMedia from '@/pages/admin/SocialMedia';
import VisualEditor from '@/pages/VisualEditor';
import CreationHub from '@/pages/CreationHub';
import UniversalFactory from '@/pages/admin/UniversalFactory';
import IndustryLibrary from '@/pages/admin/IndustryLibrary';
import SeoCommand from '@/pages/admin/SeoCommand';
import DominanceTimeline from '@/pages/DominanceTimeline';
import EdenAvatarStudio from '@/pages/EdenAvatarStudio';
import SiteVersionView from '@/pages/SiteVersionView';
import ClientPortal from '@/pages/ClientPortal';
import LegalPageView from '@/pages/LegalPageView';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/v/:slug" element={<SiteVersionView />} />
      <Route path="/portal/:slug" element={<ClientPortal />} />
      <Route path="/legal/:slug" element={<LegalPageView />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="opportunities" element={<OpportunityRadar />} />
          <Route path="website-factory" element={<WebsiteFactory />} />
          <Route path="preview" element={<Preview />} />
          <Route path="provisioning" element={<Provisioning />} />
          <Route path="gpt-sync" element={<GptSync />} />
          <Route path="packs" element={<Packs />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="super-agents" element={<SuperAgents />} />
          <Route path="apex" element={<ApexControl />} />
          <Route path="sync" element={<SyncDashboard />} />
          <Route path="launched-sites" element={<LaunchedSites />} />
          <Route path="programmatic" element={<Programmatic />} />
          <Route path="studio" element={<Studio />} />
          <Route path="dominance" element={<Dominance />} />
          <Route path="experiments" element={<Experiments />} />
          <Route path="social-media" element={<SocialMedia />} />
          <Route path="visual-editor" element={<VisualEditor />} />
          <Route path="create" element={<CreationHub />} />
          <Route path="universal-factory" element={<UniversalFactory />} />
          <Route path="industry-library" element={<IndustryLibrary />} />
          <Route path="seo-command" element={<SeoCommand />} />
          <Route path="eden-avatar" element={<EdenAvatarStudio />} />
          <Route path="timeline" element={<DominanceTimeline />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App