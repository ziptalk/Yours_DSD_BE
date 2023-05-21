import { create } from "ipfs-http-client";
import { ethers } from "ethers";
import { responseMessage } from "../module";
import config from "../config";

const ipfsId = config.ipfsId;
const ipfsSecret = config.ipfsSecret;
const auth =
  "Basic " + Buffer.from(ipfsId + ":" + ipfsSecret).toString("base64");

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
  image: string | null
) => {
  let resultPath = "";
  try {
    const result = await client.add(
      JSON.stringify({
        name,
        description,
        image,
      })
    );
    resultPath = `https://ipfs.infura.io/ipfs/${result.path}`;
    return resultPath;
  } catch (error) {
    console.log(error);
    return responseMessage.META_ERROR;
  }
};

const uploadBenefitIpfs = async (benefits: Object[]) => {
  let resultPath = "";
  try {
    const result = await client.add(
      JSON.stringify({
        benefits,
      })
    );
    resultPath = `https://ipfs.infura.io/ipfs/${result.path}`;
    return resultPath;
  } catch (error) {
    console.log(error);
    return responseMessage.BENEFIT_DATA_ERROR;
  }
};
const getDeployedAddress = async (transaction: ethers.Contract) => {
  const rc = await transaction.wait();
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
};

const getMethods = (data: any) => {
  data.abi.map((value: any) => {
    let methodData = value.name + "(";
    value.inputs.map((value1: any) => {
      methodData += "(" + value1.type + " " + value1.name + ")";
    });
    methodData += ");";
    console.log(methodData);
  });
};

export { uploadMetaIpfs, uploadBenefitIpfs, getDeployedAddress, getMethods };
