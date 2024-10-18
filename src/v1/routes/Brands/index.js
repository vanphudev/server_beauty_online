const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");

const BrandsController = require("../../controllers/brandController");
rootRouter.get("/brands/getall", asyncHandler(BrandsController.getBrandsAll));

module.exports = rootRouter;
