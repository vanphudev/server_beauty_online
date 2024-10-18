"use strict";

const {BadRequestError, InternalServerError, UserNotFoundError} = require("../core/errorRespones");

const Carts = require("../models/cartModel");

const getCartById = async ({keyStore}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   console.log("Cart gọi", cart);
   if (!cart) {
      const newCart = new Carts({
         userId: clientId,
         items: [],
      });
      await newCart.save();
      const updatedCart = await Carts.findOne({userId: clientId}).populate("items.productId");
      if (!updatedCart) {
         throw new BadRequestError("Error when getting cart");
      }
      return {
         cart: updatedCart,
         totalItems: updatedCart.items.length,
      };
   }
   return {
      cart,
      totalItems: cart.items.length,
   };
};

const addItemToCart = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   let cart = await Carts.findOne({userId: clientId});
   console.log("Cart", cart);
   if (!cart) {
      cart = Carts.create({
         userId: clientId,
         items: [],
      });
   }
   console.log("Cart", cart);
   const {productId, quantity} = body;
   console.log("productId ", productId, " - quantity ", quantity);
   if (cart.items && cart.items.length > 0) {
      const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
      console.log("existingItemIndex", existingItemIndex);
      if (existingItemIndex > -1) {
         cart.items[existingItemIndex].quantity += quantity;
      } else {
         cart.items.push({
            productId: productId,
            quantity: quantity,
         });
         await cart.save();
      }
   } else {
      cart.items.push({
         productId: productId,
         quantity: quantity,
      });
      await cart.save();
   }

   const updatedCart = await Carts.findOne({userId: clientId}).populate("items.productId");
   const itemInCart = updatedCart.items.find((item) => item.productId.toString() === productId);
   console.log("updatedCart", updatedCart);
   console.log("itemInCart", itemInCart);

   return {
      cart: updatedCart,
      totalItems: updatedCart.items.length,
      itemInCart,
   };
};

const removeItemFromCart = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   if (!cart) {
      throw new BadRequestError("Giỏ hàng không tồn tại.");
   }
   const {productId} = body;
   const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
   if (existingItemIndex === -1) {
      throw new BadRequestError("Sản phẩm không tồn tại trong giỏ hàng.");
   }
   cart.items.splice(existingItemIndex, 1);
   await cart.save();
   return {
      cart,
      totalItems: cart.items.length,
   };
};

const updateItemQuantityInCart = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   if (!cart) {
      throw new BadRequestError("Giỏ hàng không tồn tại.");
   }
   const {productId, newQuantity} = body;
   const existingItem = cart.items.find((item) => item.productId.toString() === productId);
   if (!existingItem) {
      throw new BadRequestError("Sản phẩm không tồn tại trong giỏ hàng.");
   }
   existingItem.quantity = newQuantity;
   await cart.save();
   return {
      cart,
      totalItems: cart.items.length,
   };
};

const clearCart = async ({keyStore}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   if (!cart) {
      throw new BadRequestError("Giỏ hàng không tồn tại.");
   }
   cart.items = [];
   await cart.save();
   return {
      message: "Giỏ hàng đã được xóa thành công.",
      totalItems: cart.items.length,
   };
};

module.exports = {
   getCartById,
   addItemToCart,
   removeItemFromCart,
   updateItemQuantityInCart,
   clearCart,
};
