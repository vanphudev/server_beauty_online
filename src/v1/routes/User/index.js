const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");
const UserController = require("../../controllers/userController");

rootRouter.put("/user/update", asyncHandler(UserController.updateUser));
rootRouter.patch("/user/change-password", asyncHandler(UserController.changePassword));

module.exports = rootRouter;
