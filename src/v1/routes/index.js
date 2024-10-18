const express = require("express");
const rootRouter = express.Router();

rootRouter.use(require("./Vouchers"));
rootRouter.use(require("./Brands"));
rootRouter.use(require("./Categories"));
rootRouter.use(require("./Products"));
rootRouter.use(require("./Access"));
rootRouter.use(require("./Carts"));

rootRouter.use("/test", (req, res) => {
   res.status(200).json({message: "Server Beauty Online - Kết nối thành công -  Sẵn sàng!"});
});

module.exports = rootRouter;
