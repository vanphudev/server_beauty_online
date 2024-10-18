"use strict";

const {OK, CREATED, SuccessResponse} = require("../core/successResponse");
const {getBrandsAll} = require("../services/brandService");

class BrandsController {
   getBrandsAll = async (req, res, next) => {
      new SuccessResponse({
         message: "List of all brands",
         data: await getBrandsAll(),
      }).send(res);
   };
}

module.exports = new BrandsController();