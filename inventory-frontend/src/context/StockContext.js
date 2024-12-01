import React, { createContext, useState, useEffect } from 'react';
import { fetchStockItems } from '../api';

export const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    const loadStockItems = async () => {
      try {
        const response = await fetchStockItems();
        setStockItems(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadStockItems();
  }, []);

  return (
    <StockContext.Provider value={{ stockItems, setStockItems }}>
      {children}
    </StockContext.Provider>
  );
};
