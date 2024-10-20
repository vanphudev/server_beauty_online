const mongoose = require("mongoose");

const COLLECTION_NAME = "KeyTokens";
const DOCUMENT_NAME = "key_tokens";
const Users = require("./userModel");

const keyTokenSchema = new mongoose.Schema(
   {
      user: {type: mongoose.Schema.Types.ObjectId, required: true, trim: true, ref: "Users"},
      publicKey: {type: String, required: true, trim: true},
      privateKey: {type: String, required: true, trim: true},
      refreshTokensUsed: {type: Array, default: []},
      refreshToken: {type: String, required: true},
   },
   {
      timestamps: true,
      collection: COLLECTION_NAME,
   }
);

module.exports = mongoose.model(DOCUMENT_NAME, keyTokenSchema);
