"use strict";

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");
const {
   getCartById,
   addItemToCart,
   removeItemFromCart,
   decreaseProductQuantity,
   increaseProductQuantity,
   clearCart,
} = require("../services/cartService");

class CartsController {
   getCartById = async (req, res, next) => {
      new SuccessResponse({
         message: "Cart detail",
         data: await getCartById(req),
      }).send(res);
   };

   addItemToCart = async (req, res, next) => {
      new SuccessResponse({
         message: "Item added to cart",
         data: await addItemToCart(req),
      }).send(res);
   };

   removeItemFromCart = async (req, res, next) => {
      new SuccessResponse({
         message: "Item removed from cart",
         data: await removeItemFromCart(req),
      }).send(res);
   };

   increaseProductQuantity = async (req, res, next) => {
      new SuccessResponse({
         message: "Increase quantity updated",
         data: await increaseProductQuantity(req),
      }).send(res);
   };

   decreaseProductQuantity = async (req, res, next) => {
      new SuccessResponse({
         message: "Decrease product quantity",
         data: await decreaseProductQuantity(req),
      }).send(res);
   };

   clearCart = async (req, res, next) => {
      new SuccessResponse({
         message: "Cart cleared",
         data: await clearCart(req),
      }).send(res);
   };
}

module.exports = new CartsController();
