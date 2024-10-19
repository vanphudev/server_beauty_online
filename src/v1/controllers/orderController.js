"use strict";

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");

const {createOrder} = require("../services/orderService");

class OrderController {
   createOrder = async (req, res, next) => {
      new SuccessResponse({
         message: "Order created",
         data: await createOrder(req),
      }).send(res);
   };
}

module.exports = new OrderController();
