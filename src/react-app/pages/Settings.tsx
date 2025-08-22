import { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Download, 
  Upload, 
  Bell, 
  Smartphone,
  Database,
  Lock,
  HardDrive,
  CloudUpload
} from 'lucide-react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';

interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  biometricAuth: boolean;
  autoBackup: boolean;
  offlineMode: boolean;
}

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: false,
    notifications: true,
    biometricAuth: false,
    autoBackup: true,
    offlineMode: true,
  });

  const [showPinDialog, setShowPinDialog] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      
      // Apply dark mode immediately
      if (parsed.darkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const updateSetting = (key: keyof SettingsState, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));

    // Apply dark mode immediately
    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const exportData = async () => {
    try {
      // Simulate data export
      const data = {
        workers: JSON.parse(localStorage.getItem('workers') || '[]'),
        projects: JSON.parse(localStorage.getItem('projects') || '[]'),
        attendance: JSON.parse(localStorage.getItem('attendance') || '[]'),
        payments: JSON.parse(localStorage.getItem('payments') || '[]'),
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `labour-buddy-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            // Validate and import data
            if (data.workers) localStorage.setItem('workers', JSON.stringify(data.workers));
            if (data.projects) localStorage.setItem('projects', JSON.stringify(data.projects));
            if (data.attendance) localStorage.setItem('attendance', JSON.stringify(data.attendance));
            if (data.payments) localStorage.setItem('payments', JSON.stringify(data.payments));
            
            alert('Data imported successfully! Please refresh the app.');
          } catch (error) {
            console.error('Import failed:', error);
            alert('Invalid backup file. Please try again.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handlePinChange = () => {
    if (!currentPin || !newPin || !confirmPin) {
      alert('Please fill all PIN fields');
      return;
    }
    
    if (newPin !== confirmPin) {
      alert('New PIN and confirmation do not match');
      return;
    }
    
    if (newPin.length !== 4) {
      alert('PIN must be 4 digits');
      return;
    }
    
    // Save new PIN
    localStorage.setItem('appPin', newPin);
    setShowPinDialog(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    alert('PIN changed successfully!');
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('settings.title')}
      </h1>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Appearance
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Better visibility in low light</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.darkMode ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Language</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tamil / English</p>
              </div>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">App PIN</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Secure app with 4-digit PIN</p>
              </div>
            </div>
            <button
              onClick={() => setShowPinDialog(true)}
              className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              Change PIN
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Biometric Login</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Use fingerprint if available</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('biometricAuth', !settings.biometricAuth)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.biometricAuth ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.biometricAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data & Backup */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data & Backup
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudUpload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto Backup</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily local backup</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('autoBackup', !settings.autoBackup)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoBackup ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportData}
              className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 py-3 px-4 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            
            <button
              onClick={importData}
              className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 py-3 px-4 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </button>
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          App Settings
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment reminders & alerts</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Offline Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Work without internet</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('offlineMode', !settings.offlineMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.offlineMode ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.offlineMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* PIN Change Dialog */}
      {showPinDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-80 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change PIN</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  maxLength={4}
                  placeholder="****"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New PIN
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  maxLength={4}
                  placeholder="****"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  maxLength={4}
                  placeholder="****"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePinChange}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Change PIN
              </button>
              <button
                onClick={() => setShowPinDialog(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
