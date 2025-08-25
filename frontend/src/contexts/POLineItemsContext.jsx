import React, { createContext, useContext, useState } from "react";
import api from "@/utils/api";

// Create the context
const POLineItemsContext = createContext();

// Custom hook to use the context
export const usePOLineItemsData = () => {
  const context = useContext(POLineItemsContext);
  if (!context) {
    throw new Error(
      "usePOLineItemsData must be used within a POLineItemsProvider"
    );
  }
  return context;
};

// Provider component
export const POLineItemsProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastProcessTime, setLastProcessTime] = useState(null);
  const [isProcessed, setIsProcessed] = useState(false);

  // Function to fetch PO Line Items data
  const fetchPOLineItems = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/auth/getall-polineitems");
      setData(res.data.data || []);

      return res.data.data || [];
    } catch (err) {
      const errorMessage = "Failed to load PO line items data";
      setError(errorMessage);
      console.error("PO Line Items fetch error:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle pre-processing completion
  const handlePreProcessComplete = async () => {
    try {
      const newData = await fetchPOLineItems();
      setLastProcessTime(new Date().toISOString());
      setIsProcessed(true);
      return newData;
    } catch (error) {
      throw error;
    }
  };

  // Function to update a single PO Line Item
  const updatePOLineItem = async (id, updateData) => {
    try {
      const res = await api.put(
        `/api/auth/update-poline-item/${id}`,
        updateData
      );

      // Update local state
      setData((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, ...updateData } : item
        )
      );

      return res.data.data;
    } catch (error) {
      console.error("Update PO Line Item error:", error);
      throw error;
    }
  };

  // Function to clear all data (useful for logout)
  const clearData = () => {
    setData([]);
    setError("");
    setLastProcessTime(null);
    setIsProcessed(false);
    setLoading(false);
  };

  // Function to refresh data (manual refresh)
  const refreshData = async () => {
    return await fetchPOLineItems();
  };

  // Function to reset processed state (for new sessions)
  const resetProcessedState = () => {
    setData([]);
    setIsProcessed(false);
    setLastProcessTime(null);
    setError("");
  };

  // Context value
  const value = {
    data,
    loading,
    error,
    lastProcessTime,
    isProcessed,
    fetchPOLineItems,
    handlePreProcessComplete,
    updatePOLineItem,
    clearData,
    refreshData,
    resetProcessedState,
  };

  return (
    <POLineItemsContext.Provider value={value}>
      {children}
    </POLineItemsContext.Provider>
  );
};

export default POLineItemsContext;
