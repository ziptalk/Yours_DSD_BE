import dotenv from "dotenv";
dotenv.config();
let path;

switch (process.env.NODE_ENV) {
  case "development":
    path = `${__dirname}/../../.env.development`;
    break;
  case "production":
    path = `${__dirname}/../../.env.production`;
    break;
}
const envFound = dotenv.config({ path: path });

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

  mumbaiRPC: process.env.MUMBAI_RPC as string,
  walletSecretKey: process.env.WALLET_SECRET_KEY as string,
};
