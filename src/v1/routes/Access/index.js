const express = require("express");
const rootRouter = express.Router();
const asyncHandler = require("../../middlewares/handleError");
const {authentication} = require("../../Auth/authUtils");

const AccessController = require("../../controllers/accessController");

rootRouter.post("/user/signup", asyncHandler(AccessController.signUp));
rootRouter.post("/user/signin", asyncHandler(AccessController.signIn));
rootRouter.use(authentication);
rootRouter.post("/user/logout", asyncHandler(AccessController.logOut));
rootRouter.post("/user/refreshToken", asyncHandler(AccessController.handlerRefreshToken));

module.exports = rootRouter;
