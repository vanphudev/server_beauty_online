"use strict";
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middlewares/handleError");
const {UnauthorizedError, UserNotFoundError, TokenExpiredError} = require("../core/errorRespones");
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
   const client_id = req.headers.client_id;
   if (!client_id) {
      throw new UserNotFoundError("Client id is required");
   }
   const token = await KeyTokenService.findByUserId(client_id);
   if (!token) {
      throw new UserNotFoundError("Client id is invalid");
   }
   const accessToken = req.headers.authorization;
   if (!accessToken) {
      throw new UserNotFoundError("Access token is required");
   }
   jwt.verify(accessToken, token.publicKey, (error, decoded) => {
      if (error) {
         throw new TokenExpiredError("Access token is invalid");
      }
      if (decoded.userId !== client_id) {
         throw new UnauthorizedError("Client id is invalid");
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
