"use strict";
const KeyToken = require("../models/keyTokenModel");
const {UnauthorizedError, UserNotFoundError, TokenExpiredError, NotFoundError} = require("../core/errorRespones");
const {Types} = require("mongoose");

class KeyTokenService {
   static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
      try {
         const filter = {user: new Types.ObjectId(userId)},
            update = {
               publicKey,
               privateKey,
               refreshTokensUsed: [],
               refreshToken,
            },
            options = {
               upsert: true,
               new: true,
            };
         const tokens = await KeyToken.findOneAndUpdate(filter, update, options);
         return tokens ? tokens.publicKey : null;
      } catch (error) {
         throw new UnauthorizedError("Error when creating token");
      }
   };

   static findByUserId = async (userId) => {
      try {
         const keyToken = await KeyToken.findOne({user: new Types.ObjectId(userId)}).lean();
         if (!keyToken) {
            throw new UserNotFoundError("Không tìm thấy người dùng trong Token - User not found in Token");
         }
         return keyToken;
      } catch (error) {
         throw new UserNotFoundError("Không tìm thấy người dùng trong Token - User not found in Token");
      }
   };

   static removeKeyById = async (userId) => {
      try {
         const keyToken = await KeyToken.deleteOne({user: new Types.ObjectId(userId)}).lean();
         if (!keyToken) {
            throw new NotFoundError("Không tìm thấy Token để xóa - Token not found to delete");
         }
         return keyToken;
      } catch (error) {
         throw new NotFoundError("Không tìm thấy Token để xóa - Token not found to delete");
      }
   };

   static findByRefreshTokenUsed = async (refreshToken) => {
      const RefreshToken = await KeyToken.findOne({refreshTokensUsed: refreshToken});
      return RefreshToken;
   };

   static findByRefreshToken = async (refreshToken) => {
      try {
         const keyToken = await KeyToken.findOne({refreshToken}).lean();
         if (!keyToken) {
            throw new NotFoundError("Không tìm thấy Token - Token not found");
         }
         return keyToken;
      } catch (error) {
         throw new NotFoundError("Không tìm thấy Token - Token not found");
      }
   };

   static deleteKeyById = async (userId) => {
      try {
         const keyToken = await KeyToken.deleteOne({user: new Types.ObjectId(userId)});
         if (!keyToken) {
            throw new NotFoundError("Không tìm thấy Token để xóa - Token not found to delete");
         }
         return keyToken;
      } catch (error) {
         throw new NotFoundError("Không tìm thấy Token để xóa - Token not found to delete");
      }
   };
}

module.exports = KeyTokenService;
