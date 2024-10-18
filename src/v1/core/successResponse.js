"use strict";

const StatusCode = {
   OK: 200,
   CREATED: 201,
};

const ReasonStatusCode = {
   OK: "SUCCESS",
   CREATED: "CREATED",
};

class SuccessResponse {
   constructor({statusCode = StatusCode.OK, reasonStatusCode = ReasonStatusCode.OK, message, data}) {
      this.status = statusCode;
      this.message = !message ? reasonStatusCode : message;
      this.data = data;
   }

   send(res, headers = {}) {
      return res.status(this.status).json(this);
   }
}

class OK extends SuccessResponse {
   constructor({message, data}) {
      super({message, data});
   }
}

class CREATED extends SuccessResponse {
   constructor({statusCode = StatusCode.CREATED, reasonStatusCode = ReasonStatusCode.CREATED, message, data}) {
      super({statusCode, reasonStatusCode, message, data});
   }
}

module.exports = {
   OK,
   CREATED,
   SuccessResponse,
};
