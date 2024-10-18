"use strict";

const mongoose = require("mongoose");
const COLLECTION_NAME = "carts";
const DOCUMENT_NAME = "Carts";

const cartSchema = new mongoose.Schema(
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
            quantity: {
               type: Number,
               required: true,
               min: 1, 
            },
         },
      ],
   },
   {
      timestamps: true, 
      collection: COLLECTION_NAME, 
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, cartSchema);
