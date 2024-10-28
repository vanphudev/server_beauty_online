"use strict";

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");

const {
   createOrder,
   getUserOrderById,
   getOrderById,
   checkProductBought,
   rateProduct,
} = require("../services/orderService");

class OrderController {
   createOrder = async (req, res, next) => {
      new CREATED({
         message: "Order created",
         data: await createOrder(req),
      }).send(res);
   };

   getUserOrderById = async (req, res, next) => {
      new SuccessResponse({
         message: "User order fetched",
         data: await getUserOrderById(req),
      }).send(res);
   };

   getOrderById = async (req, res, next) => {
      new SuccessResponse({
         message: "Order fetched",
         data: await getOrderById(req),
      }).send(res);
   };

   checkProductBought = async (req, res, next) => {
      new SuccessResponse({
         message: "Product bought",
         data: await checkProductBought(req),
      }).send(res);
   };

   rateProduct = async (req, res, next) => {
      new SuccessResponse({
         message: "Product rated",
         data: await rateProduct(req),
      }).send(res);
   };
}

module.exports = new OrderController();
