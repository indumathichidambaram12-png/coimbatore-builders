# Convert to Android App - Step by Step Guide

Your web app has been configured with Capacitor for Android conversion. Here's how to complete the setup:

## Prerequisites

1. **Install Android Studio**: Download from https://developer.android.com/studio
2. **Install Java Development Kit (JDK) 17**: Required for Android development
3. **Configure Android SDK**: Through Android Studio's SDK Manager

## Build Steps

### 1. Build the Web App
```bash
npm run build
```

### 2. Initialize Capacitor (if not done automatically)
```bash
npx cap init "Coimbatore Builders" com.coimbatorebuilders.app
```

### 3. Add Android Platform
```bash
npx cap add android
```

### 4. Copy Web Assets to Native Project
```bash
npx cap copy android
```

### 5. Update Native Dependencies
```bash
npx cap update android
```

### 6. Open in Android Studio
```bash
npx cap open android
```

## Android-Specific Features Added

- **App Icon**: Uses your existing logo
- **Splash Screen**: Orange theme matching your brand
- **Status Bar**: Configured with brand colors
- **Hardware Back Button**: Proper navigation handling
- **Keyboard Handling**: Automatic adjustment for input fields
- **Haptic Feedback**: Touch feedback for better UX

## App Configuration

The app is configured with:
- **App ID**: `com.coimbatorebuilders.app`
- **App Name**: `Coimbatore Builders`
- **Target SDK**: Android 13+ (API 33)
- **Minimum SDK**: Android 7+ (API 24)
- **Theme Color**: Orange (#f97316)

## Building APK/AAB

### Debug APK (for testing)
1. Open Android Studio
2. Go to Build → Build Bundle(s) / APK(s) → Build APK(s)
3. APK will be in `android/app/build/outputs/apk/debug/`

### Release APK/AAB (for distribution)
1. Generate signing key in Android Studio
2. Configure signing in `android/app/build.gradle`
3. Build → Generate Signed Bundle / APK

## Publishing to Google Play Store

1. **Create Google Play Console account**
2. **Upload AAB file** (recommended over APK)
3. **Fill app details**: Description, screenshots, etc.
4. **Set content rating and pricing**
5. **Release to internal testing first**
6. **Submit for review**

## Testing on Device

### USB Debugging
1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect device to computer
4. Run `npx cap run android` or use Android Studio

### APK Installation
1. Build debug APK
2. Transfer to device
3. Allow installation from unknown sources
4. Install APK

## Offline Functionality

Your app already supports offline functionality:
- SQLite database works offline
- All attendance, worker, and project data cached locally
- Sync capabilities when online

## Native Features Available

With Capacitor, you can add:
- **Camera**: For worker photos and attendance verification
- **GPS Location**: For site-based attendance tracking
- **Push Notifications**: For reminders and updates
- **File Storage**: For document management
- **Biometric Auth**: Fingerprint login
- **Contact Integration**: Worker contact management

## Next Steps

1. **Build the web app**: `npm run build`
2. **Install Android Studio** if not already installed
3. **Run**: `npx cap add android` (if the initial command failed)
4. **Copy assets**: `npx cap copy android`
5. **Open in Android Studio**: `npx cap open android`
6. **Test on device or emulator**

The app is now ready for Android deployment! All your existing features will work seamlessly in the native Android environment.
