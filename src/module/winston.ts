import winston from "winston";
import "winston-daily-rotate-file";
import config from "../config";
import moment from "moment-timezone";
const logDir = "./logs";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = config.env || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const printFormat = winston.format.printf((info) => {
  let logString = `${info.timestamp} ${info.level}  -> ${info.message}`;
  if (info.level == "error") {
    logString += `\n ${info.stack}`;
  }
  return logString;
});
moment.tz.setDefault("Asia/Seoul"); // 로그 시간대 한국 기준으로 변경
const timeStamp = () => moment().format("YYYY-MM-DD HH:mm:ss");
const format = winston.format.combine(
  winston.format.timestamp({ format: `${timeStamp()}  ||` }),
  printFormat,
);

const logger = winston.createLogger({
  format,
  level: level(),
  transports: [
    new winston.transports.DailyRotateFile({
      level: "info", // info 레벨 이상( error, warn, info) 에 대한 모든 로그 저장
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.log`,
      zippedArchive: true,
      handleExceptions: true,
      maxFiles: 30, // 30일치 로그 파일
    }),
    new winston.transports.DailyRotateFile({
      level: "error", // error가 최상위 레벨이므로 에러에 대한 로그만 따로 저장
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/error",
      filename: `%DATE%.error.log`,
      zippedArchive: true,
      maxFiles: 30, // 30일치 로그 파일
    }),
    new winston.transports.Console({
      handleExceptions: true,
    }),
  ],
});

const stream = {
  write: (message: string) => {
    logger.info(`${message}`);
  },
};
export { logger, stream };
