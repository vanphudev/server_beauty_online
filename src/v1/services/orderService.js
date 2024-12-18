"use strict";

const {BadRequestError, InternalServerError, UserNotFoundError, NotFoundError} = require("../core/errorRespones");
const {ObjectId} = require("mongodb");
const Orders = require("../models/orderModel");
const Products = require("../models/productModel");
const Vouchers = require("../models/voucherModel");
const PaymentMethods = require("../models/paymentMethodModel");
const Carts = require("../models/cartModel");
const mongoose = require("mongoose");

var validator = require("validator");

function parseNull(value) {
   return value == "null" ? null : value;
}

function isEmpty(value) {
   return value == undefined || value == null || value == "" || value == "null";
}

const createOrder = async ({keyStore, body}) => {
   const clientId = keyStore.user;

   if (!clientId) {
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   const {
      userId = parseNull(body.userId),
      items = parseNull(body.items),
      totalPrice = parseNull(body.totalPrice),
      phone = parseNull(body.phone),
      discountAmount = parseNull(body.discountAmount),
      voucherId = parseNull(body.voucherId),
      finalPrice = parseNull(body.finalPrice),
      paymentMethod = parseNull(body.paymentMethod),
      shippingAddress = parseNull(body.shippingAddress),
      note = parseNull(body.note),
      email = parseNull(body.email),
   } = body;
   const missingFields = [];

   if (isEmpty(userId)) {
      missingFields.push("userId");
   }

   if (isEmpty(items)) {
      missingFields.push("items");
   }

   if (isEmpty(totalPrice)) {
      missingFields.push("totalPrice");
   } else if (totalPrice < 0) {
      throw new BadRequestError("Total price must be a positive number - Tổng giá trị đơn hàng phải là một số dương.");
   }

   if (isEmpty(phone)) {
      missingFields.push("phone");
   }

   if (isEmpty(finalPrice)) {
      missingFields.push("finalPrice");
   }

   if (isEmpty(paymentMethod)) {
      missingFields.push("paymentMethod");
   }

   if (isEmpty(shippingAddress)) {
      missingFields.push("shippingAddress");
   }

   if (isEmpty(email)) {
      missingFields.push("email");
   }

   if (isEmpty(discountAmount) && Number(body.discountAmount) !== 0) {
      console.log("discountAmount :::: ", discountAmount);
      missingFields.push("discountAmount");
   }

   if (missingFields.length > 0) {
      throw new NotFoundError(`Missing required fields: ${missingFields.join(", ")}`);
   }

   if (!(ObjectId.isValid(body.userId) ? new ObjectId(body.userId) : null)) {
      throw new BadRequestError("User ID is invalid or missing - ID người dùng không hợp lệ hoặc bị thiếu.");
   }

   if (!Array.isArray(JSON.parse(items)) || JSON.parse(items).length == 0) {
      console.log("items :::: ", items, JSON.parse(items).length);
      throw new BadRequestError("Items are required - Danh sách sản phẩm không được trống.");
   }

   if (!phone || !validator.isMobilePhone(phone)) {
      console.log("phone :::: ", phone);
      throw new BadRequestError(
         "Phone is required and must be a valid phone number - Số điện thoại là bắt buộc và phải là một số điện thoại hợp lệ."
      );
   }
   if (!email || !validator.isEmail(email)) {
      throw new BadRequestError(
         "Email is required and must be a valid email - Email là bắt buộc và phải là một email hợp lệ."
      );
   }

   if (!totalPrice || typeof totalPrice !== "number" || totalPrice < 0) {
      throw new BadRequestError(
         "Total price is required and must be a positive number - Tổng giá trị đơn hàng là bắt buộc và phải lớn hơn hoặc bằng 0."
      );
   }
   if (!JSON.parse(shippingAddress) || typeof JSON.parse(shippingAddress) !== "object") {
      throw new BadRequestError(
         "Shipping address is required and must be an object - Địa chỉ giao hàng là bắt buộc và phải là một đối tượng."
      );
   }
   if (!paymentMethod) {
      throw new BadRequestError("Payment method is required - Phương thức thanh toán là bắt buộc.");
   }

   const {province, district, ward, address} =
      typeof shippingAddress === "string" ? JSON.parse(shippingAddress) : shippingAddress;

   if (!province || !district || !ward || !address) {
      throw new NotFoundError("Complete shipping address is required - Địa chỉ giao hàng phải đầy đủ.");
   }

   if (!finalPrice || typeof finalPrice !== "number" || finalPrice < 0) {
      throw new BadRequestError(
         "Final price is required and must be a positive number - Giá cuối cùng là bắt buộc và phải lớn hơn hoặc bằng 0."
      );
   }

   if (!isEmpty(voucherId)) {
      if (!(ObjectId.isValid(body.voucherId) ? new ObjectId(body.voucherId) : null)) {
         throw new BadRequestError("Voucher ID is invalid or missing - ID voucher không hợp lệ hoặc bị thiếu.");
      }
      const voucher = await Vouchers.findById(new ObjectId(voucherId)).lean();
      if (!voucher) {
         throw new NotFoundError(`Voucher ${voucherId} not found - Không tìm thấy mã giảm giá ${voucherId}.`);
      }
      if (voucher.startDate > new Date() || voucher.endDate < new Date()) {
         throw new BadRequestError(`Voucher ${voucherId} is expired - Mã giảm giá ${voucherId} đã hết hạn.`);
      }
      if (voucher.usedCount >= voucher.usageLimit) {
         throw new BadRequestError(
            `Voucher ${voucherId} has reached its usage limit - Mã giảm giá ${voucherId} đã đạt giới hạn sử dụng.`
         );
      }
      if (totalPrice < voucher.minOrderValue) {
         throw new BadRequestError(
            `Total price must be greater than or equal to ${voucher.minOrderValue} - Tổng giá trị đơn hàng phải lớn hơn hoặc bằng ${voucher.minOrderValue}.`
         );
      }
      if (isEmpty(discountAmount)) {
         throw new NotFoundError("Discount amount is required - Số tiền giảm giá là bắt buộc.");
      }
      if ((voucher.discountValue / 100) * totalPrice !== discountAmount) {
         throw new BadRequestError(`Discount amount is invalid - Số tiền giảm giá không hợp lệ.`);
      }
      if (totalPrice - discountAmount !== finalPrice) {
         throw new BadRequestError(`Final price is invalid - Giá cuối cùng không hợp lệ.`);
      }
   }
   const payment = await PaymentMethods.findOne({code: paymentMethod}).lean();
   if (!payment) {
      throw new NotFoundError(
         `Payment method ${paymentMethod} not found - Không tìm thấy phương thức thanh toán ${paymentMethod}.`
      );
   }

   for (const item of JSON.parse(items)) {
      const {productId, quantity} = item;

      // Kiểm tra productId có tồn tại và không rỗng
      if (!productId) {
         throw new BadRequestError(
            "Product ID is required and cannot be empty - ID sản phẩm là bắt buộc và không được để trống."
         );
      }

      // Kiểm tra hàng tồn kho cho từng sản phẩm
      let inventory = await checkInventory(productId);

      // Kiểm tra nếu inventory không hợp lệ (nếu productId không tồn tại trong kho)
      if (inventory === null || inventory === undefined) {
         throw new NotFoundError(`Product ${productId} does not exist - Sản phẩm ${productId} không tồn tại.`);
      }

      // Ép kiểu inventory thành số nguyên
      inventory = parseInt(inventory, 10);

      // Kiểm tra nếu inventory là NaN sau khi ép kiểu
      if (isNaN(inventory)) {
         throw new BadRequestError(
            `Inventory for product ${productId} is invalid - Tồn kho của sản phẩm ${productId} không hợp lệ.`
         );
      }

      // Kiểm tra số lượng tồn kho so với quantity yêu cầu
      if (inventory < quantity) {
         throw new BadRequestError(
            `Insufficient inventory for product ${productId} - Không đủ hàng cho sản phẩm ${productId}.`
         );
      }
   }

   const newOrder = new Orders({
      userId: new ObjectId(userId),
      items,
      totalPrice,
      discountAmount,
      finalPrice,
      phone,
      email,
      paymentMethod: new ObjectId(payment._id),
      voucherId: !isEmpty(voucherId) ? new ObjectId(voucherId) : null,
      shippingAddress,
      note: note || "",
   });
   for (const item of items) {
      const {productId, quantity} = item;
      await Products.findByIdAndUpdate(productId, {$inc: {inventory: -quantity}});
   }
   if (voucherId) {
      await Vouchers.findByIdAndUpdate(voucherId, {$inc: {usedCount: 1}});
   }
   await Carts.findOneAndDelete({userId: clientId});
   await newOrder.save();
   return {
      orders: newOrder,
   };
};

const checkInventory = async (productId) => {
   const inventory = Products.findById(new ObjectId(productId)).lean();
   if (!inventory) {
      throw new NotFoundError(`Product ${productId} not found - Không tìm thấy sản phẩm ${productId}.`);
   }
   return inventory.inventory;
};

const getUserOrderById = async ({keyStore, query}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const {id} = query;
   if (!id) {
      throw new BadRequestError("Order id is required - Mã đơn hàng là bắt buộc.");
   }
   if (!validator.isMongoId(id)) {
      throw new BadRequestError("Order id is invalid - Mã đơn hàng không hợp lệ.");
   }
   const orders = await Orders.findOne({userId: clientId, _id: id})
      .populate("userId")
      .populate("items.productId")
      .populate("paymentMethod")
      .populate("voucherId")
      .lean();
   if (!orders) {
      throw new NotFoundError(
         `Orders of user ${clientId} not found - Không tìm thấy đơn hàng của người dùng ${clientId}.`
      );
   }
   return {
      orders,
      success: true,
   };
};

const getOrderById = async ({keyStore, query}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const {orderId} = query;
   console.log("orderId :::: ", orderId);
   const order = await Orders.findById(orderId)
      .populate("items.productId")
      .populate("paymentMethod")
      .populate("voucherId")
      .populate("userId")
      .lean();
   if (!order) {
      throw new NotFoundError(`Order ${orderId} not found - Không tìm thấy đơn hàng ${orderId}.`);
   }
   return {
      order,
   };
};

const checkProductBought = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const {productId} = body;
   if (!productId) {
      throw new BadRequestError("Product id is required - Mã sản phẩm là bắt buộc.");
   }
   const order = await Orders.findOne({userId: clientId, items: {$elemMatch: {productId: productId}}}).lean();
   return {
      order,
      isBought: !!order,
   };
};

const rateProduct = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new NotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   const {productId, rating, comment, userId} = body;
   if (!userId) {
      throw new BadRequestError("User id is required - Mã người dùng là bắt buộc.");
   }

   if (!comment) {
      throw new BadRequestError("Comment is required - Bình luận là bắt buộc.");
   }

   if (comment.length > 500) {
      throw new BadRequestError("Comment must be less than 500 characters - Bình luận phải ít hơn 500 ký tự.");
   }

   if (!productId || !rating) {
      throw new BadRequestError("Product id and rating are required - Mã sản phẩm và đánh giá là bắt buộc.");
   }

   if (isNaN(rating)) {
      throw new BadRequestError("Rating must be a number - Đánh giá phải là một số.");
   }

   if (rating < 1 || rating > 5) {
      throw new BadRequestError("Rating must be between 1 and 5 - Đánh giá phải từ 1 đến 5.");
   }

   if (!validator.isMongoId(productId)) {
      throw new BadRequestError("Product id is invalid - Mã sản phẩm không hợp lệ.");
   }

   if (!validator.isMongoId(userId)) {
      throw new BadRequestError("User id is invalid - Mã người dùng không hợp lệ.");
   }

   const order = await Orders.findOne({userId: clientId, items: {$elemMatch: {productId: productId}}}).lean();
   if (!order) {
      throw new NotFoundError(
         `Product ${productId} not found in orders - Không tìm thấy sản phẩm ${productId} trong đơn hàng.`
      );
   }

   const product = await Products.findById(productId).lean();
   if (!product) {
      throw new NotFoundError(`Product ${productId} not found - Không tìm thấy sản phẩm ${productId}.`);
   }

   const userRating = product.ratings.find((r) => r.userId.toString() === clientId);
   if (userRating) {
      throw new BadRequestError("User has already rated this product - Người dùng đã đánh giá sản phẩm này.");
   }

   if (!userRating) {
      product.ratings.push({
         userId: new mongoose.Types.ObjectId(userId),
         rating,
         comment,
      });
      await product.save();
   }

   return {
      success: true,
      product,
      isRated: true,
   };
};

module.exports = {
   createOrder,
   getUserOrderById,
   getOrderById,
   checkProductBought,
   rateProduct,
};
