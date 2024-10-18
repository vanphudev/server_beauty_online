const mongoose = require("mongoose");

const COLLECTION_NAME = "users";
const DOCUMENT_NAME = "Users";

const addressSchema = new mongoose.Schema({
   tinh: {type: String, required: true},
   quan: {type: String, required: true},
   huyen: {type: String, required: true},
   tenDuong: {type: String, required: true},
});

const userSchema = new mongoose.Schema(
   {
      email: {type: String, required: true, unique: true, trim: true, index: true},
      password: {type: String, required: true, trim: true},
      fullName: {type: String, required: true, trim: true},
      address: {type: addressSchema},
      phone: {type: String, required: true, trim: true, index: true},
      is_active: {type: Boolean, default: true, default: true},
      roles: {
         type: [String],
         default: ["customer"],
         enum: ["customer", "admin", "staff"],
      },
   },
   {
      timestamps: true,
      collection: COLLECTION_NAME,
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, userSchema);
