"use strict";

const {BadRequestError, InternalServerError, UserNotFoundError} = require("../core/errorRespones");

const PaymentMethods = require("../models/paymentMethodModel");

const getPaymentMethods = async () => {
   const paymentMethods = await PaymentMethods.find().lean();
   return {
      paymentMethods,
      totalPaymentMethods: paymentMethods.length,
   };
};

const getPaymentMethodActive = async () => {
   const paymentMethods = await PaymentMethods.find({status: "active"}).lean();
   return {
      paymentMethods,
      totalPaymentMethods: paymentMethods.length,
   };
};

module.exports = {
   getPaymentMethods,
   getPaymentMethodActive,
};
