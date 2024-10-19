const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");

const OrdersController = require("../../controllers/orderController");

rootRouter.post("/orders/create", asyncHandler(OrdersController.createOrder));

module.exports = rootRouter;
