"use strict";

const Categories = require("../models/categorieModel");
const Products = require("../models/productModel");

const getAllCategories = async () => {
   const categories = await Categories.find().lean();
   return {
      categories,
      totalCategories: categories.length,
   };
};

const getCategoryByStatus = async (status = true) => {
   // const categories = await Categories.find({status: status}).lean();
   // return {
   //    categories,
   //    totalCategories: categories.length,
   // };

   const categories = await Categories.find({ status: status }).lean();
   const productCounts = await Products.aggregate([
      {
         $match: {
            categoryId: { $in: categories.map((category) => category._id) },
         },
      },
      {
         $group: {
            _id: "$categoryId", 
            productCount: { $sum: 1 }, 
         },
      },
   ]);

   const categoriesWithProductCount = categories.map((category) => {
      const productCount = productCounts.find(
         (count) => count._id.toString() === category._id.toString()
      );
      return {
         ...category,
         productCount: productCount ? productCount.productCount : 0, 
      };
   });

   return {
      categories: categoriesWithProductCount,
      totalCategories: categories.length,
   };
}

const getCategoryById = async (id) => {
   const categories = await Categories.findById(id).lean();
   return {
      categories,
      totalCategories: categories.length,
   };
}

module.exports = {
   getAllCategories,
   getCategoryById,
   getCategoryByStatus,
};