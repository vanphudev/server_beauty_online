"use strict";

const StatusCode = {
   BAD_REQUEST: 400,
   UNAUTHORIZED: 401,
   FORBIDDEN: 403,
   NOT_FOUND: 404,
   CONFLICT: 409,
   INTERNAL_SERVER_ERROR: 500,
   NOT_FOUND_USER: 405, // Không tìm thấy người dùng
};

const ReasonStatus = {
   BAD_REQUEST: "Bad Request",
   UNAUTHORIZED: "Unauthorized",
   FORBIDDEN: "Forbidden",
   NOT_FOUND: "Not Found",
   CONFLICT: "Conflict",
   INTERNAL_SERVER_ERROR: "Internal Server Error",
   NOT_FOUND_USER: "Không tìm thấy người dùng",
};

class ErrorResponse extends Error {
   constructor(message, status) {
      super(message);
      this.status = status;
   }
}

class ConflictRequestError extends ErrorResponse {
   constructor(message = ReasonStatus.CONFLICT, statusCode = StatusCode.CONFLICT) {
      super(message, statusCode);
   }
}

class BadRequestError extends ErrorResponse {
   constructor(message = ReasonStatus.BAD_REQUEST, statusCode = StatusCode.BAD_REQUEST) {
      super(message, statusCode);
   }
}

class UnauthorizedError extends ErrorResponse {
   constructor(message = ReasonStatus.UNAUTHORIZED, statusCode = StatusCode.UNAUTHORIZED) {
      super(message, statusCode);
   }
}

class ForbiddenError extends ErrorResponse {
   constructor(message = ReasonStatus.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
      super(message, statusCode);
   }
}

class NotFoundError extends ErrorResponse {
   constructor(message = ReasonStatus.NOT_FOUND, statusCode = StatusCode.NOT_FOUND) {
      super(message, statusCode);
   }
}

class InternalServerError extends ErrorResponse {
   constructor(message = ReasonStatus.INTERNAL_SERVER_ERROR, statusCode = StatusCode.INTERNAL_SERVER_ERROR) {
      super(message, statusCode);
   }
}

class UserNotFoundError extends ErrorResponse {
   constructor(message = ReasonStatus.NOT_FOUND_USER, statusCode = StatusCode.NOT_FOUND_USER) {
      super(message, statusCode);
   }
}

module.exports = {
   ErrorResponse,
   ConflictRequestError,
   BadRequestError,
   UnauthorizedError,
   ForbiddenError,
   NotFoundError,
   InternalServerError,
   UserNotFoundError,
};
