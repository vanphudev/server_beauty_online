const express = require("express");
const cookieParser = require("cookie-parser");
const rootRouter = require("./routes");
const device = require("express-device");
const connectDB = require("./db/initDatabase");
require("dotenv").config();
var bodyParser = require("body-parser");
const {default: helmet} = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(
   cors({
      origin: "http://localhost:3000",
      credentials: true,
   })
);

connectDB();
app.use("/api/v1", rootRouter);

app.use((req, res, next) => {
   const error = new Error("Not found");
   error.status = 404;
   next(error);
});

app.use((error, req, res, next) => {
   const statusCode = error.status || 500;
   return res.status(statusCode).json({
      status: "error",
      code: statusCode,
      message: error.message || "Internal Server Error",
   });
});

module.exports = app;
