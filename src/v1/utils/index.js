"use strict";
const _ = require("lodash");

const getInfoUser = ({fileds = [], object = {}}) => {
   return _.pick(object, fileds);
};

module.exports = getInfoUser;
