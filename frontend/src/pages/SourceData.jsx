import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { usePurchaseOrderData } from "../contexts/PurchaseOrderContext.jsx";

const SourceData = () => {
  const { data, loading, error, refreshData } = usePurchaseOrderData();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ✅ Filter states
  const [purchaseOrderFilter, setPurchaseOrderFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");

  // ✅ Apply Filters
  const filteredData = data.filter((item) => {
    const matchesPurchaseOrder = purchaseOrderFilter
      ? String(item.PurchaseOrder)
          .toLowerCase()
          .includes(purchaseOrderFilter.toLowerCase())
      : true;

    const matchesMaterial = materialFilter
      ? String(item.MaterialNumber)
          .toLowerCase()
          .includes(materialFilter.toLowerCase())
      : true;

    return matchesPurchaseOrder && matchesMaterial;
  });

  // Pagination calculations on filtered data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    await refreshData();
    setCurrentPage(1);
    setPurchaseOrderFilter("");
    setMaterialFilter("");
  };

  // Reset page when filters change
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-lg">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center flex-col space-y-4">
        <p className="text-lg text-red-600">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center flex-col space-y-4">
        <p className="text-lg text-gray-500">No data available</p>
        <Button onClick={handleRefresh} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="h-full flex flex-col p-6">
      {/* ✅ Filter Inputs */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Filter by Purchase Order"
          value={purchaseOrderFilter}
          onChange={handleFilterChange(setPurchaseOrderFilter)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
        />
        <input
          type="text"
          placeholder="Filter by Material Number"
          value={materialFilter}
          onChange={handleFilterChange(setMaterialFilter)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
        />
        <Button onClick={handleRefresh} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  {column.charAt(0).toUpperCase() +
                    column.slice(1).replace(/([A-Z])/g, " $1")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item, index) => (
              <tr
                key={startIndex + index}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((column) => {
                  let displayValue;

                  if (column === "UnitPrice") {
                    const amount = parseFloat(item.Amount) || 0;
                    const quantity = parseFloat(item.Quantity) || 1;
                    const unitPrice =
                      quantity !== 0 ? (amount / quantity).toFixed(2) : "0.00";
                    displayValue = unitPrice;
                  } else {
                    displayValue =
                      item[column] !== null && item[column] !== undefined
                        ? String(item[column])
                        : "-";
                  }

                  return (
                    <td
                      key={column}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      <div className="max-w-xs truncate" title={displayValue}>
                        {displayValue}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Rows per page:</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="w-8 h-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="w-8 h-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceData;