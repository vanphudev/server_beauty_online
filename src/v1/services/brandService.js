"use strict";

const Brands = require("../models/brandModel");

const getBrandsAll = async () => {
   const brands = await Brands.find().lean();
   return {
      brands,
      totalBrands: brands.length,
   };
};

module.exports = {
   getBrandsAll,
};