"use strict";

const mongoose = require("mongoose");

const COLLECTION_NAME = "categories";
const DOCUMENT_NAME = "Categories";

const categorySchema = new mongoose.Schema(
   {
      name: {type: String, required: true, trim: true},
      description: {type: String, required: false},
      images: {type: [String], required: false},
      status: {type: Boolean, default: true},
      url: {type: String, required: true, trim: true}, 
   },
   {
      timestamps: true,
      collection: COLLECTION_NAME,
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, categorySchema);
