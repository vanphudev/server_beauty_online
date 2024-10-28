const mongoose = require("mongoose");

const COLLECTION_NAME = "users";
const DOCUMENT_NAME = "Users";

const addressSchema = new mongoose.Schema({
   province: {type: String, required: true},
   district: {type: String, required: true},
   ward: {type: String, required: true},
   address: {type: String, required: true},
});

const userSchema = new mongoose.Schema(
   {
      email: {type: String, required: true, unique: true, trim: true, index: true},
      password: {type: String, required: true, trim: true},
      fullName: {type: String, required: true, trim: true},
      address: {type: addressSchema},
      bio: {type: String, trim: true},
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
