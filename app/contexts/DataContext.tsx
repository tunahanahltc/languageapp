import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import HybridDatabaseService from '../services/HybridDatabaseService';
import { WordSet, Category } from '../types';
import { useAuth } from './AuthContext';

interface CategoriesGrouped {
  [key: string]: Category[];
}

interface DataContextType {
  wordSets: WordSet[];
  allCategories: CategoriesGrouped;
  loading: boolean;
  initialized: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [wordSets, setWordSets] = useState<WordSet[]>([]);
  const [allCategories, setAllCategories] = useState<CategoriesGrouped>({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { user, loading: authLoading, databaseReady, syncCounter } = useAuth();

  useEffect(() => {
    const initializeData = async () => {
      // Auth yüklenirken veya kullanıcı yokken de local veriyi bir kez dene 
      // (anonim kullanım veya önbellek için) ama asıl yükleme auth sonrası olmalı
      if (authLoading) return;

      try {
        setLoading(true);
        console.log('🔄 DataContext: Veriler yükleniyor...');

        // Word sets'i yükle
        const sets = await HybridDatabaseService.getWordSets();
        console.log(`📥 DataContext: ${sets?.length || 0} set yüklendi`);
        setWordSets(sets || []);

        // Kategorileri çek ve set_id'ye göre grupla
        const categoriesArray = await HybridDatabaseService.getCategories();
        const grouped = Array.isArray(categoriesArray)
          ? categoriesArray.reduce<CategoriesGrouped>((acc, cat) => {
            const key = cat.set_id?.toString();
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
  }, [user, authLoading, databaseReady, syncCounter]);

  const refreshData = async () => {
    try {
      setLoading(true);

      const sets = await HybridDatabaseService.getWordSets();
      setWordSets(sets || []);

      const categoriesArray = await HybridDatabaseService.getCategories();
      const grouped = Array.isArray(categoriesArray)
        ? categoriesArray.reduce<CategoriesGrouped>((acc, cat) => {
          const key = cat.set_id?.toString();
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

  const value: DataContextType = {
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
