import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isNative = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isIOS = () => Capacitor.getPlatform() === 'ios';

// Initialize native features
export const initializeNativeFeatures = async () => {
  if (!isNative()) return;

  try {
    // Configure status bar
    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: '#f97316' });
      await StatusBar.setStyle({ style: Style.Light });
    }

    // Handle hardware back button on Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    // Handle keyboard events
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });

  } catch (error) {
    console.warn('Failed to initialize native features:', error);
  }
};

// Haptic feedback helpers
export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Medium) => {
  if (isNative()) {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
};

export const hapticSuccess = () => hapticImpact(ImpactStyle.Light);
export const hapticWarning = () => hapticImpact(ImpactStyle.Medium);
export const hapticError = () => hapticImpact(ImpactStyle.Heavy);

// App state helpers
export const getAppInfo = async () => {
  if (isNative()) {
    try {
      return await App.getInfo();
    } catch (error) {
      console.warn('Failed to get app info:', error);
      return null;
    }
  }
  return null;
};

// Navigation helpers
export const handleNativeBackButton = (callback?: () => boolean) => {
  if (!isAndroid()) return;

  App.addListener('backButton', ({ canGoBack }) => {
    const shouldPreventDefault = callback?.() ?? false;
    
    if (shouldPreventDefault) {
      return; // Custom handling
    }

    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
};
