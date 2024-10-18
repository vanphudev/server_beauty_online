const app = require("../app");
require("dotenv").config();

const dev = {
   app: {
      port: process.env.SERVER_PORT || 5555,
      host: process.env.SERVER_HOST || "localhost",
   },
   db: {
      host: process.env.DEV_DB_MONGO_HOST || "localhost",
      port: process.env.DEV_DB_MONGO_PORT || 27017,
      name: process.env.DEV_DB_MONGO_NAME || "da_beauty_online",
   },
};
const pro = {
   app: {
      port: process.env.SERVER_PORT || 5555,
      host: process.env.SERVER_HOST || "localhost",
   },
   db: {
      host: process.env.PRO_DB_MONGO_HOST || "localhost",
      port: process.env.PRO_DB_MONGO_PORT || 27017,
      name: process.env.PRO_DB_MONGO_NAME || "da_beauty_online",
   },
};

const config = {dev, pro};
const env = process.env.NODE_ENV || "dev";
console.log(
   `NODE_ENV: ${env}` +
      " - " +
      `PORT: ${config[env].app.port}` +
      " - " +
      `mongodb://${config[env].db.host}:${config[env].db.port}/${config[env].db.name}`
);
module.exports = config[env];
