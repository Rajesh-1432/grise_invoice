import React, { useState } from "react";
import { usePurchaseOrderData } from "../contexts/PurchaseOrderContext.jsx";
import { usePOLineItemsData } from "../contexts/POLineItemsContext.jsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RotateCcw,
  Download,
} from "lucide-react";

const POLineItems = () => {
  const { data: purchaseOrderData } = usePurchaseOrderData();
  const {
    data: poLineData,
    loading,
    isProcessed,
    lastProcessTime,
    handlePreProcessComplete,
    updatePOLineItem,
    refreshData,
  } = usePOLineItemsData();

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("errors");
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Separate data into success and error categories
  const successData = poLineData.filter(
    (item) => item.status === "Successful Process"
  );
  const errorData = poLineData.filter(
    (item) => item.status !== "Successful Process"
  );

  // Get current tab data
  const currentTabData = activeTab === "errors" ? errorData : successData;

  // Pagination calculations
  const totalPages = Math.ceil(currentTabData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = currentTabData.slice(startIndex, endIndex);

  // Get column headers dynamically from data
  const getColumns = () => {
    if (poLineData.length === 0) return [];
    const baseColumns = Object.keys(poLineData[0]).filter(
      (key) => key !== "_id"
    );
    return [
      ...baseColumns,
      "download",
      ...(activeTab === "errors" ? ["actions"] : []),
    ];
  };

  // Format column header
  const formatColumnHeader = (column) => {
    if (column === "actions") return "Actions";
    if (column === "download") return "Download";
    return (
      column.charAt(0).toUpperCase() +
      column.slice(1).replace(/([A-Z])/g, " $1")
    );
  };

  // Download handler
  const handleDownload = (item) => {
    try {
      // Create a blob URL for the PDF file
      const fileName = "3165378198.91b552d54a5373624e4b.pdf";

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = `/path/to/files/${fileName}`; // Update this path to your actual file location
      link.download = fileName;
      link.style.display = "none";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloading ${fileName}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("There was an error downloading the file.");
    }
  };

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

  // Reset pagination when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setEditingRow(null);
  };

  // File upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  // Pre-process handler
  const handlePreProcess = async () => {
    if (!selectedFile) {
      toast.error("Please upload a PDF file first");
      return;
    }

    setProcessing(true);

    try {
      // Simulate PDF upload and processing
      const formData = new FormData();
      formData.append("pdf", selectedFile);

      // Upload PDF (you'll need to implement this endpoint)
      // await api.post("/api/auth/upload-pdf", formData);

      // Show loading for 30-40 seconds as requested
      await new Promise((resolve) => setTimeout(resolve, 35000));

      // Handle pre-processing completion through context
      await handlePreProcessComplete();

      toast.success("Pre-processing completed successfully");

      // Close modal and reset state
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error("Pre-processing failed. Please try again.");
      console.error("Pre-processing error:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    try {
      await refreshData();
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };

  // Determine which fields can be edited based on status
  const getEditableFields = (status) => {
    const fields = { quantity: false, amount: false, comment: true };

    if (
      status.toLowerCase().includes("amount mismatch") &&
      status.toLowerCase().includes("quantity")
    ) {
      fields.quantity = true;
      fields.amount = true;
    } else if (status.toLowerCase().includes("amount mismatch")) {
      fields.amount = true;
    } else if (status.toLowerCase().includes("quantity")) {
      fields.quantity = true;
    }

    return fields;
  };

  // Edit handlers
  const handleEdit = (item) => {
    setEditingRow(item._id);
    setEditData({
      quantity: item.quantity,
      amount: item.amount,
      comment: item.comment || "",
    });
  };

  const handleSave = async (item) => {
    try {
      // Validate against purchase order data
      const matchingPO = purchaseOrderData.find(
        (po) =>
          po.PurchaseOrder === item.purchaseOrder &&
          po.MaterialNumber === item.materialNumber
      );

      if (!matchingPO) {
        toast.error("No matching purchase order found for validation");
        return;
      }

      // Calculate expected values from source data
      const expectedAmount = parseFloat(matchingPO.Amount) || 0;
      const expectedQuantity = parseFloat(matchingPO.Quantity) || 0;

      // Validate the edited values
      const editedAmount = parseFloat(editData.amount);
      const editedQuantity = parseFloat(editData.quantity);

      const editableFields = getEditableFields(item.status);

      if (
        editableFields.amount &&
        Math.abs(editedAmount - expectedAmount) > 0.01
      ) {
        toast.error("Amount doesn't match with purchase order data.");
        return;
      }

      if (
        editableFields.quantity &&
        Math.abs(editedQuantity - expectedQuantity) > 0.01
      ) {
        toast.error("Quantity doesn't match with purchase order data.");
        return;
      }

      // Prepare update data
      const updatedItem = {
        quantity: editedQuantity,
        amount: editedAmount,
        comment: editData.comment,
        status: "Successful Process", // Update status since values are now correct
      };

      // Update through context
      await updatePOLineItem(item._id, updatedItem);

      setEditingRow(null);
      setEditData({});
      toast.success("Item updated successfully");
    } catch (error) {
      toast.error("Failed to update item");
      console.error("Update error:", error);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  // Render cell content
  const renderCellContent = (item, column) => {
    if (column === "download") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDownload(item)}
          className="w-8 h-8 p-0"
          title="Download PDF"
        >
          <Download className="w-4 h-4" />
        </Button>
      );
    }

    if (column === "actions") {
      return (
        <div className="flex space-x-2">
          {editingRow === item._id ? (
            <>
              <Button size="sm" onClick={() => handleSave(item)}>
                <Save className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(item)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      );
    }

    if (editingRow === item._id) {
      const editableFields = getEditableFields(item.status);

      if (column === "quantity" && editableFields.quantity) {
        return (
          <Input
            type="number"
            value={editData.quantity}
            onChange={(e) =>
              setEditData({ ...editData, quantity: e.target.value })
            }
            className="w-20"
          />
        );
      }

      if (column === "amount" && editableFields.amount) {
        return (
          <Input
            type="number"
            step="0.01"
            value={editData.amount}
            onChange={(e) =>
              setEditData({ ...editData, amount: e.target.value })
            }
            className="w-24"
          />
        );
      }

      if (column === "comment") {
        return (
          <Textarea
            value={editData.comment}
            onChange={(e) =>
              setEditData({ ...editData, comment: e.target.value })
            }
            className="w-full h-20"
            placeholder="Add comment..."
          />
        );
      }
    }

    // Handle status column with styling
    if (column === "status") {
      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            item[column] === "Successful Process"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item[column]}
        </span>
      );
    }

    // Regular cell content
    const value = item[column];
    return (
      <div className="max-w-xs truncate" title={value?.toString()}>
        {value !== null && value !== undefined ? String(value) : "-"}
      </div>
    );
  };

  // Show no data state only if not processed yet
  if (!isProcessed && poLineData.length === 0) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">PO Line Items</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload and process a PDF file to view PO line items
            </p>
          </div>

          {/* Pre-process Button */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Pre-process
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload PDF for Pre-processing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload PDF file</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Choose File
                  </label>
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handlePreProcess}
                  disabled={!selectedFile || processing}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing... (This may take 30-40 seconds)
                    </>
                  ) : (
                    "Start Pre-processing"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No PO Line Items
            </h3>
            <p className="text-gray-500">
              Upload a PDF file to start pre-processing and view data
            </p>
          </div>
        </div>
      </div>
    );
  }

  const columns = getColumns();

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PO Line Items</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {poLineData.length} items | Errors: {errorData.length} |
            Success: {successData.length}
            {lastProcessTime && (
              <span className="ml-2 text-gray-400">
                • Last processed: {new Date(lastProcessTime).toLocaleString()}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>

          {/* Pre-process Button */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Re-process
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload PDF for Pre-processing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload PDF file</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload-main"
                  />
                  <label
                    htmlFor="pdf-upload-main"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Choose File
                  </label>
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handlePreProcess}
                  disabled={!selectedFile || processing}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing... (This may take 30-40 seconds)
                    </>
                  ) : (
                    "Start Pre-processing"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("errors")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "errors"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Errors ({errorData.length})
          </button>
          <button
            onClick={() => handleTabChange("success")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "success"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Success ({successData.length})
          </button>
        </nav>
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
                  {formatColumnHeader(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {renderCellContent(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
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
              Page {currentPage} of {totalPages} | Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, currentTabData.length)} of{" "}
              {currentTabData.length} entries
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
      )}
    </div>
  );
};

export default POLineItems;
