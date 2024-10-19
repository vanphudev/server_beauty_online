"use strict";

const {BadRequestError, InternalServerError, UserNotFoundError} = require("../core/errorRespones");

const Orders = require("../models/orderModel");
const Products = require("../models/productModel");
const Vouchers = require("../models/voucherModel");
const PaymentMethods = require("../models/paymentMethodModel");

const createOrder = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   const {items, totalPrice, discountAmount, voucherId, finalPrice, paymentMethod, shippingAddress, note} = body;
   if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError("Items are required - Danh sách sản phẩm không được trống.");
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

   const {tinh, quan, huyen, tenDuong} = shippingAddress;
   if (!tinh || !quan || !huyen || !tenDuong) {
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

   if (voucherId) {
      const voucher = await Vouchers.findById(voucherId).lean();
      if (!voucher) {
         throw new BadRequestError(`Voucher ${voucherId} not found - Không tìm thấy mã giảm giá ${voucherId}.`);
      }
      if (voucher.startDate > new Date() || voucher.endDate < new Date()) {
         throw new BadRequestError(`Voucher ${voucherId} is expired - Mã giảm giá ${voucherId} đã hết hạn.`);
      }
      if (voucher.usedCount >= voucher.usageLimit) {
         throw new BadRequestError(`Voucher ${voucherId} is expired - Mã giảm giá ${voucherId} đã hết hạn.`);
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

   if (totalPrice + discountAmount !== finalPrice) {
      throw new BadRequestError("Final price is invalid - Giá cuối cùng không hợp lệ.");
   }

   const payment = await PaymentMethods.findById(paymentMethod).lean();
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

   const newOrder = new Orders({
      userId: clientId,
      items,
      totalPrice,
      discountAmount,
      finalPrice,
      paymentMethod,
      voucherId,
      shippingAddress,
      note: note || "",
   });

   await newOrder.save();
   return newOrder;
};

const checkInventory = async (productId) => {
   const inventory = Products.findById(productId).select("inventory").lean();
   if (!inventory) {
      throw new InternalServerError(`Product ${productId} not found - Không tìm thấy sản phẩm ${productId}.`);
   }
   return inventory;
};

module.exports = {
   createOrder,
};
