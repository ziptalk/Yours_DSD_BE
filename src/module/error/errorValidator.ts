import { Request, Response, NextFunction } from "express";
import { Result, ValidationError, validationResult } from "express-validator";
import responseMessage from "../constants/responseMessage";
import statusCode from "../constants/statusCode";
import { fail } from "../util";
const errorValidator = (req: Request, res: Response, next: NextFunction) => {
  const errors: Result<ValidationError> = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(statusCode.BAD_REQUEST)
      .send(fail(res, statusCode.BAD_REQUEST, responseMessage.BAD_REQUEST));
  }
  next();
};

export default errorValidator;
