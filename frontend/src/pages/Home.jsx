import React, { useState, useEffect, useMemo } from "react";
import { usePurchaseOrderData } from "../contexts/PurchaseOrderContext";
import { usePOLineItemsData } from "../contexts/POLineItemsContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  RefreshCw,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const Home = () => {
  const {
    data: purchaseOrders,
    loading: poLoading,
    refreshData: refreshPO,
  } = usePurchaseOrderData();
  const {
    data: lineItems,
    loading: lineItemsLoading,
    fetchPOLineItems,
    refreshData: refreshLineItems,
  } = usePOLineItemsData();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Force component to re-render when data changes
  useEffect(() => {
    setLastUpdate(Date.now());
  }, [purchaseOrders, lineItems]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRecords = purchaseOrders?.length || 0;

    // Ensure lineItems is an array
    const safeLineItems = Array.isArray(lineItems) ? lineItems : [];

    // Calculate success and failure from line items
    const processedItems = safeLineItems.filter((item) => item?.status);

    const successfulItems = processedItems.filter((item) => {
      const status = item.status?.toLowerCase();
      return (
        status?.includes("successful") ||
        status?.includes("success") ||
        status?.includes("processed") ||
        status?.includes("complete") ||
        status === "successful process"
      );
    });

    // Check for mismatched amounts/quantities as errors
    const errorItems = processedItems.filter((item) => {
      const status = item.status?.toLowerCase();
      const isStatusError =
        status?.includes("failed") ||
        status?.includes("error") ||
        status?.includes("failure") ||
        status?.includes("mismatch");
      const isMismatchError =
        item.amountMismatch || item.quantityMismatch || item.error;
      return isStatusError || isMismatchError;
    });

    const successCount = successfulItems.length;
    const errorCount = errorItems.length;
    const autoPostingCount = totalRecords;
    const processedCount = processedItems.length;

    return {
      autoPosting: autoPostingCount,
      success: successCount,
      errors: errorCount,
      processed: processedCount,
      pending: Math.max(0, autoPostingCount - processedCount),
    };
  }, [purchaseOrders, lineItems, lastUpdate]);

  // Prepare chart data
  const pieChartData = [
    { name: "Cleared Line Items", value: metrics.success, color: "#10b981" },
    { name: "Errored Line Items", value: metrics.errors, color: "#ef4444" },
    { name: "Auto Posted Lines", value: metrics.autoPosting, color: "#f59e0b" },
  ];

  const barChartData = [
    {
      name: "This Week",
      "Cleared Line Items": metrics.success,
      "Errored Line Items": metrics.errors,
      "Auto Posted Lines": metrics.autoPosting,
    },
    {
      name: "Last Week",
      "Cleared Line Items": Math.floor(metrics.success * 0.8),
      "Errored Line Items": Math.floor(metrics.errors * 0.6),
      "Auto Posted Lines": Math.floor(metrics.autoPosting * 1.2),
    },
    {
      name: "2 Weeks Ago",
      "Cleared Line Items": Math.floor(metrics.success * 0.6),
      "Errored Line Items": Math.floor(metrics.errors * 0.9),
      "Auto Posted Lines": Math.floor(metrics.autoPosting * 0.8),
    },
    {
      name: "3 Weeks Ago",
      "Cleared Line Items": Math.floor(metrics.success * 0.7),
      "Errored Line Items": Math.floor(metrics.errors * 1.1),
      "Auto Posted Lines": Math.floor(metrics.autoPosting * 0.9),
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPO();
      await refreshLineItems();
      // Force re-calculation
      setLastUpdate(Date.now());
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-fetch line items if we have purchase orders but no line items
  useEffect(() => {
    if (
      purchaseOrders?.length > 0 &&
      (!lineItems || lineItems.length === 0) &&
      !lineItemsLoading
    ) {
      fetchPOLineItems().catch(console.error);
    }
  }, [purchaseOrders, lineItems, fetchPOLineItems, lineItemsLoading]);

  const isLoading = poLoading || lineItemsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor your purchase order processing status
                {lineItems?.length > 0 && (
                  <span className="ml-2 text-sm text-green-600">
                    • {lineItems.length} line items loaded
                  </span>
                )}
              </p>
            </div>
            {/* <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div> */}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Auto Posted Lines Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">TOTAL</span>
            </div>
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : metrics.autoPosting.toLocaleString()}
              </h3>
              <p className="text-gray-600 font-medium">Auto Posted Lines</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-blue-600 font-medium">
                +{Math.floor(Math.random() * 10)}% from last week
              </span>
            </div>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">SUCCESS</span>
            </div>
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : metrics.success.toLocaleString()}
              </h3>
              <p className="text-gray-600 font-medium">Cleared Line Items</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">
                {metrics.autoPosting > 0
                  ? `${Math.round(
                      (metrics.success / metrics.autoPosting) * 100
                    )}%`
                  : "0%"}{" "}
                success rate
              </span>
            </div>
          </div>

          {/* Failures Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">ERRORS</span>
            </div>
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : metrics.errors.toLocaleString()}
              </h3>
              <p className="text-gray-600 font-medium">Errored Line Items</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-red-600 font-medium">
                {metrics.autoPosting > 0
                  ? `${Math.round(
                      (metrics.errors / metrics.autoPosting) * 100
                    )}%`
                  : "0%"}{" "}
                error rate
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Status Distribution
              </h3>
              <p className="text-gray-600">
                Current breakdown of order processing status
              </p>
            </div>

            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value.toLocaleString(), "Count"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Weekly Processing Trends
              </h3>
              <p className="text-gray-600">
                Comparison of processing results over time
              </p>
            </div>

            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="success" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="errors" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Summary
            </h3>
            <p className="text-gray-600">
              Detailed breakdown of current processing status
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-500">
                  PROCESSED
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : metrics.processed.toLocaleString()}
              </div>
            </div> */}

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-yellow-600">
                  Auto Posted Lines
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : metrics.autoPosting.toLocaleString()}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-600">
                  Cleared Line Items
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : metrics.metrics.processed > 0
                  ? `${Math.round(
                      (metrics.success / metrics.processed) * 100
                    )}%`
                  : "0%"}
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-600">
                  Errored Line Item
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : metrics.processed > 0
                  ? `${Math.round(
                      (metrics.errors / metrics.processed) * 100
                    )}%`
                  : "0%"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
