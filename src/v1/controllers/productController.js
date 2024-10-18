"use strict";

const {
   getAllProducts,
   getProductById,
   sortPriceAsc,
   sortPriceDesc,
   sortPriceRange,
   filterCategory,
   getProductsPagination,
   getSearchAll,
   getProductTab,
} = require("../services/productService");

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");

class ProductsController {
   getAllProducts = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all products",
         data: await getAllProducts(),
      }).send(res);
   };

   getProductById = async (req, res, next) => {
      new SuccessResponse({
         message: "Product detail " + req.params.id,
         data: await getProductById(req.params.id),
      }).send(res);
   };

   sortPriceAsc = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all products sorted by price ascending",
         data: await sortPriceAsc(),
      }).send(res);
   };

   sortPriceDesc = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all products sorted by price descending",
         data: await sortPriceDesc(),
      }).send(res);
   };

   sortPriceRange = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all products sorted by price range",
         data: await sortPriceRange(req.query.min, req.query.max),
      }).send(res);
   };

   filterCategory = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all products filtered by category",
         data: await filterCategory(req.query.categoryId),
      }).send(res);
   };

   getProductsPagination = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all products with pagination",
         data: await getProductsPagination(req.query.page, req.query.limit),
      }).send(res);
   };

   getSearchAll = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all products by search",
         data: await getSearchAll(req.query.searchTerm),
      }).send(res);
   };

   getProductTab = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all products by tab",
         data: await getProductTab(req.query.valueTab),
      }).send(res);
   };
}

module.exports = new ProductsController();
