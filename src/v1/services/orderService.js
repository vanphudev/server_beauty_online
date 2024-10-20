"use strict";

const {BadRequestError, InternalServerError, UserNotFoundError} = require("../core/errorRespones");

const Orders = require("../models/orderModel");
const Products = require("../models/productModel");
const Vouchers = require("../models/voucherModel");
const PaymentMethods = require("../models/paymentMethodModel");
const Carts = require("../models/cartModel");
var validator = require("validator");
const createOrder = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   const {
      items,
      totalPrice,
      phone,
      discountAmount,
      voucherId,
      finalPrice,
      paymentMethod,
      shippingAddress,
      note,
      email,
   } = body;

   // Kiểm tra các điều kiện đầu vào
   if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError("Items are required - Danh sách sản phẩm không được trống.");
   }

   if (!phone || !validator.isMobilePhone(phone)) {
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
   if (!shippingAddress || typeof shippingAddress !== "object") {
      throw new BadRequestError(
         "Shipping address is required and must be an object - Địa chỉ giao hàng là bắt buộc và phải là một đối tượng."
      );
   }
   if (!paymentMethod) {
      throw new BadRequestError("Payment method is required - Phương thức thanh toán là bắt buộc.");
   }

   // Kiểm tra địa chỉ giao hàng
   const {province, district, ward, address} = shippingAddress;
   if (!province || !district || !ward || !address) {
      throw new BadRequestError("Complete shipping address is required - Địa chỉ giao hàng phải đầy đủ.");
   }
   if (!finalPrice || typeof finalPrice !== "number" || finalPrice < 0) {
      throw new BadRequestError(
         "Final price is required and must be a positive number - Giá cuối cùng là bắt buộc và phải lớn hơn hoặc bằng 0."
      );
   }
   if (voucherId && (!discountAmount || typeof discountAmount !== "number" || discountAmount < 0)) {
      throw new BadRequestError(
         "Discount amount is required and must be a positive number - Số tiền giảm giá là bắt buộc và phải lớn hơn hoặc bằng 0."
      );
   }

   // Kiểm tra mã giảm giá
   if (voucherId) {
      const voucher = await Vouchers.findById(voucherId).lean();
      if (!voucher) {
         throw new BadRequestError(`Voucher ${voucherId} not found - Không tìm thấy mã giảm giá ${voucherId}.`);
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
      if ((voucher.discountValue / 100) * totalPrice !== discountAmount) {
         throw new BadRequestError(`Discount amount is invalid - Số tiền giảm giá không hợp lệ.`);
      }
      if (totalPrice - discountAmount !== finalPrice) {
         throw new BadRequestError(`Final price is invalid - Giá cuối cùng không hợp lệ.`);
      }
   }
   const payment = await PaymentMethods.findOne({code: paymentMethod}).lean();
   if (!payment) {
      throw new BadRequestError(
         `Payment method ${paymentMethod} not found - Không tìm thấy phương thức thanh toán ${paymentMethod}.`
      );
   }
   for (const item of items) {
      const {productId, quantity} = item;
      const inventory = await checkInventory(productId);
      if (inventory < quantity) {
         throw new BadRequestError(
            `Insufficient inventory for product ${productId} - Không đủ hàng cho sản phẩm ${productId}.`
         );
      }
   }
   try {
      const newOrder = new Orders({
         userId: clientId,
         items,
         totalPrice,
         discountAmount,
         finalPrice,
         phone,
         email,
         paymentMethod: payment._id,
         voucherId: voucherId || null,
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
   } catch (error) {
      throw new BadRequestError("Transaction failed - Giao dịch thất bại. Vui lòng thử lại. Lỗi ::: ", error);
   } finally {
   }
};

const checkInventory = async (productId) => {
   const inventory = Products.findById(productId).select("inventory").lean();
   if (!inventory) {
      throw new InternalServerError(`Product ${productId} not found - Không tìm thấy sản phẩm ${productId}.`);
   }
   return inventory;
};

const getUserOrderById = async ({keyStore}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }
   const orders = await Orders.find({userId: clientId})
      .populate("items.productId")
      .populate("paymentMethod")
      .populate("voucherId")
      .populate("userId")
      .lean();
   if (!orders) {
      throw new BadRequestError(
         `Orders of user ${userId} not found - Không tìm thấy đơn hàng của người dùng ${userId}.`
      );
   }
   return {
      orders,
   };
};

const getOrderById = async ({keyStore, query}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
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
      throw new BadRequestError(`Order ${orderId} not found - Không tìm thấy đơn hàng ${orderId}.`);
   }
   return {
      order,
   };
};

module.exports = {
   createOrder,
   getUserOrderById,
   getOrderById,
};
