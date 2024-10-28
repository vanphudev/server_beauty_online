"use strict";

const {BadRequestError, UserNotFoundError} = require("../core/errorRespones");
const {Types} = require("mongoose");
const validator = require("validator");
const Users = require("../models/userModel");
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const {createTokenPair, verifyToken} = require("../Auth/authUtils");
const KeyTokenService = require("./keyTokenService");
const getInfoUser = require("../utils");

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

const updateUser = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   const {id, name, email, phone, address, bio} = body;
   // Kiểm tra id (bắt buộc và là số)
   if (!id || typeof id !== "string" || id.trim() === "") {
      throw new BadRequestError("ID is required and must be a non-empty string!");
   }

   // Kiểm tra name (bắt buộc)
   if (!name || typeof name !== "string" || name.trim() === "") {
      throw new BadRequestError("Name is required and must be a non-empty string!");
   }

   // Kiểm tra email (bắt buộc và đúng định dạng email)
   if (!email || typeof email !== "string" || !validator.isEmail(email)) {
      throw new BadRequestError("Email is required and must be a valid email address!");
   }

   // Kiểm tra phone (bắt buộc và là số)
   if (!phone || typeof phone !== "string" || phone.trim() === "" || !validator.isMobilePhone(phone, "vi-VN")) {
      throw new BadRequestError("Phone is required and must be a valid phone number!");
   }

   // Kiểm tra address (bắt buộc) là đối tượng gồm address, province, district, ward
   if (!address || typeof address !== "object") {
      throw new BadRequestError("Address is required and must be an object!");
   }

   if (!address.address || typeof address.address !== "string" || address.address.trim() === "") {
      throw new BadRequestError("Address is required and must be a non-empty string!");
   }

   if (!address.province || typeof address.province !== "string" || address.province.trim() === "") {
      throw new BadRequestError("Province is required and must be a non-empty string!");
   }

   if (!address.district || typeof address.district !== "string" || address.district.trim() === "") {
      throw new BadRequestError("District is required and must be a non-empty string!");
   }

   if (!address.ward || typeof address.ward !== "string" || address.ward.trim() === "") {
      throw new BadRequestError("Ward is required and must be a non-empty string!");
   }

   if (bio && (typeof bio !== "string" || bio.length > 250)) {
      throw new BadRequestError("Bio must be a string with a maximum length of 250 characters if provided!");
   }

   const email_user = await Users.findOne({email}).lean();
   if (email_user && email_user._id.toString() !== id) {
      throw new BadRequestError("Email is already in use!");
   }

   const phone_user = await Users.findOne({phone}).lean();
   if (phone_user && phone_user._id.toString() !== id) {
      throw new BadRequestError("Phone is already in use!");
   }

   try {
      const {publicKey, privateKey} = keyStore;
      const KeyStore = await KeyTokenService.createKeyToken({userId: id, publicKey, privateKey});
      if (!KeyStore) {
         throw new InternalServerError("Tạo key token không thành công!");
      }
      const tokens = await createTokenPair({userId: id, email}, publicKey, privateKey);
      const user = await Users.findOneAndUpdate(
         {_id: new Types.ObjectId(clientId)},
         {email, fullName: name, phone, address, bio},
         {new: true}
      ).lean();
      if (!user) {
         throw new UserNotFoundError("User not found!");
      }
      return {
         code: 200,
         data: {
            user: getInfoUser({fileds: ["email", "phone", "fullName", "_id", "bio", "address"], object: user}),
            tokens,
         },
      };
   } catch (error) {
      throw new BadRequestError("Error when updating user " + error);
   }
};

const changePassword = async ({keyStore, body}) => {
   const clientId = keyStore.user;
   if (!clientId) {
      throw new UserNotFoundError("Client id is required - Không tìm thấy người dùng.");
   }

   const {id, oldPassword, newPassword, confirmPassword} = body;
   if (!id || typeof id !== "string" || id.trim() === "") {
      throw new BadRequestError(
         "ID is required and must be a non-empty string! - ID là bắt buộc và không được để trống!"
      );
   }

   if (!oldPassword || typeof oldPassword !== "string" || oldPassword.trim() === "") {
      throw new BadRequestError(
         "Old password is required and must be a non-empty string! - Mật khẩu cũ là bắt buộc và không được để trống!"
      );
   }

   if (!newPassword || typeof newPassword !== "string" || newPassword.trim() === "") {
      throw new BadRequestError(
         "New password is required and must be a non-empty string! - Mật khẩu mới là bắt buộc và không được để trống!"
      );
   }

   if (!confirmPassword || typeof confirmPassword !== "string" || confirmPassword.trim() === "") {
      throw new BadRequestError(
         "Confirm password is required and must be a non-empty string! - Mật khẩu xác nhận là bắt buộc và không được để trống!"
      );
   }

   const errors = validatePassword(newPassword);
   if (errors.length > 0) {
      throw new BadRequestError(errors.join(" "));
   }

   if (newPassword !== confirmPassword) {
      throw new BadRequestError(
         "Confirm password must match new password! - Mật khẩu xác nhận phải trùng với mật khẩu mới!"
      );
   }

   const user = await Users.findOne({_id: new Types.ObjectId(clientId)}).lean();
   if (!user) {
      throw new UserNotFoundError("User not found! - Người dùng không tồn tại!");
   }

   const isMatch = await bycrypt.compare(oldPassword, user.password);
   if (!isMatch) {
      throw new BadRequestError("Old password is incorrect! - Mật khẩu cũ không chính xác!");
   }

   const isMatchNew = await bycrypt.compare(newPassword, user.password);
   if (isMatchNew) {
      throw new BadRequestError(
         "New password must be different from old password! - Mật khẩu mới phải khác mật khẩu cũ!"
      );
   }

   const passwordHash = await bycrypt.hash(password, 10);
   const updatedUser = await Users.findOneAndUpdate(
      {_id: new Types.ObjectId(clientId)},
      {password: passwordHash},
      {new: true}
   ).lean();

   if (!updatedUser) {
      throw new UserNotFoundError("User not found! - Người dùng không tồn tại!");
   }

   return {
      code: 200,
      message: "Change password successfully! - Đổi mật khẩu thành công!",
   };
};

module.exports = {
   updateUser,
   changePassword,
};
