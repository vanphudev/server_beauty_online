"use strict";

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");
const {getAllCategories, getCategoryById, getCategoryByStatus} = require("../services/categorieService");

class CategoriesController {
   getAllCategories = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all categories",
         data: await getAllCategories(),
      }).send(res);
   };

   getCategoryById = async (req, res, next) => {
      new SuccessResponse({
         message: "Category detail " + req.params.id,
         data: await getCategoryById(req.params.id),
      }).send(res);
   };

   getCategoryByStatus = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all categories by status",
         data: await getCategoryByStatus(req.params.status),
      }).send(res);
   }
}

module.exports = new CategoriesController();