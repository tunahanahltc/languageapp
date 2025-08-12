import React, { createContext, useContext, useState, useEffect } from 'react';
import HybridDatabaseService from '../services/HybridDatabaseService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [wordSets, setWordSets] = useState([]);
  const [allCategories, setAllCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Word sets'i yükle
        const sets = await HybridDatabaseService.getWordSets();
        setWordSets(sets || []);

        // Kategorileri çek ve set_id'ye göre grupla
        const categoriesArray = await HybridDatabaseService.getCategories();
        const grouped = Array.isArray(categoriesArray)
          ? categoriesArray.reduce((acc, cat) => {
              const key = (cat.set_id ?? cat.setId ?? cat.set)?.toString();
              if (!key) return acc;
              if (!acc[key]) acc[key] = [];
              acc[key].push(cat);
              return acc;
            }, {})
          : {};
        setAllCategories(grouped);

        setInitialized(true);
      } catch (error) {
        console.error('DataContext: Veri yükleme hatası:', error);
        setWordSets([]);
        setAllCategories({});
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      
      const sets = await HybridDatabaseService.getWordSets();
      setWordSets(sets || []);

      const categoriesArray = await HybridDatabaseService.getCategories();
      const grouped = Array.isArray(categoriesArray)
        ? categoriesArray.reduce((acc, cat) => {
            const key = (cat.set_id ?? cat.setId ?? cat.set)?.toString();
            if (!key) return acc;
            if (!acc[key]) acc[key] = [];
            acc[key].push(cat);
            return acc;
          }, {})
        : {};
      setAllCategories(grouped);
    } catch (error) {
      console.error('DataContext: Veri yenileme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    wordSets,
    allCategories,
    loading,
    initialized,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
