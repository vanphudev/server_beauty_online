"use strict";
const mongoose = require("mongoose");
require("dotenv").config();
const {
   db: {host, port, name},
} = require("../configs/configMongoDB");

const dbURI = `mongodb://${host}:${port}/${name}`;

class Database {
   constructor() {
      this._connect();
   }

   _connect(type = "mongodb") {
      if (1 === 1) {
         mongoose.set("debug", true);
         mongoose.set("debug", {color: true});
      }
      mongoose
         .connect(dbURI)
         .then(() => {
            console.log("Kết nối MongoDB thành công!");
         })
         .catch((error) => {
            console.error("Kết nối MongoDB lỗi: ", error.message);
            process.exit(1);
         });
   }

   static async getInstance() {
      if (!Database.instance) {
         Database.instance = new Database();
      }
      return Database.instance;
   }

   static async close() {
      await Database.instance.close();
   }
}

const connectDB = Database.getInstance;

module.exports = connectDB;
