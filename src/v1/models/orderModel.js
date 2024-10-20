"use strict";

const mongoose = require("mongoose");
const Users = require("./userModel");
const Products = require("./productModel");
const PaymentMethod = require("./paymentMethodModel");
const Vouchers = require("./voucherModel");
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
         province: {
            type: String,
            required: true,
         },
         district: {
            type: String,
            required: true,
         },
         ward: {
            type: String,
            required: true,
         },
         address: {
            type: String,
            required: true,
         },
      },
      paymentMethod: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: "PaymentMethod",
      },
      voucherId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Vouchers",
      },
      phone: {
         type: String,
         required: true,
      },
      email: {
         type: String,
         required: true,
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
      status: {
         type: String,
         enum: ["pending", "shipping", "completed", "cancelled"],
         default: "pending",
      },
   },
   {
      timestamps: true,
      collection: COLLECTION_NAME,
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);
