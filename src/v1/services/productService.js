"use strict";
const Products = require("../models/productModel");
const Categories = require("../models/categorieModel");

const {BadRequestError, NotFoundError} = require("../core/errorRespones");

const getAllProducts = async () => {
   const products = await Products.find()
      .populate("categoryId")
      .populate({
         path: "ratings.userId",
         model: "Users",
      })
      .populate("brandId")
      .lean();
   return {
      products,
      totalProducts: products.length,
   };
};

const getProductById = async (id) => {
   const product = await Products.findOne({productUrl: id})
      .populate("categoryId")
      .populate({
         path: "ratings.userId",
         model: "Users",
      })
      .populate("brandId")
      .lean();
   return {
      product,
      totalProducts: product.length,
   };
};

const sortPriceAsc = async () => {
   const products = await Products.find().sort({price: 1}).populate("categoryId").populate("brandId").lean();
   return {
      products,
      totalProducts: products.length,
   };
};

const sortPriceDesc = async () => {
   const products = await Products.find().sort({price: -1}).populate("categoryId").populate("brandId").lean();
   return {
      products,
      totalProducts: products.length,
   };
};

const sortPriceRange = async (min, max) => {
   const products = await Products.find({price: {$gte: min, $lte: max}})
      .populate("categoryId")
      .populate("brandId")
      .lean();
   return {
      products,
      totalProducts: products.length,
   };
};

const filterCategory = async (categoryId) => {
   if (!categoryId) {
      throw new BadRequestError("Category id is required");
   }
   const category = await Categories.findOne({url: categoryId}).lean();
   if (!category) {
      throw new NotFoundError("Category not found");
   }
   const products = await Products.find({categoryId: category._id}).populate("categoryId").populate("brandId").lean();
   return {
      products,
      totalProducts: products.length,
   };
};

const getProductsPagination = async (page, limit) => {
   const products = await Products.find()
      .populate("categoryId")
      .populate("brandId")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
   return {
      products,
      totalProducts: products.length,
   };
};

const getSearchAll = async (searchTerm) => {
   if (!searchTerm) {
      throw new BadRequestError("Search term is required");
   }
   const query = searchTerm ? {name: {$regex: searchTerm, $options: "i"}} : {};
   const products = await Products.find(query)
      .populate("categoryId")
      .populate({path: "ratings.userId", model: "Users"})
      .populate("brandId")
      .lean();
   return {
      products,
      totalProducts: products.length,
   };
};
const getProductTab = async (valueTab) => {
   let products;

   if (valueTab === "new") {
      products = await Products.find({inventory: {$gt: 0}}) // Kiểm tra inventory > 0
         .sort({createdAt: -1})
         .limit(4)
         .populate("categoryId")
         .populate("brandId")
         .lean();
      return {
         products,
         totalProducts: products.length,
      };
   }

   if (valueTab === "topSellers") {
      products = await Products.find({discount: {$gt: 0}, inventory: {$gt: 0}}) // Kiểm tra inventory > 0 và discount > 0
         .sort({discount: -1})
         .limit(4)
         .populate("categoryId")
         .populate("brandId")
         .lean();
      return {
         products,
         totalProducts: products.length,
      };
   }

   // Trường hợp không có tab phù hợp
   return {
      products: null,
      totalProducts: 0,
   };
};

module.exports = {
   getAllProducts,
   getProductById,
   sortPriceAsc,
   sortPriceDesc,
   sortPriceRange,
   filterCategory,
   getProductsPagination,
   getSearchAll,
   getProductTab,
};
