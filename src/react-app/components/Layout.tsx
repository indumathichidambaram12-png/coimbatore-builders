import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Wallet, 
  Building2, 
  Globe,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { StatusBar } from '@capacitor/status-bar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { logout } = useAuth();

  useEffect(() => {
    const setupStatusBar = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
      } catch (err) {
        console.error('Error setting up status bar:', err);
      }
    };
    setupStatusBar();
  }, []);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/workers', icon: Users, label: t('nav.workers') },
    { path: '/attendance', icon: Calendar, label: t('nav.attendance') },
    { path: '/payments', icon: Wallet, label: t('nav.payments') },
    { path: '/projects', icon: Building2, label: t('nav.projects') },
    { path: '/reports', icon: FileText, label: t('nav.reports') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header - with proper safe area handling */}
      <header 
        className="bg-white shadow-sm border-b border-orange-100 fixed top-0 left-0 right-0 z-50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-24 h-14 flex items-center justify-center">
                <img 
                  src="https://mocha-cdn.com/01987f69-986a-7e37-978b-43c0a7c00cf8/image.png_3546.png" 
                  alt="Coimbatore Builders" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">
                {t('app.title')}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-5 h-5" />
              <span className="ml-1 text-sm font-medium">
                {language === 'en' ? 'தமிழ்' : 'EN'}
              </span>
            </button>
            
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - with proper spacing for fixed header */}
      <main className="flex-1 mt-[calc(3.5rem+env(safe-area-inset-top))] mb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - with proper safe area handling */}
      <nav 
        className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-7 h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive 
                    ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 dark:hover:text-orange-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium truncate px-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
