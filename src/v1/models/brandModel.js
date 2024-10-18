"use strict";

const mongoose = require("mongoose");

const COLLECTION_NAME = "brands";
const DOCUMENT_NAME = "Brands";

const brandSchema = new mongoose.Schema(
   {
      name: {type: String, required: true, trim: true},
      description: {type: String, required: false},
      url: {type: String, required: true, trim: true},
      logoUrl: {type: String, required: false},
   },
   {
      timestamps: true,
      collection: COLLECTION_NAME,
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, brandSchema);
