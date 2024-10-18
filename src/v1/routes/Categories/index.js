const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");

const CategoriesController = require("../../controllers/categorieController");
rootRouter.get("/categories/getall", asyncHandler(CategoriesController.getAllCategories));
rootRouter.get("/categories/status/:status", asyncHandler(CategoriesController.getCategoryByStatus));
rootRouter.get("/categories/:id", asyncHandler(CategoriesController.getCategoryById));

module.exports = rootRouter;
