import React, { createContext, useContext, useEffect, useState } from 'react';
import { DatabaseService } from '../services/DatabaseService';

interface DatabaseContextType {
  db: DatabaseService;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [db] = useState(() => DatabaseService.getInstance());

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await db.init();
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize database'));
        setIsLoading(false);
      }
    };

    initDatabase();
  }, [db]);

  if (isLoading) {
    return <div>Loading database...</div>;
  }

  if (error) {
    return <div>Error initializing database: {error.message}</div>;
  }

  return (
    <DatabaseContext.Provider value={{ db, isLoading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
