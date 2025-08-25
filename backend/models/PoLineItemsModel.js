const { model, Schema } = require("mongoose");

const poLineItemSchema = new Schema({
  purchaseOrder: { type: String, required: true },
  purchaseOrderItem: { type: String, required: true },
  taxCode: { type: String, required: true },
  quantity: { type: Number, required: true },
  uom: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  amount: { type: Number, required: true },
  materialNumber: { type: String, required: true },
  status: { type: String, required: true },
  comment: { type: String, default: "" }, 
});
module.exports = model("polineitems", poLineItemSchema);
