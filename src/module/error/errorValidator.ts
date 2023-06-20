import { Request, Response, NextFunction } from "express";
import { Result, ValidationError, validationResult } from "express-validator";
import responseMessage from "../constants/responseMessage";
import statusCode from "../constants/statusCode";
import { fail } from "../util";
const errorValidator = (req: Request, res: Response, next: NextFunction) => {
  const errors: Result<ValidationError> = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    let errorMsgs = "";
    for (let i = 0; i < errorList.length; i++) {
      const err: any = errorList[i];
      if (i == errorList.length - 1) {
        errorMsgs += err["location"] + ":" + err["path"];
      } else {
        errorMsgs += err["location"] + ":" + err["path"] + " & ";
      }
    }
    return fail(res, statusCode.BAD_REQUEST, errorMsgs + responseMessage.ERROR_VALIDATOR);
  }
  next();
};

export default errorValidator;
