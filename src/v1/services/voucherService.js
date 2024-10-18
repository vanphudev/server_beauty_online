"use strict";

const Vouchers = require("../models/voucherModel");

const getActiveVouchers = async () => {
   const currentDate = new Date();
   const vouchers = await Vouchers.aggregate([
      {
         $match: {
            endDate: { $gte: currentDate },
            $expr: { $lt: ["$usedCount", "$usageLimit"] } 
         }
      }
   ]);

   return {
      vouchers,
      totalVouchers: vouchers.length,
   };
};

module.exports = {
   getActiveVouchers,
};
