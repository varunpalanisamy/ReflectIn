// frontend/app/contexts/UserPrefsContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface Prefs {
  persona?: string;
  band1?: string;
  band2?: string;
  band3?: string;
  band4?: string;
  band5?: string;
}

const UserPrefsContext = createContext<{
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
}>({ prefs: {}, setPrefs: () => {} });

export const UserPrefsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<Prefs>({});
  return (
    <UserPrefsContext.Provider value={{ prefs, setPrefs }}>
      {children}
    </UserPrefsContext.Provider>
  );
};

export const useUserPrefs = () => useContext(UserPrefsContext);
