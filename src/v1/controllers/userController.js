"use strict";

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");
const {updateUser, changePassword} = require("../services/userService");

class UsersController {
   updateUser = async (req, res, next) => {
      new SuccessResponse({
         message: "User updated",
         data: await updateUser(req),
      }).send(res);
   };

   changePassword = async (req, res, next) => {
      new SuccessResponse({
         message: "Password changed",
         data: await changePassword(req),
      }).send(res);
   };
}

module.exports = new UsersController();
