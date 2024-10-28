const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");

const ProductsController = require("../../controllers/productController");

rootRouter.get("/products/getall", asyncHandler(ProductsController.getAllProducts));
rootRouter.get("/products/sort/asc", asyncHandler(ProductsController.sortPriceAsc));
rootRouter.get("/products/sort/desc", asyncHandler(ProductsController.sortPriceDesc));
rootRouter.get("/products/sort/range", asyncHandler(ProductsController.sortPriceRange));
rootRouter.get("/products/filter", asyncHandler(ProductsController.filterCategory));
rootRouter.get("/products/pagination", asyncHandler(ProductsController.getProductsPagination));
rootRouter.get("/products/search", asyncHandler(ProductsController.getSearchAll));
rootRouter.get("/products/tab", asyncHandler(ProductsController.getProductTab));
rootRouter.get("/products/:id", asyncHandler(ProductsController.getProductById));

module.exports = rootRouter;
