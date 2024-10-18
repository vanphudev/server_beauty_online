"use strict";

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");
const {getActiveVouchers} = require("../services/voucherService");

class VouchersController {
   getActiveVouchers = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all Vouchers",
         data: await getActiveVouchers(),
      }).send(res);
   };
}

module.exports = new VouchersController();