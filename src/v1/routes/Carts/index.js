const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");

const CartsController = require("../../controllers/cartController");

rootRouter.get("/carts/getcart/byuser", asyncHandler(CartsController.getCartById));
rootRouter.post("/carts/additem", asyncHandler(CartsController.addItemToCart));
rootRouter.post("/carts/removeitem", asyncHandler(CartsController.removeItemFromCart));
rootRouter.post("/carts/updateitemquantity", asyncHandler(CartsController.updateItemQuantityInCart));
rootRouter.post("/carts/clear", asyncHandler(CartsController.clearCart));

module.exports = rootRouter;
