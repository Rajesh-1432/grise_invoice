import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";

// Create the context
const PurchaseOrderContext = createContext();

// Custom hook to use the context
export const usePurchaseOrderData = () => {
  const context = useContext(PurchaseOrderContext);
  if (!context) {
    throw new Error(
      "usePurchaseOrderData must be used within a PurchaseOrderProvider"
    );
  }
  return context;
};

// Provider component
export const PurchaseOrderProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Function to fetch data
  const fetchPurchaseOrders = async (forceRefresh = false) => {
    // If data exists and it's not a forced refresh, don't fetch again
    if (data.length > 0 && !forceRefresh) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/auth/get-purchase-orders");
      setData(res.data.data);
      setLastFetchTime(new Date().toISOString());
    } catch (err) {
      setError("Failed to load purchase order data");
      console.error("Purchase Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data
  const refreshData = () => {
    return fetchPurchaseOrders(true);
  };

  // Function to clear data (useful for logout)
  const clearData = () => {
    setData([]);
    setError("");
    setLastFetchTime(null);
    setLoading(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  // Context value
  const value = {
    data,
    loading,
    error,
    lastFetchTime,
    refreshData,
    clearData,
    fetchPurchaseOrders,
  };

  return (
    <PurchaseOrderContext.Provider value={value}>
      {children}
    </PurchaseOrderContext.Provider>
  );
};

export default PurchaseOrderContext;
