"use strict";

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");
const {
   getCartById,
   addItemToCart,
   removeItemFromCart,
   updateItemQuantityInCart,
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

   updateItemQuantityInCart = async (req, res, next) => {
      new SuccessResponse({
         message: "Item quantity updated in cart",
         data: await updateItemQuantityInCart(req),
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
