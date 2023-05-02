import dotenv from "dotenv";
const envFound = dotenv.config();

if (envFound.error) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * env
   */
  env: process.env.NODE_ENV as string,
  /**
   * PORT
   */
  port: parseInt(process.env.PORT as string, 10) as number,
};
