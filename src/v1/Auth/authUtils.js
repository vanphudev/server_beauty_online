"use strict";
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middlewares/handleError");
const {UnauthorizedError, UserNotFoundError, TokenExpiredError, NotFoundError} = require("../core/errorRespones");
const KeyTokenService = require("../services/keyTokenService");

const createTokenPair = async (payload, publicKey, privateKey) => {
   try {
      const accessToken = jwt.sign(payload, publicKey, {expiresIn: "1y"});
      const refreshToken = jwt.sign(payload, privateKey, {expiresIn: "1y"});
      jwt.verify(accessToken, publicKey, (error, decoded) => {
         if (error) {
            console.log("error verify", error);
         }
         console.log("decoded", decoded);
      });
      return {accessToken, refreshToken};
   } catch (error) {
      return error;
   }
};

const authentication = asyncHandler(async (req, res, next) => {
   if (!req.headers || Object.keys(req.headers).length === 0) {
      throw new NotFoundError("Không tìm thấy headers - Headers not found");
   }
   if (!req.headers.client_id || !req.headers.authorization) {
      throw new NotFoundError(
         "Tham số client_id và authorization là bắt buộc - client_id and authorization are required"
      );
   }
   const client_id = req.headers.client_id;
   if (!client_id) {
      throw new NotFoundError("Client id is required");
   }
   const token = await KeyTokenService.findByUserId(client_id);
   if (!token) {
      throw new UserNotFoundError("Không tìm thấy người dùng trong Token - User not found in Token");
   }
   const accessToken = req.headers.authorization;
   if (!accessToken) {
      throw new NotFoundError("Access token is required");
   }
   jwt.verify(accessToken, token.publicKey, (error, decoded) => {
      if (error) {
         if (error instanceof jwt.TokenExpiredError) {
            throw new TokenExpiredError("Access token hết hạn - Access token expired");
         }
         if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError("Access token giải mã không hợp lệ - Access token is invalid" + error);
         }
      }
      if (decoded.userId !== client_id) {
         throw new UnauthorizedError("User không hợp lệ với token - User is invalid with token - client_id # userId");
      }
      req.keyStore = token;
      return next();
   });
});

const verifyToken = (token, keySecret) => {
   return jwt.verify(token, keySecret);
};

module.exports = {
   createTokenPair,
   authentication,
   verifyToken,
};
