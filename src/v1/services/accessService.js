"use strict";
const Users = require("../models/userModel");
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const {createTokenPair, verifyToken} = require("../Auth/authUtils");
const KeyTokenService = require("./keyTokenService");
const getInfoUser = require("../utils");
const {BadRequestError, InternalServerError, NotFoundError} = require("../core/errorRespones");
var validator = require("validator");
const e = require("express");

const findByEmail = async (
   email,
   select = {
      email: 1,
      password: 1,
      _id: 1,
      phone: 1,
      fullName: 1,
      address: 1,
      roles: 1,
      is_active: 1,
   }
) => {
   return await Users.findOne({email}).select(select).lean();
};

const validatePassword = (password) => {
   const errors = [];
   const minLength = 6;

   if (password.length < minLength) {
      errors.push(`Mật khẩu phải có ít nhất ${minLength} ký tự. \n`);
   }
   if (!/[A-Z]/.test(password)) {
      errors.push("Mật khẩu phải có ít nhất 1 chữ hoa. \n");
   }
   if (!/[a-z]/.test(password)) {
      errors.push("Mật khẩu phải có ít nhất 1 chữ thường. \n");
   }
   if (!/[0-9]/.test(password)) {
      errors.push("Mật khẩu phải có ít nhất 1 số. \n");
   }
   if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt. \n");
   }
   return errors;
};

class AccessService {
   static handlerRefreshToken = async (refreshToken) => {
      const foundKeyToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
      if (foundKeyToken) {
         const {userId, email} = verifyToken(refreshToken, foundKeyToken.privateKey);
         await KeyTokenService.deleteKeyById(userId);
         throw new BadRequestError("Token đã được sử dụng! Vui lòng đăng nhập lại!");
      }
      const holderKeyToken = await KeyTokenService.findByRefreshToken(refreshToken);
      if (!holderKeyToken) {
         throw new BadRequestError("Token không tồn tại! - Đăng nhập lại!");
      }
      const {userId, email} = verifyToken(refreshToken, holderKeyToken.privateKey);
      const user = await findByEmail(email);
      if (!user) {
         throw new BadRequestError("User không tồn tại!");
      }

      const tokens = await createTokenPair({userId, email}, holderKeyToken.publicKey, holderKeyToken.privateKey);

      await holderKeyToken.updateOne({
         $set: {
            refreshToken: tokens.refreshToken,
         },
         $addToSet: {
            refreshTokensUsed: refreshToken,
         },
      });
      return {
         user: {userId, email},
         tokens,
      };
   };

   static logOut = async ({keyStore}) => {
      try {
         console.log("keyStore", keyStore);
         const keyToken = await KeyTokenService.removeKeyById(keyStore._id);
         return keyToken;
      } catch (error) {
         console.log("error", error);
      }
   };

   static signIn = async ({email, password, refreshToken = null}) => {
      if (!email) {
         console.log("email", email);
         throw new NotFoundError("Email là bắt buộc!");
      }

      if (!password) {
         throw new NotFoundError("Mật khẩu là bắt buộc!");
      }

      if (!validator.isEmail(email)) {
         throw new BadRequestError("Email không hợp lệ!");
      }

      const errors = validatePassword(password);
      if (errors.length > 0) {
         throw new BadRequestError(errors.join(" "));
      }

      if (refreshToken && !validator.isJWT(refreshToken)) {
         throw new BadRequestError("Refresh token không hợp lệ!");
      }

      const user = await findByEmail(email);
      if (!user) {
         throw new NotFoundError("Email không tồn tại!");
      }

      const isPasswordValid = await bycrypt.compare(password, user.password);
      if (!isPasswordValid) {
         throw new BadRequestError("Mật khẩu không đúng!");
      }

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const tokens = await createTokenPair({userId: user._id, email}, publicKey, privateKey);

      await KeyTokenService.createKeyToken({
         userId: user._id,
         publicKey,
         privateKey,
         refreshToken: tokens.refreshToken,
      });

      return {
         code: 200,
         data: {
            user: getInfoUser({fileds: ["email", "phone", "fullName", "_id"], object: user}),
            tokens,
         },
      };
   };

   static signUp = async ({email, password, phone, fullName}) => {
      if (!email) {
         throw new NotFoundError("Email là bắt buộc!");
      }

      if (!password) {
         throw new NotFoundError("Mật khẩu là bắt buộc!");
      }

      if (!phone) {
         throw new NotFoundError("Số điện thoại là bắt buộc!");
      }

      if (!fullName) {
         throw new NotFoundError("Họ tên là bắt buộc!");
      }

      if (!validator.isEmail(email)) {
         throw new BadRequestError("Email không hợp lệ!");
      }

      const errors = validatePassword(password);
      if (errors.length > 0) {
         throw new BadRequestError(errors.join(" "));
      }

      if (!validator.isMobilePhone(phone)) {
         throw new BadRequestError("Số điện thoại không hợp lệ!");
      }

      if (fullName.length == 0) {
         throw new BadRequestError("Họ tên không được để trống!");
      }

      const user = await Users.findOne({email}).lean();
      if (user) {
         throw new BadRequestError("Email đã tồn tại!");
      }

      const userPhone = await Users.findOne({phone}).lean();
      if (userPhone) {
         throw new BadRequestError("Số điện thoại đã tồn tại!");
      }

      const passwordHash = await bycrypt.hash(password, 10);
      const newUser = await Users.create({email, password: passwordHash, phone, fullName});

      if (newUser) {
         const privateKey = crypto.randomBytes(64).toString("hex");
         const publicKey = crypto.randomBytes(64).toString("hex");
         const KeyStore = await KeyTokenService.createKeyToken({userId: newUser._id, publicKey, privateKey});
         if (!KeyStore) {
            throw new InternalServerError("Tạo key token không thành công!");
         }
         const tokens = await createTokenPair({userId: newUser._id, email}, publicKey, privateKey);
         return {
            code: 201,
            message: "Đăng ký tài khoản thành công!",
            status: "success",
            data: {
               user: getInfoUser({fileds: ["email", "phone", "fullName", "_id"], object: newUser}),
               // tokens,
            },
         };
      }
      throw new BadRequestError("Đăng ký tài khoản không thành công!");
   };
}

module.exports = AccessService;
