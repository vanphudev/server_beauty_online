"use strict";

const mongoose = require("mongoose");
const COLLECTION_NAME = "orders";
const DOCUMENT_NAME = "Orders";

const orderSchema = new mongoose.Schema(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: "Users",
      },
      items: [
         {
            productId: {
               type: mongoose.Schema.Types.ObjectId,
               required: true,
               ref: "Products",
            },
            name: {
               type: String,
               required: true,
            },
            price: {
               type: Number,
               required: true,
            },
            quantity: {
               type: Number,
               required: true,
               min: 1,
            },
         },
      ],
      totalPrice: {
         type: Number,
         required: true,
      },
      shippingAddress: {
         tinh: {
            type: String,
            required: true,
         },
         quan: {
            type: String,
            required: true,
         },
         huyen: {
            type: String,
            required: true,
         },
         tenDuong: {
            type: String,
            required: true,
         },
      },
      paymentMethod: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: "PaymentMethods",
      },
      voucherId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Vouchers",
      },
      discountAmount: {
         type: Number,
         default: 0,
      },
      finalPrice: {
         type: Number,
         required: true,
      },
      note: {
         type: String,
         default: "",
      },
   },
   {
      timestamps: true,
      collection: COLLECTION_NAME,
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);
