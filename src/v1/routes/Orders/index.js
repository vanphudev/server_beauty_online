const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");

const OrdersController = require("../../controllers/orderController");

rootRouter.post("/orders/create", asyncHandler(OrdersController.createOrder));
rootRouter.get("/orders/getbyid", asyncHandler(OrdersController.getUserOrderById));
rootRouter.get("/orders/getorder", asyncHandler(OrdersController.getOrderById));

module.exports = rootRouter;
