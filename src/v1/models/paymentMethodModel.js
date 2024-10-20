"use strict";

const mongoose = require("mongoose");

const COLLECTION_NAME = "payment_methods";
const DOCUMENT_NAME = "PaymentMethod";

const paymentMethodSchema = new mongoose.Schema(
   {
      name: {type: String, required: true, trim: true},
      status: {
         type: String,
         enum: ["active", "inactive"],
         default: "active",
      },
      code: {type: String, required: true, trim: true, unique: true},
   },
   {
      timestamps: true,
      collection: COLLECTION_NAME,
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, paymentMethodSchema);
