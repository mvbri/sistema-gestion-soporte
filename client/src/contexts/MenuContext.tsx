import { createContext, useState, ReactNode } from 'react';

interface MenuContextType {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MenuContext.Provider value={{ menuOpen, setMenuOpen }}>
      {children}
    </MenuContext.Provider>
  );
};
