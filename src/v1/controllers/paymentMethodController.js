"use strict";

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");

const {getPaymentMethods, getPaymentMethodActive} = require("../services/paymentMethodService");

class PaymentMethodController {
   getPaymentMethods = async (req, res, next) => {
      new SuccessResponse({
         message: "Payment methods fetched",
         data: await getPaymentMethods(),
      }).send(res);
   };

   getPaymentMethodActive = async (req, res, next) => {
      new SuccessResponse({
         message: "Active payment methods fetched",
         data: await getPaymentMethodActive(),
      }).send(res);
   };
}

module.exports = new PaymentMethodController();
