const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");

const PaymentMethodsController = require("../../controllers/paymentMethodController");

rootRouter.get("/paymentmethod/getall", asyncHandler(PaymentMethodsController.getPaymentMethods));
rootRouter.get("/paymentmethod/getactive", asyncHandler(PaymentMethodsController.getPaymentMethodActive));

module.exports = rootRouter;
