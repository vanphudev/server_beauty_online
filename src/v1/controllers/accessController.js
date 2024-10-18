"use strict";

const AccessService = require("../services/accessService");

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");

class AccessController {
   handlerRefreshToken = async (req, res, next) => {
      new SuccessResponse({
         message: "Token refreshed successfully",
         data: await AccessService.handlerRefreshToken(req.body.refreshToken),
      }).send(res);
   };

   logOut = async (req, res, next) => {
      new SuccessResponse({
         message: "User logged out successfully",
         data: await AccessService.logOut(req),
      }).send(res);
   };
   signIn = async (req, res, next) => {
      new SuccessResponse({
         data: await AccessService.signIn(req.body),
      }).send(res);
   };
   signUp = async (req, res, next) => {
      new CREATED({
         message: "User created successfully",
         data: await AccessService.signUp(req.body),
      }).send(res);
   };
}

module.exports = new AccessController();
