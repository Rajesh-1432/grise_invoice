const axios = require("axios");
const PoLineItemsModel = require("../models/PoLineItemsModel");
const headeItemsModel = require("../models/headerItemsModel");
class DataConroll {
  get_headerItems = async (req, res) => {
    try {
      const headerItems = await headeItemsModel.find();

      if (!headerItems || headerItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No header items found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Header items fetched successfully",
        data: headerItems,
      });
    } catch (error) {
      console.error("Error fetching header items:", error);

      res.status(500).json({
        success: false,
        message: "Error fetching header items",
        error: error.message,
      });
    }
  };

  //  New Function: Fetch SAP Purchase Orders
  get_purchaseOrders = async (req, res) => {
    try {
      // 1. Get OAuth Token
      const tokenResponse = await axios.post(
        process.env.SAP_TOKEN_URL,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.SAP_CLIENT_ID,
          client_secret: process.env.SAP_CLIENT_SECRET,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const token = tokenResponse.data.access_token;

      // 2. Call SAP OData API
      const sapResponse = await axios.get(process.env.SAP_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      res.status(200).json({
        success: true,
        message: "Purchase orders fetched successfully",
        data: sapResponse.data.value || sapResponse.data,
      });
    } catch (error) {
      console.error("Error fetching purchase orders:", error);

      res.status(500).json({
        success: false,
        message: "Error fetching purchase orders",
        error: error.message,
      });
    }
  };

  get_polineItems = async (req, res) => {
    try {
      const polineItems = await PoLineItemsModel.find();
      if (!polineItems || polineItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No header items found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Po Line items fetched successfully",
        data: polineItems,
      });
    } catch (error) {
      console.error("Error fetching header items:", error);

      res.status(500).json({
        success: false,
        message: "Error fetching header items",
        error: error.message,
      });
    }
  };
  // Add this method to your DataConroll class
  update_poLineItem = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate required fields
      if (!updateData.quantity || !updateData.amount) {
        return res.status(400).json({
          success: false,
          message: "Quantity and amount are required",
        });
      }

      // Find and update the item
      const updatedItem = await PoLineItemsModel.findByIdAndUpdate(
        id,
        {
          quantity: updateData.quantity,
          amount: updateData.amount,
          comment: updateData.comment,
          status: updateData.status,
          unitPrice: updateData.amount / updateData.quantity, // Calculate unit price
        },
        { new: true, runValidators: true }
      );

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: "PO Line Item not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "PO Line Item updated successfully",
        data: updatedItem,
      });
    } catch (error) {
      console.error("Error updating PO line item:", error);
      res.status(500).json({
        success: false,
        message: "Error updating PO line item",
        error: error.message,
      });
    }
  };
}

module.exports = new DataConroll();
