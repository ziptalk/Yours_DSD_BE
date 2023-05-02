import responseMessage from "../constants/responseMessage";

export interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

const errorGenerator = ({
  msg = responseMessage.INTERNAL_SERVER_ERROR,
  statusCode = 500,
}: {
  msg?: string;
  statusCode: number;
}): void => {
  const err: ErrorWithStatusCode = new Error(msg);
  err.statusCode = statusCode;
  throw err;
};

export default errorGenerator;
