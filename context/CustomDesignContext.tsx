import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your state
interface CustomDesignState {
  designFor: string;
  setDesignFor: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
  items: string[];
  setItems: (items: string[]) => void;
  productContext: any;
  setProductContext: (context: any) => void;
  clearDraft: () => void;
}

const CustomDesignContext = createContext<CustomDesignState | undefined>(undefined);

export function CustomDesignProvider({ children }: { children: ReactNode }) {
  const [designFor, setDesignFor] = useState('');
  const [theme, setTheme] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [productContext, setProductContext] = useState<any>(null);

const clearDraft = () => {
    setDesignFor('');
    setTheme('');
    setItems([]);
    setProductContext(null); // <-- Add this line to wipe the product!
  };

  return (
    <CustomDesignContext.Provider
      value={{
        designFor,
        setDesignFor,
        theme,
        setTheme,
        items,
        setItems,
        productContext,
        setProductContext,
        clearDraft,
      }}>
      {children}
    </CustomDesignContext.Provider>
  );
}

// Custom hook to use the context easily
export function useCustomDesignStore() {
  const context = useContext(CustomDesignContext);
  if (!context) {
    throw new Error('useCustomDesignStore must be used within a CustomDesignProvider');
  }
  return context;
}