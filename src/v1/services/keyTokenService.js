"use strict";
const KeyToken = require("../models/keyTokenModel");
const {Types} = require("mongoose");

class KeyTokenService {
   static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
      try {
         const filter = {user: userId},
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
         return error;
      }
   };

   static findByUserId = async (userId) => {
      return await KeyToken.findOne({user: userId}).lean();
   };

   static removeKeyById = async (userId) => {
      return await KeyToken.deleteOne({_id: userId});
   };

   static findByRefreshTokenUsed = async (refreshToken) => {
      return await KeyToken.findOne({refreshTokensUsed: refreshToken}).lean();
   };

   static findByRefreshToken = async (refreshToken) => {
      return await KeyToken.findOne({refreshToken: refreshToken});
   };

   static deleteKeyById = async (userId) => {
      return await KeyToken.deleteOne({user: new Types.ObjectId(userId)}).lean();
   };
}

module.exports = KeyTokenService;
