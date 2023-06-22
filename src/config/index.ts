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
  walletAddress: process.env.WALLET_ADDRESS as string,
  polygonRPC: process.env.POLYGON_RPC as string,

  ipfsId: process.env.REACT_APP_IPFS_ID as string,
  ipfsSecret: process.env.REACT_APP_IPFS_SECRET as string,

  /**
   * airbridge
   */
  airbridgeLabel: process.env.AIRBRIDGE_LABEL as string,
  airbridgeClientId: process.env.AIRBRIDGE_CLIENTID as string,
  airbridgeToken: process.env.AIRBRIDGE_TOKEN as string,
  airbridgeAppName: process.env.AIRBRIDGE_APP_NAME as string,
};
