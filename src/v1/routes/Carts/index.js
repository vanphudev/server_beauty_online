const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");

const CartsController = require("../../controllers/cartController");

rootRouter.get("/carts/getcart/byuser", asyncHandler(CartsController.getCartById));
rootRouter.post("/carts/additem", asyncHandler(CartsController.addItemToCart));
rootRouter.delete("/carts/removeitem", asyncHandler(CartsController.removeItemFromCart));
rootRouter.put("/carts/increaseQuantity", asyncHandler(CartsController.increaseProductQuantity));
rootRouter.put("/carts/decreaseQuantity", asyncHandler(CartsController.decreaseProductQuantity));

rootRouter.delete("/carts/clear", asyncHandler(CartsController.clearCart));

module.exports = rootRouter;
