"use strict";

const {Types} = require("mongoose");
const {BadRequestError, InternalServerError, UserNotFoundError, NotFoundError} = require("../core/errorRespones");

const Carts = require("../models/cartModel");
const Products = require("../models/productModel");

const getCartById = async ({keyStore}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
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
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   if (!body.productId || !body.quantity) {
      throw new BadRequestError("Missing required parameters: productId and quantity are required.");
   }

   let cart = await Carts.findOne({userId: new Types.ObjectId(clientId)});
   if (!cart) {
      cart = Carts.create({
         userId: new Types.ObjectId(clientId),
         items: [],
      });
   }

   const {productId, quantity} = body;

   if (!Number.isInteger(quantity)) {
      throw new BadRequestError("Số lượng sản phẩm phải là số nguyên.");
   }

   if (quantity <= 0) {
      throw new BadRequestError("Số lượng sản phẩm phải lớn hơn 0.");
   }

   try {
      const product = await Products.findById(productId).lean();
      if (!product) {
         throw new NotFoundError("Sản phẩm không tồn tại trong hệ thống !");
      }
   } catch (error) {
      throw new NotFoundError("Sản phẩm không tồn tại trong hệ thống !");
   }

   if (cart.items && cart.items.length > 0) {
      const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);
      if (existingItemIndex > -1) {
         cart.items[existingItemIndex].quantity += quantity;
         await cart.save();
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
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   if (!body.productId) {
      throw new BadRequestError("Missing required parameters: productId is required.");
   }

   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   if (!cart) {
      throw new NotFoundError("Giỏ hàng không tồn tại.");
   }

   const {productId} = body;
   const existingItemIndex = cart.items.findIndex((item) => item?.productId._id == productId);

   if (existingItemIndex === -1) {
      throw new NotFoundError("Sản phẩm không tồn tại trong giỏ hàng.");
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
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   if (!body.productId) {
      throw new BadRequestError("Missing required parameters: productId is required.");
   }

   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   if (!cart) {
      throw new NotFoundError("Giỏ hàng không tồn tại.");
   }

   const {productId} = body;

   const existingItem = cart.items.find((item) => item.productId._id.toString() === productId);
   if (!existingItem) {
      throw new NotFoundError("Sản phẩm không tồn tại trong giỏ hàng.");
   }

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
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   if (!body.productId) {
      throw new BadRequestError("Missing required parameters: productId is required.");
   }

   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   if (!cart) {
      throw new NotFoundError("Giỏ hàng không tồn tại.");
   }

   const {productId} = body;
   const existingItem = cart.items.find((item) => item.productId._id.toString() === productId);
   if (!existingItem) {
      throw new NotFoundError("Sản phẩm không tồn tại trong giỏ hàng.");
   }

   if (existingItem.quantity > 1) {
      existingItem.quantity -= 1;
   } else {
      cart.items = cart.items.filter((item) => item.productId._id.toString() !== productId);
   }
   await cart.save();

   return {
      cart,
      totalItems: cart.items.length,
   };
};

const clearCart = async ({keyStore}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const cart = await Carts.findOne({userId: clientId}).populate("items.productId");
   if (!cart) {
      throw new NotFoundError("Giỏ hàng không tồn tại.");
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
