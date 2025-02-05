import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

const translations: Translations = {
  welcome: {
    en: 'Welcome',
    es: 'Bienvenido'
  },
  loginSubtitle: {
    en: 'Sign in to manage your time and payroll',
    es: 'Inicie sesión para gestionar su tiempo y nómina'
  },
  signInAsEmployee: {
    en: 'Sign In as Employee',
    es: 'Iniciar sesión como Empleado'
  },
  signInAsAdmin: {
    en: 'Sign In as Admin',
    es: 'Iniciar sesión como Administrador'
  },
  signOut: {
    en: 'Sign Out',
    es: 'Cerrar Sesión'
  },
  timeTracker: {
    en: 'Time Tracker',
    es: 'Control de Tiempo'
  },
  startWorking: {
    en: 'Start Working',
    es: 'Comenzar a Trabajar'
  },
  stopWorking: {
    en: 'Stop Working',
    es: 'Dejar de Trabajar'
  },
  startedAt: {
    en: 'Started at',
    es: 'Comenzó a las'
  },
  totalEmployees: {
    en: 'Total Employees',
    es: 'Total de Empleados'
  },
  totalHoursWorked: {
    en: 'Total Hours Worked',
    es: 'Total Horas Trabajadas'
  },
  activeTimeEntries: {
    en: 'Active Time Entries',
    es: 'Entradas Activas'
  },
  totalPayroll: {
    en: 'Total Payroll',
    es: 'Nómina Total'
  },
  dailyPayroll: {
    en: 'Daily Payroll',
    es: 'Nómina Diaria'
  },
  employeeWorkDays: {
    en: 'Employee Work Days',
    es: 'Días Trabajados por Empleado'
  },
  selectEmployee: {
    en: 'Select an employee',
    es: 'Seleccione un empleado'
  },
  hours: {
    en: 'hours',
    es: 'horas'
  },
  calculatePayroll: {
    en: 'Calculate Payroll',
    es: 'Calcular Nómina'
  },
  workSchedule: {
    en: 'Work Schedule',
    es: 'Horario de Trabajo'
  },
  startTime: {
    en: 'Start Time',
    es: 'Hora de Inicio'
  },
  endTime: {
    en: 'End Time',
    es: 'Hora de Fin'
  },
  payRates: {
    en: 'Pay Rates',
    es: 'Tarifas de Pago'
  },
  regularRate: {
    en: 'Regular Rate ($/h)',
    es: 'Tarifa Regular ($/h)'
  },
  overtimeRate: {
    en: 'Overtime Rate ($/h)',
    es: 'Tarifa de Horas Extra ($/h)'
  },
  timeEntriesTimeline: {
    en: 'Time Entries Timeline',
    es: 'Línea de Tiempo de Entradas'
  },
  showingEntriesFor: {
    en: 'Showing entries for',
    es: 'Mostrando entradas para'
  },
  noEmployeesWorked: {
    en: 'No employees worked on this date',
    es: 'Ningún empleado trabajó en esta fecha'
  },
  monthlyPayroll: {
    en: 'Monthly Payroll',
    es: 'Nómina Mensual'
  }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
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