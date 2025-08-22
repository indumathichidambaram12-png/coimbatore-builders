import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/shared/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Tamil translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // App title
    'app.title': 'Coimbatore Builders',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.workers': 'Workers',
    'nav.attendance': 'Attendance',
    'nav.payments': 'Payments',
    'nav.projects': 'Projects',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalWorkers': 'Total Workers',
    'dashboard.activeWorkers': 'Active Workers',
    'dashboard.todayAttendance': 'Today\'s Attendance',
    'dashboard.pendingPayments': 'Pending Payments',
    'dashboard.thisMonthWages': 'This Month Wages',
    
    // Workers
    'workers.title': 'Workers',
    'workers.addWorker': 'Add Worker',
    'workers.editWorker': 'Edit Worker',
    'workers.name': 'Name',
    'workers.labourType': 'Labour Type',
    'workers.phone': 'Phone Number',
    'workers.aadhaar': 'Aadhaar/ID',
    'workers.dailyWage': 'Daily Wage',
    'workers.hourlyRate': 'Hourly Rate',
    'workers.upiId': 'UPI ID',
    'workers.project': 'Project',
    'workers.noWorkers': 'No workers found',
    
    // Attendance
    'attendance.title': 'Attendance',
    'attendance.date': 'Date',
    'attendance.markAttendance': 'Mark Attendance',
    'attendance.full': 'Full Day',
    'attendance.half': 'Half Day',
    'attendance.absent': 'Absent',
    'attendance.present': 'Present',
    'attendance.noAttendance': 'No attendance records',
    
    // Payments
    'payments.title': 'Payments',
    'payments.addPayment': 'Add Payment',
    'payments.amount': 'Amount',
    'payments.type': 'Type',
    'payments.wage': 'Wage',
    'payments.advance': 'Advance',
    'payments.bonus': 'Bonus',
    'payments.deduction': 'Deduction',
    'payments.paid': 'Paid',
    'payments.unpaid': 'Unpaid',
    'payments.calculateWages': 'Calculate Wages',
    'payments.noPayments': 'No payments found',
    
    // Projects
    'projects.title': 'Projects',
    'projects.addProject': 'Add Project',
    'projects.name': 'Project Name',
    'projects.location': 'Location',
    'projects.status': 'Status',
    'projects.active': 'Active',
    'projects.inactive': 'Inactive',
    'projects.completed': 'Completed',
    
    // Reports
    'reports.title': 'Reports',
    'reports.summary': 'Summary',
    'reports.attendance': 'Attendance Report',
    'reports.payments': 'Payment Report',
    'reports.wages': 'Wage Report',
    'reports.export': 'Export',
    'reports.period': 'Period',
    
    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.security': 'Security',
    'settings.backup': 'Backup',
    'settings.darkMode': 'Dark Mode',
    'settings.language': 'Language',
    'settings.pin': 'PIN',
    'settings.biometric': 'Biometric',
    'settings.notifications': 'Notifications',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.currency': '₹',
    'common.optional': '(Optional)',
    'common.required': 'Required',
  },
  ta: {
    // App title
    'app.title': 'கோவை பில்டர்ஸ்',
    
    // Navigation
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.workers': 'தொழிலாளர்கள்',
    'nav.attendance': 'வருகை',
    'nav.payments': 'பணம் செலுத்துதல்',
    'nav.projects': 'திட்டங்கள்',
    'nav.reports': 'அறிக்கைகள்',
    'nav.settings': 'அமைப்புகள்',
    
    // Dashboard
    'dashboard.title': 'டாஷ்போர்டு',
    'dashboard.totalWorkers': 'மொத்த தொழிலாளர்கள்',
    'dashboard.activeWorkers': 'செயலில் உள்ள தொழிலாளர்கள்',
    'dashboard.todayAttendance': 'இன்றைய வருகை',
    'dashboard.pendingPayments': 'நிலுவையில் உள்ள பணம்',
    'dashboard.thisMonthWages': 'இந்த மாத ஊதியம்',
    
    // Workers
    'workers.title': 'தொழிலாளர்கள்',
    'workers.addWorker': 'தொழிலாளி சேர்க்க',
    'workers.editWorker': 'தொழிலாளியை திருத்த',
    'workers.name': 'பெயர்',
    'workers.labourType': 'தொழிலாளர் வகை',
    'workers.phone': 'தொலைபேசி எண்',
    'workers.aadhaar': 'ஆதார்/அடையாள எண்',
    'workers.dailyWage': 'நாளாந்த ஊதியம்',
    'workers.hourlyRate': 'மணிநேர விகிதம்',
    'workers.upiId': 'UPI அடையாளம்',
    'workers.project': 'திட்டம்',
    'workers.noWorkers': 'தொழிலாளர்கள் இல்லை',
    
    // Attendance
    'attendance.title': 'வருகை',
    'attendance.date': 'தேதி',
    'attendance.markAttendance': 'வருகை குறி',
    'attendance.full': 'முழு நாள்',
    'attendance.half': 'அரை நாள்',
    'attendance.absent': 'இல்லை',
    'attendance.present': 'இருக்கிறார்',
    'attendance.noAttendance': 'வருகை பதிவுகள் இல்லை',
    
    // Payments
    'payments.title': 'பணம் செலுத்துதல்',
    'payments.addPayment': 'பணம் சேர்க்க',
    'payments.amount': 'தொகை',
    'payments.type': 'வகை',
    'payments.wage': 'ஊதியம்',
    'payments.advance': 'முன்பணம்',
    'payments.bonus': 'போனஸ்',
    'payments.deduction': 'கழித்தல்',
    'payments.paid': 'செலுத்தப்பட்டது',
    'payments.unpaid': 'செலுத்தப்படவில்லை',
    'payments.calculateWages': 'ஊதியம் கணக்கிடு',
    'payments.noPayments': 'பணம் செலுத்துதல் இல்லை',
    
    // Projects
    'projects.title': 'திட்டங்கள்',
    'projects.addProject': 'திட்டம் சேர்க்க',
    'projects.name': 'திட்ட பெயர்',
    'projects.location': 'இடம்',
    'projects.status': 'நிலை',
    'projects.active': 'செயலில்',
    'projects.inactive': 'செயலில் இல்லை',
    'projects.completed': 'முடிந்தது',
    
    // Reports
    'reports.title': 'அறிக்கைகள்',
    'reports.summary': 'சுருக்கம்',
    'reports.attendance': 'வருகை அறிக்கை',
    'reports.payments': 'பணம் செலுத்துதல் அறிக்கை',
    'reports.wages': 'ஊதிய அறிக்கை',
    'reports.export': 'ஏற்றுமதி',
    'reports.period': 'காலம்',
    
    // Settings
    'settings.title': 'அமைப்புகள்',
    'settings.appearance': 'தோற்றம்',
    'settings.security': 'பாதுகாப்பு',
    'settings.backup': 'காப்பு',
    'settings.darkMode': 'இருண்ட பயன்முறை',
    'settings.language': 'மொழி',
    'settings.pin': 'பின்',
    'settings.biometric': 'உயிரியல் அளவுகோல்',
    'settings.notifications': 'அறிவிப்புகள்',
    
    // Common
    'common.save': 'சேமி',
    'common.cancel': 'ரத்து',
    'common.edit': 'திருத்து',
    'common.delete': 'நீக்கு',
    'common.add': 'சேர்',
    'common.back': 'பின்',
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    'common.currency': '₹',
    'common.optional': '(விருப்பமான)',
    'common.required': 'தேவையான',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ta')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
