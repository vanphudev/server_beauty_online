"use strict";
const mongoose = require("mongoose");
const COLLECTION_NAME = "vouchers";
const DOCUMENT_NAME = "Vouchers";

const voucherSchema = new mongoose.Schema(
   {
      userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users"},
      code: {type: String, required: true, trim: true, unique: true},
      discountValue: {type: Number, required: true},
      minOrderValue: {type: Number, required: true},
      startDate: {type: Date, required: true},
      endDate: {type: Date, required: true},
      usageLimit: {type: Number, required: true},
      usedCount: {type: Number, default: 0},
   },
   {
      timestamps: true,
      collection: COLLECTION_NAME,
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, voucherSchema);
