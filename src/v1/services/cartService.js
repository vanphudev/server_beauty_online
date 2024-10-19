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
   if (!cart) {
      cart = Carts.create({
         userId: clientId,
         items: [],
      });
   }
   const {productId, quantity} = body;
   if (cart.items && cart.items.length > 0) {
      const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() == productId);
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

   return {
      cart: cart,
      totalItems: cart.items.length,
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
   console.log("cart", cart);

   console.log("productId", productId);

   const existingItemIndex = cart.items.findIndex((item) => item._id == productId);
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

const increaseProductQuantity = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   if (!cart) {
      throw new BadRequestError("Giỏ hàng không tồn tại.");
   }

   const {productId} = body;

   const existingItem = cart.items.find((item) => item.productId._id.toString() === productId);
   if (!existingItem) {
      throw new BadRequestError("Sản phẩm không tồn tại trong giỏ hàng.");
   }

   // Tăng số lượng sản phẩm
   existingItem.quantity += 1;
   await cart.save();

   return {
      cart,
      totalItems: cart.items.length,
   };
};
const decreaseProductQuantity = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   if (!cart) {
      throw new BadRequestError("Giỏ hàng không tồn tại.");
   }

   const {productId} = body;
   const existingItem = cart.items.find((item) => item.productId._id.toString() === productId);
   if (!existingItem) {
      throw new BadRequestError("Sản phẩm không tồn tại trong giỏ hàng.");
   }

   // Giảm số lượng sản phẩm hoặc xóa nếu số lượng về 0
   if (existingItem.quantity > 1) {
      existingItem.quantity -= 1;
   } else {
      // Nếu số lượng bằng 1, xóa sản phẩm khỏi giỏ hàng
      cart.items = cart.items.filter((item) => item.productId._id.toString() !== productId);
   }

   // Lưu lại thay đổi vào cơ sở dữ liệu
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
   increaseProductQuantity,
   decreaseProductQuantity,
   clearCart,
};
