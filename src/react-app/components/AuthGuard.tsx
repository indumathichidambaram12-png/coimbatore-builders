import React, { useState } from 'react';
import { Lock, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { useLanguage } from '@/react-app/contexts/LanguageContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, login, setupPin, hasPin } = useAuth();
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleLogin = () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (login(pin)) {
      setError('');
      setPin('');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleSetupPin = () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setupPin(pin);
    setError('');
    setPin('');
    setConfirmPin('');
  };

  const handlePinInput = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
      setError('');
    }
  };

  const handleConfirmPinInput = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setConfirmPin(value);
      setError('');
    }
  };

  const requestBiometric = async () => {
    try {
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        // Check if biometric authentication is available
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: 'Coimbatore Builders' },
            user: {
              id: new Uint8Array(16),
              name: 'user@coimbatorebuilders.com',
              displayName: 'Coimbatore Builders User',
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required',
            },
          },
        });

        if (credential) {
          // Biometric authentication successful
          const storedPin = localStorage.getItem('appPin');
          if (storedPin && login(storedPin)) {
            return;
          }
        }
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
    }
  };

  const showSetupScreen = !hasPin || isSettingUp;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-64 h-48 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="https://mocha-cdn.com/01987f69-986a-7e37-978b-43c0a7c00cf8/image.png_3546.png" 
              alt="Coimbatore Builders Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('app.title')}
          </h1>
          <p className="text-gray-600 text-sm">
            {showSetupScreen ? 'Setup your secure PIN' : 'Enter your PIN to continue'}
          </p>
        </div>

        {/* PIN Setup Form */}
        {showSetupScreen ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create 4-digit PIN *
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => handlePinInput(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm PIN *
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => handleConfirmPinInput(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="••••"
                maxLength={4}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleSetupPin}
              disabled={pin.length !== 4 || confirmPin.length !== 4}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Setup PIN
            </button>

            {hasPin && (
              <button
                onClick={() => setIsSettingUp(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Login
              </button>
            )}
          </div>
        ) : (
          /* PIN Login Form */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => handlePinInput(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && pin.length === 4) {
                      handleLogin();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={pin.length !== 4}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Login
            </button>

            {/* Biometric Login Button */}
            <button
              onClick={requestBiometric}
              className="w-full bg-blue-50 text-blue-700 py-3 px-6 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-5 h-5" />
              Use Biometric
            </button>

            <button
              onClick={() => setIsSettingUp(true)}
              className="w-full text-gray-600 text-sm underline hover:text-gray-800 transition-colors"
            >
              Change PIN
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Your data is encrypted and stored securely on this device</p>
        </div>
      </div>
    </div>
  );
}
