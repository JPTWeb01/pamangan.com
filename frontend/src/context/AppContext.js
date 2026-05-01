import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [selectedRecipes, setSelectedRecipes] = useState([]);

  const toggleSelected = useCallback((recipe) => {
    setSelectedRecipes((prev) => {
      const exists = prev.find((r) => r.id === recipe.id);
      return exists
        ? prev.filter((r) => r.id !== recipe.id)
        : [...prev, recipe];
    });
  }, []);

  const clearSelected = useCallback(() => setSelectedRecipes([]), []);

  const isSelected = useCallback(
    (id) => selectedRecipes.some((r) => r.id === id),
    [selectedRecipes]
  );

  return (
    <AppContext.Provider
      value={{ selectedRecipes, toggleSelected, clearSelected, isSelected }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
