"use strict";

const Vouchers = require("../models/voucherModel");
const {BadRequestError, NotFoundError} = require("../core/errorRespones");

const getActiveVouchers = async () => {
   const currentDate = new Date();
   const vouchers = await Vouchers.aggregate([
      {
         $match: {
            endDate: {$gte: currentDate},
            $expr: {$lt: ["$usedCount", "$usageLimit"]},
         },
      },
   ]);
   return {
      vouchers,
      totalVouchers: vouchers.length,
   };
};

const checkVoucher = async ({body}) => {
   if (!body || Object.keys(body).length === 0) {
      throw new BadRequestError("Missing required parameters: body is required.");
   }
   if (!body.voucherCode || !body.totalPrice) {
      throw new BadRequestError("Missing required parameters: voucherCode and totalPrice are required.");
   }
   const {voucherCode, totalPrice} = body;
   const voucher = await Vouchers.findOne({code: voucherCode}).lean();
   if (!voucher) {
      throw new NotFoundError(`Voucher ${voucherCode} not found - Không tìm thấy mã giảm giá ${voucherCode}.`);
   }
   if (voucher.startDate > new Date() || voucher.endDate < new Date()) {
      throw new BadRequestError(`Voucher ${voucherCode} is expired - Mã giảm giá ${voucherCode} đã hết hạn.`);
   }
   if (voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestError(`Voucher ${voucherCode} is expired - Mã giảm giá ${voucherCode} đã hết hạn.`);
   }
   if (totalPrice < voucher.minOrderValue) {
      throw new BadRequestError(
         `Total price must be greater than or equal to ${voucher.minOrderValue} - Giá trị đơn hàng phải lớn hơn hoặc bằng ${voucher.minOrderValue}.`
      );
   }
   return {
      voucher,
   };
};

module.exports = {
   getActiveVouchers,
   checkVoucher,
};
