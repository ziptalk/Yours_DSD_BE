import { Request, Response, NextFunction } from "express";

const success = (res: Response, status: number, message: string, data?: any) => {
  const result = {
    status,
    success: true,
    message,
    data,
  };
  res.status(status).send(result);
};

const fail = async (res: Response, status: number, message: string) => {
  const result = {
    status,
    success: false,
    message,
  };
  res.status(status).send(result);
};
export { success, fail };
