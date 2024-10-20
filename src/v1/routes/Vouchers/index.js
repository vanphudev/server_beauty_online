const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");
const VouchersController = require("../../controllers/voucherController");

rootRouter.get("/vouchers/active/getall", asyncHandler(VouchersController.getActiveVouchers));
rootRouter.post("/vouchers/check", asyncHandler(VouchersController.checkVoucher));

module.exports = rootRouter;
