import { create } from "ipfs-http-client";
import { ethers } from "ethers";
import { responseMessage } from "../module";
import config from "../config";
import { logger } from "../module/winston";

const ipfsId = config.ipfsId;
const ipfsSecret = config.ipfsSecret;
const auth = "Basic " + Buffer.from(ipfsId + ":" + ipfsSecret).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const uploadMetaIpfs = async (
  name: string | null,
  description: string | null,
  image: string | null,
  video: string | null,
) => {
  let resultPath = "";
  try {
    const result = await client.add(
      JSON.stringify({
        name,
        description,
        image,
        video,
      }),
    );
    resultPath = `https://yoursdsd.infura-ipfs.io/ipfs/${result.path}`;
    logger.info(`IPFS LINK: ${resultPath}`);
    return resultPath;
  } catch (error) {
    logger.error("uploadMetaIpfs에서 에러 발생");
    logger.error(error);
    throw error;
  }
};

const getDeployedAddress = async (transaction: ethers.Contract) => {
  try {
    const rc = transaction;
    const event = rc.events.find((event: any) => event.event === "DeployNFT");
    const [clone, owner] = event.args;
    const transactionHash = event.transactionHash;
    const block = await event.getBlock(); // check minting block timestamp
    const date = new Date(block.timestamp * 1000);

    const data = {
      contractAddress: clone,
      transactionHash: transactionHash,
      date: date,
    };
    return data;
  } catch (error) {
    logger.error("getDeployedAddress에서 에러 발생");
    logger.error(error);
    throw error;
  }
};

const getMethods = (data: any) => {
  try {
    data.abi.map((value: any) => {
      let methodData = value.name + "(";
      value.inputs.map((value1: any) => {
        methodData += "(" + value1.type + " " + value1.name + ")";
      });
      methodData += ");";
      logger.error(methodData);
    });
  } catch (error) {
    logger.error("getMethods에러 에러 발생");
    logger.error(error);
    throw error;
  }
};

export { uploadMetaIpfs, getDeployedAddress, getMethods };
