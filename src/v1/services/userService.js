"use strict";

const Users = require("../models/userModel");

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

module.exports = findByEmail;
