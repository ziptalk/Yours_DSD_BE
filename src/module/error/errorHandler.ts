import { fail } from "../util";
import { NextFunction, Request, Response } from "express";
import { ErrorWithStatusCode } from "./errorGenerator";

const errorHandler = (
  error: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { message, statusCode } = error;
  return fail(res, statusCode!, message);
};

export default errorHandler;
