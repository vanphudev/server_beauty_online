const mongoose = require("mongoose");

const Categories = require("./categorieModel");
const Brands = require("./brandModel");

const COLLECTION_NAME = "products";
const DOCUMENT_NAME = "Products";

const ratingSchema = new mongoose.Schema({
   userId: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
   rating: {type: Number, required: true},
   review: {type: String, required: false},
   date: {type: Date, default: Date.now},
});

const attributeSchema = new mongoose.Schema({
   key: {type: String, required: false},
   value: {type: String, required: false},
});

const productSchema = new mongoose.Schema(
   {
      name: {type: String, required: true, trim: true},
      description: {type: String, required: true},
      price: {type: Number, required: true},
      images: {type: [String], required: true},
      categoryId: {type: mongoose.Schema.Types.ObjectId, ref: "Categories", required: true},
      brandId: {type: mongoose.Schema.Types.ObjectId, ref: "Brands", required: true},
      inventory: {type: Number, default: 0},
      discount: {type: Number, default: 0, required: false, min: 0, max: 100},
      ratings: [ratingSchema],
      attributes: [attributeSchema],
      productUrl: {type: String, required: true},
   },
   {
      timestamps: true,
      collection: COLLECTION_NAME,
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, productSchema);
