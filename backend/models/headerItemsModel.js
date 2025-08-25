const { model, Schema } = require("mongoose");

const headerItemSchema = new Schema({
    poNumber: { type: String, required: true },
    poDate: { type: String, required: true }, 
    vendor: { type: String, required: true },
    invoiceDate: { type: String, required: true },
    invoiceNo: { type: String, required: true },
    payment: { type: String, required: true },
    delivery: { type: String },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    excise: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    lateCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }
}, {
    timestamps: true
});
module.exports = model("HeaderItem", headerItemSchema, "header_items");
